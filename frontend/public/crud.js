let products = JSON.parse(localStorage.getItem("products")) || [];
let editIndex = -1;
let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

function renderTable() {
  const table = document.getElementById("productTable");
  table.innerHTML = "";

  products.forEach((p, index) => {
    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.price}</td>
        <td>${p.size}</td>
        <td>
          <button class="edit-btn" onclick="editProduct(${index})">Edit</button>
          <button class="delete-btn" onclick="deleteProduct(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function loadProducts(){
  const container = document.getElementById("favProducts");
  container.innerHTML = "";
  products.forEach((p, i) => {
    container.innerHTML += `
      <div class="product">
        <p>${p.name} - $${p.price}</p>
        <button onclick="addFav('${p.name}')">♡ Favourite</button>
      </div>
    `;
  });
}
function saveProduct() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const size = document.getElementById("size").value;

  if (!name || !price || !size) {
    alert("Please fill all fields.");
    return;
  }

  const product = { name, price, size };

  if (editIndex === -1) {
    products.push(product);
  } else {
    products[editIndex] = product;
    editIndex = -1;
  }

  localStorage.setItem("products", JSON.stringify(products));
  clearForm();
  renderTable();
}

function editProduct(i) {
  editIndex = i;
  document.getElementById("name").value = products[i].name;
  document.getElementById("price").value = products[i].price;
  document.getElementById("size").value = products[i].size;
}

function deleteProduct(i) {
  products.splice(i, 1);
  localStorage.setItem("products", JSON.stringify(products));
  renderTable();
}

function addFav(name) {
  if (!favourites.includes(name)) {
    favourites.push(name);
    localStorage.setItem("favourites", JSON.stringify(favourites));
    renderFav();
  }
}

function renderFav() {
  document.getElementById("favList").innerHTML = favourites.join("<br>");
}

window.onload = function () {
  loadProducts();
  renderFav();
};

function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("size").value = "";
}

renderTable();
