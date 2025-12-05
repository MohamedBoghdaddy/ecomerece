// public/js/modal.js

// ===============================
// Create Modal HTML Dynamically
// ===============================
export function setupModal() {
  const modalHTML = `
    <div id="modalBg" class="modal-bg">
      <div class="modal">
        <img id="modalImg">
        <h3 id="modalName"></h3>
        <p id="modalPrice"></p>
        <p id="modalDesc"></p>
        <button id="closeModalBtn" class="modal-close-btn">Close</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeModal);
  document.getElementById("modalBg").addEventListener("click", (e) => {
    if (e.target.id === "modalBg") closeModal();
  });
}

// ===============================
// OPEN MODAL WITH PRODUCT DATA
// ===============================
export function openModal({ image, name, price, description }) {
  const modalBg = document.getElementById("modalBg");

  document.getElementById("modalImg").src = image;
  document.getElementById("modalName").innerText = name;
  document.getElementById("modalPrice").innerText = "$" + price;
  document.getElementById("modalDesc").innerText =
    description || "No description available.";

  modalBg.style.display = "flex";
  modalBg.classList.add("modal-show");
}

// ===============================
// CLOSE MODAL
// ===============================
export function closeModal() {
  const modalBg = document.getElementById("modalBg");

  modalBg.classList.remove("modal-show");

  setTimeout(() => {
    modalBg.style.display = "none";
  }, 200);
}
