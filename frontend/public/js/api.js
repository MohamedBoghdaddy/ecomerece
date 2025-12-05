// public/js/api.js
export const API = "http://localhost:4000";

export async function getProducts() {
  const res = await fetch(`${API}/products`);
  return res.json();
}

export async function getFavorites() {
  const res = await fetch(`${API}/favorites`);
  return res.json();
}

export async function addFavorite(productId) {
  return fetch(`${API}/favorites/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
}

export async function removeFavorite(productId) {
  return fetch(`${API}/favorites/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
}

export async function createProduct(formData) {
  return fetch(`${API}/products`, {
    method: "POST",
    body: formData,
  });
}

export async function updateProduct(id, formData) {
  return fetch(`${API}/products/${id}`, {
    method: "PUT",
    body: formData,
  });
}

export async function deleteProduct(id) {
  return fetch(`${API}/products/${id}`, {
    method: "DELETE",
  });
}
