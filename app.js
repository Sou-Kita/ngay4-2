const API = "https://api.escuelajs.co/api/v1/products";

let products = [];
let filtered = [];
let currentPage = 1;
let pageSize = 10;
let sortState = { field: "", asc: true };

/* ========= FETCH ========= */
async function fetchProducts() {
  const res = await fetch(API);
  products = await res.json();
  filtered = products;
  render();
}

/* ========= RENDER ========= */
function render() {
  renderTable();
  renderPagination();
}

function renderTable() {
  const tbody = document.getElementById("productTable");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * pageSize;
  const pageData = filtered.slice(start, start + pageSize);

  pageData.forEach(p => {
    const tr = document.createElement("tr");
    tr.title = p.description;

    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>$${p.price}</td>
      <td>${p.category?.name || ""}</td>
      <td>
        <img
          src="https://picsum.photos/60?random=${p.id}"
          width="60"
          height="60"
          class="rounded border"
        >
      </td>
    `;

    tr.onclick = () => openDetail(p);
    tbody.appendChild(tr);
  });
}

function renderPagination() {
  const total = Math.ceil(filtered.length / pageSize);
  const ul = document.getElementById("pagination");
  ul.innerHTML = "";

  for (let i = 1; i <= total; i++) {
    ul.innerHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <button class="page-link" onclick="goPage(${i})">${i}</button>
      </li>`;
  }
}

/* ========= ACTIONS ========= */
function goPage(p) {
  currentPage = p;
  render();
}

function changePageSize() {
  pageSize = +document.getElementById("pageSize").value;
  currentPage = 1;
  render();
}

/* SEARCH */
searchInput.oninput = e => {
  const key = e.target.value.toLowerCase();
  filtered = products.filter(p =>
    p.title.toLowerCase().includes(key)
  );
  currentPage = 1;
  render();
};

/* SORT */
function sortBy(field) {
  sortState.asc = sortState.field === field ? !sortState.asc : true;
  sortState.field = field;

  filtered.sort((a, b) =>
    sortState.asc
      ? a[field] > b[field] ? 1 : -1
      : a[field] < b[field] ? 1 : -1
  );
  render();
}

/* EXPORT CSV */
function exportCSV() {
  const start = (currentPage - 1) * pageSize;
  const pageData = filtered.slice(start, start + pageSize);

  let csv = "id,title,price,category\n";
  pageData.forEach(p => {
    csv += `${p.id},"${p.title}",${p.price},"${p.category?.name || ""}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "products.csv";
  a.click();
}

/* DETAIL */
function openDetail(p) {
  detailId.value = p.id;
  detailTitle.value = p.title;
  detailPrice.value = p.price;
  detailDescription.value = p.description;

  detailImage.src = `https://picsum.photos/400?random=${p.id}`;

  new bootstrap.Modal(detailModal).show();
}

/* UPDATE */
async function updateProduct() {
  await fetch(`${API}/${detailId.value}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: detailTitle.value,
      price: +detailPrice.value,
      description: detailDescription.value
    })
  });
  alert("Updated!");
}

/* CREATE */
async function createProduct() {
  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: newTitle.value,
      price: +newPrice.value,
      description: newDescription.value,
      categoryId: 1,
      images: [`https://picsum.photos/400?random=${Date.now()}`]
    })
  });

  alert("Created!");
  fetchProducts();
}

fetchProducts();
