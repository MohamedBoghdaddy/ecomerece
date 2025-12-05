// public/js/favorites.js
//-----------------------------------------------------
// Imports
//-----------------------------------------------------
import {
  getProducts,
  getFavorites,
  addFavorite,
  removeFavorite,
} from "./api.js";

import { openModal, updateFavBadge, showToast } from "./ui.js";
import { renderSkeletons, clearSkeletons } from "./skeleton.js";

let favIds = new Set();

//-----------------------------------------------------
// INITIAL PAGE LOAD
//-----------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  loadFavorites();
  loadProducts();
});

//-----------------------------------------------------
// LOAD FAVORITES FROM BACKEND
//-----------------------------------------------------
async function loadFavorites() {
  try {
    const data = await getFavorites();
    const favs = data.products || [];

    favIds = new Set(favs.map((f) => f._id));
    updateFavBadge(favs.length);
    renderFavList(favs);
  } catch (err) {
    console.error("Failed to load favorites:", err);
  }
}

//-----------------------------------------------------
// RENDER FAVORITES SIDEBAR
//-----------------------------------------------------
function renderFavList(favs) {
  const list = document.getElementById("favList");

  if (!favs.length) {
    list.innerHTML = `<p class="empty-state">No favourites yet.</p>`;
    return;
  }

  list.innerHTML = favs
    .map(
      (p) => `
      <div class="fav-item">
        <span>${p.name} — $${p.price}</span>

        <button class="remove-btn" data-remove="${p._id}">
          Remove
        </button>
      </div>
    `
    )
    .join("");

  // Attach remove events
  document.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await removeFavorite(btn.dataset.remove);
      showToast("Removed from favourites", "info");
      loadFavorites();
      loadProducts();
    });
  });
}

//-----------------------------------------------------
// LOAD PRODUCTS WITH SKELETONS
//-----------------------------------------------------
async function loadProducts() {
  renderSkeletons("favProducts");

  const container = document.getElementById("favProducts");

  try {
    const products = await getProducts();
    clearSkeletons("favProducts");

    container.innerHTML = products
      .map(
        (p) => `
        <div class="product-card">
          
          <img 
            src="${p.image}" 
            class="product-img"
            data-product='${JSON.stringify(p)}'
          >

          <h4>${p.name}</h4>
          <span>$${p.price}</span>

          <div 
            class="heart ${favIds.has(p._id) ? "active" : ""}"
            data-heart="${p._id}"
          >
            ${favIds.has(p._id) ? "♥" : "♡"}
          </div>
        </div>
      `
      )
      .join("");

    attachProductEvents();
  } catch (err) {
    console.error("Failed to load products:", err);
  }
}

//-----------------------------------------------------
// ATTACH PRODUCT EVENTS
//-----------------------------------------------------
function attachProductEvents() {
  // Open modal on product click
  document.querySelectorAll(".product-img").forEach((img) => {
    img.addEventListener("click", () => {
      const product = JSON.parse(img.dataset.product);
      openModal(product);
    });
  });

  // Toggle heart
  document.querySelectorAll("[data-heart]").forEach((heart) => {
    heart.addEventListener("click", () => toggleFavorite(heart.dataset.heart));
  });
}

//-----------------------------------------------------
// ADD / REMOVE FAVORITE
//-----------------------------------------------------
async function toggleFavorite(productId) {
  if (favIds.has(productId)) {
    await removeFavorite(productId);
    showToast("Removed from favourites", "error");
  } else {
    await addFavorite(productId);
    showToast("Added to favourites ❤️", "success");
  }

  loadFavorites();
  loadProducts();
}
