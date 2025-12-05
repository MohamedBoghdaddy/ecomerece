// public/js/crud.js
//-----------------------------------------------------
// IMPORTS
//-----------------------------------------------------
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./api.js";

import { renderSkeletons, clearSkeletons } from "./skeleton.js";
import { showToast } from "./ui.js";

let currentEditId = null;

//-----------------------------------------------------
// LOAD ALL PRODUCTS IN TABLE
//-----------------------------------------------------
async function loadProducts() {
  renderSkeletons("productTable", 5, "row");
  const table = document.getElementById("productTable");

  const products = await getProducts();
  clearSkeletons("productTable");
  table.innerHTML = "";

  products.forEach((p) => {
    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.price}</td>
        <td>${p.size || "-"}</td>
        <td>
          <button class="action-btn" data-edit="${p._id}">Edit</button>
          <button class="delete-btn" data-delete="${p._id}">Delete</button>
        </td>
      </tr>
    `;
  });

  attachRowEvents();
}

//-----------------------------------------------------
// ATTACH EDIT + DELETE EVENTS
//-----------------------------------------------------
function attachRowEvents() {
  document
    .querySelectorAll("[data-edit]")
    .forEach((btn) =>
      btn.addEventListener("click", () => editProduct(btn.dataset.edit))
    );

  document
    .querySelectorAll("[data-delete]")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        deleteProductHandler(btn.dataset.delete)
      )
    );
}

//-----------------------------------------------------
// FILL FORM FOR EDITING
//-----------------------------------------------------
async function editProduct(id) {
  const products = await getProducts();
  const p = products.find((item) => item._id === id);

  if (!p) return showToast("Product not found", "error");

  document.getElementById("name").value = p.name;
  document.getElementById("price").value = p.price;
  document.getElementById("size").value = p.size || "";
  document.getElementById("description").value = p.description || "";

  currentEditId = id;
  showToast("Editing product...", "info");
}

//-----------------------------------------------------
// DELETE PRODUCT
//-----------------------------------------------------
async function deleteProductHandler(id) {
  await deleteProduct(id);
  showToast("Product deleted", "error");
  loadProducts();
}

//-----------------------------------------------------
// SAVE BUTTON (CREATE OR UPDATE)
//-----------------------------------------------------
document.getElementById("saveBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const price = document.getElementById("price").value;
  const size = document.getElementById("size").value;
  const desc = document.getElementById("description").value;
  const img = document.getElementById("image").files[0];

  if (!name || !price) {
    return showToast("Name & price are required!", "error");
  }

  const form = new FormData();
  form.append("name", name);
  form.append("price", price);
  form.append("size", size);
  form.append("description", desc);
  if (img) form.append("image", img);

  if (currentEditId) {
    await updateProduct(currentEditId, form);
    showToast("Product updated!", "success");
    currentEditId = null;
  } else {
    await createProduct(form);
    showToast("Product created!", "success");
  }

  document.querySelector("form").reset();
  loadProducts();
});

//-----------------------------------------------------
// INITIALIZE PAGE
//-----------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});
