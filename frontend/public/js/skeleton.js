// public/js/skeleton.js

/**
 * Render skeleton loading placeholders inside a container.
 *
 * @param {string} containerId  - The ID of the DOM container to render into.
 * @param {number} count        - Number of skeleton cards to render.
 */
export function renderSkeletons(containerId, count = 4) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = ""; // clear old content

  for (let i = 0; i < count; i++) {
    container.innerHTML += `
      <div class="product-card">
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-line" style="width: 80%; margin-top:12px;"></div>
        <div class="skeleton skeleton-line" style="width: 60%;"></div>
      </div>
    `;
  }
}

/**
 * Clear skeletons and prepare container for real data.
 *
 * @param {string} containerId - ID of the DOM container
 */
export function clearSkeletons(containerId) {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = "";
}
