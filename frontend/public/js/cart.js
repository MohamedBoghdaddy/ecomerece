// public/js/cart.js
//-----------------------------------------------------
// Imports
//-----------------------------------------------------
import { getProducts } from "./api.js";
import { renderSkeletons, clearSkeletons } from "./skeleton.js";
import { showToast } from "./ui.js";

//-----------------------------------------------------
// CART STATE (stored in memory)
//-----------------------------------------------------
let cart = []; // [{ id, name, price, qty }]

//-----------------------------------------------------
// INITIAL PAGE LOAD
//-----------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  loadShop();
  renderCart();
});

//-----------------------------------------------------
// LOAD PRODUCTS INTO SHOP
//-----------------------------------------------------
async function loadShop() {
  renderSkeletons("shop", 6);

  const products = await getProducts();
  const shop = document.getElementById("shop");

  clearSkeletons("shop");
  shop.innerHTML = "";

  shop.innerHTML = products
    .map(
      (p) => `
      <div class="product">
        <img src="${p.image}" 
             style="width:100%; height:120px; object-fit:cover; border-radius:8px; margin-bottom:8px;">

        <h3>${p.name}</h3>
        <p>$${p.price}</p>

        <input 
          type="number" 
          class="qty-input"
          data-id="${p._id}" 
          value="1" 
          min="1"
        >

        <button 
          class="add-btn"
          data-id="${p._id}" 
          data-name="${p.name}" 
          data-price="${p.price}"
        >
          Add to Cart
        </button>
      </div>
    `
    )
    .join("");

  attachAddToCartEvents();
}

//-----------------------------------------------------
// ATTACH EVENTS TO ADD BUTTONS
//-----------------------------------------------------
function attachAddToCartEvents() {
  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);

      const qtyInput = document.querySelector(`.qty-input[data-id="${id}"]`);
      const qty = parseInt(qtyInput.value) || 1;

      addToCart(id, name, price, qty);
      showToast(`${name} added to cart!`, "success");

      // quick button animation
      btn.style.transform = "scale(0.92)";
      setTimeout(() => (btn.style.transform = "scale(1)"), 120);
    });
  });
}

//-----------------------------------------------------
// ADD TO CART
//-----------------------------------------------------
function addToCart(id, name, price, qty) {
  const item = cart.find((i) => i.id === id);

  if (item) {
    item.qty += qty;
  } else {
    cart.push({ id, name, price, qty });
  }

  renderCart();
}

//-----------------------------------------------------
// UPDATE CART QUANTITY
//-----------------------------------------------------
function updateQty(id, qty) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;

  item.qty = qty <= 0 ? 1 : qty;
  renderCart();
}

//-----------------------------------------------------
// REMOVE ITEM FROM CART
//-----------------------------------------------------
function removeItem(id) {
  cart = cart.filter((item) => item.id !== id);
  renderCart();
  showToast("Item removed from cart", "error");
}

//-----------------------------------------------------
// RENDER CART UI
//-----------------------------------------------------
function renderCart() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("total");

  container.innerHTML = "";

  let total = 0;

  container.innerHTML = cart
    .map((item) => {
      total += item.price * item.qty;

      return `
        <div>
          <span>${item.name} – $${item.price}</span>

          <span>
            <input 
              type="number"
              class="cart-qty"
              min="1"
              value="${item.qty}"
              data-update="${item.id}"
            >

            <button 
              class="remove-btn"
              data-remove="${item.id}"
            >
              Remove
            </button>
          </span>
        </div>
      `;
    })
    .join("");

  totalEl.textContent = total.toFixed(2);

  attachCartEvents();
}

//-----------------------------------------------------
// ATTACH EVENTS INSIDE CART
//-----------------------------------------------------
function attachCartEvents() {
  // Update qty
  document.querySelectorAll("[data-update]").forEach((input) => {
    input.addEventListener("change", () => {
      updateQty(input.dataset.update, parseInt(input.value));
    });
  });

  // Remove item
  document.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeItem(btn.dataset.remove);
    });
  });
}
