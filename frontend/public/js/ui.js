// public/js/ui.js

/* ===========================================================
   DOM UTILITIES
   =========================================================== */

/** Get element by ID */
export function el(id) {
  return document.getElementById(id);
}

/** Create element */
export function create(tag, className = "") {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

/* ===========================================================
   MODAL SUPPORT (Product Popup)
   =========================================================== */

/**
 * Opens a modal with product data.
 * @param {Object} product - Product object { name, price, description, image }
 */
export function openModal(product) {
  const bg = el("modalBg");
  if (!bg) return console.warn("Modal elements missing!");

  el("modalImg").src = product.image;
  el("modalName").textContent = product.name;
  el("modalPrice").textContent = `$${product.price}`;
  el("modalDesc").textContent = product.description || "No description";

  bg.style.display = "flex";
}

/** Close modal */
export function closeModal() {
  const bg = el("modalBg");
  if (bg) bg.style.display = "none";
}

// Allow Escape key to close modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ===========================================================
   FAVORITE BADGE (❤️ 5)
   =========================================================== */

/**
 * Update the navbar favorite counter
 * @param {Number} count
 */
export function updateFavBadge(count) {
  const badge = el("favCount");
  if (badge) badge.textContent = count;
}

/* ===========================================================
   TOAST NOTIFICATIONS
   =========================================================== */

let toastTimeout;

/**
 * Show a bottom popup notification
 * @param {String} message
 * @param {String} type - "success" | "error" | "info"
 */
export function showToast(message, type = "success") {
  let toast = el("toast");

  if (!toast) {
    toast = create("div", "toast");
    toast.id = "toast";
    document.body.appendChild(toast);
  }

  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.opacity = 1;

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.style.opacity = 0;
  }, 2200);
}

/* ===========================================================
   SCROLL HELPERS
   =========================================================== */

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
