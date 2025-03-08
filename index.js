const contentTap = document.querySelector(".contentTap");
const listProduct = document.querySelector(".listProduct");
const urlAPI = "http://localhost:3009/products";
let sortOrder = "asc";
const fetchAPI = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error("Failed to fetch");
    }
    return res.json();
  } catch (error) {
    console.log(error);
  }
};

// render listproduct ra màn hình
const renderListProducts = async (reset = false) => {
  const products = await fetchAPI(urlAPI);
  if (!reset) {
    products.sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price
    );
  }
  listProduct.innerHTML = products
    .map(
      (product) => `
        <div class="item" data-id='${product.id}'>
          <a href="detail.html?id=${product.id}">
            <img src="${product.image}"/>
          </a>
          <h2 class="name">${product.name}</h2>
          <div class="price">${product.price}$</div>
          <button class="addCart" data-id='${product.id}'>Add To Cart</button>
        </div>
        `
    )
    .join("");
};

const homeLink = document.querySelector("header .title a");
if (homeLink) {
  homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    const searchInput = document.querySelector(".debouceSearch");
    if (searchInput) {
      searchInput.value = "";
    }

    renderListProducts(true);
  });
}

const iconCart = document.querySelector(".icon-cart");
const listCart = document.querySelector(".listCart");
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const body = document.querySelector("body");
const cartTap = document.querySelector(".cartTap");
const products = await fetchAPI(urlAPI);

/////////////////////////////////////////////// add to Cart
export const addToCart = (
  productId,
  name,
  price,
  image,
  quantity,
  quantityPlace = 1,
  e
) => {
  const item = e.target.closest(".item");
  const existingItem = cart.find((item) => item.id == productId);
  if (existingItem) {
    cart = cart.map((item) =>
      item.id == productId
        ? { ...existingItem, quantity: existingItem.quantity + quantityPlace }
        : item
    );
  } else {
    cart.push({ id: productId, name, price, image, quantity: quantityPlace });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("storage"));
  renderProducts();
};

/////////////////////////////////////////////// render Products
const renderProducts = () => {
  const products = JSON.parse(localStorage.getItem("cart")) || [];
  const totalHTML = document.querySelector(".icon-cart span");
  let totalQuantity = products.reduce((sum, item) => sum + item.quantity, 0);

  listCart.innerHTML = products.length
    ? products
        .map(
          (item) => `
          <div class="item" data-id="${item.id}">
            <div class='image'><img src="${item.image}" alt=""></div>
            <div class='name'>${item.name}</div>
            <div class='totalPrice'>${item.price * item.quantity}$</div>
            <div class="quantity">
              <span class='minus' data-id="${item.id}">-</span>
        <input type="number" class="inputCart" value="${item.quantity}" min="1">
              <span class='plus' data-id="${item.id}">+</span>
            </div>
          </div>
        `
        )
        .join("")
    : "<p style='text-align: center; color:#ccc; font-style:italic'>Giỏ hàng trống</p>";

  totalHTML.innerHTML = totalQuantity;
};

/////////////////////////////////////////////// handle Cart
export const handleCart = async (e, productId) => {
  const existingItem = cart.find((item) => item.id === productId);
  if (!existingItem) return;

  if (e.target.closest(".plus")) {
    cart = cart.map((item) =>
      item.id == productId ? { ...item, quantity: item.quantity + 1 } : item
    );
  }

  if (e.target.closest(".minus")) {
    if (existingItem.quantity > 1) {
      cart = cart.map((item) =>
        item.id == productId ? { ...item, quantity: item.quantity + -1 } : item
      );
    } else {
      cart = cart.filter((item) => item.id !== productId);
    }
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderProducts();
};

/////////////////////////////////////////////// Debounce Search
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
const searchInput = document.querySelector(".debouceSearch");

const handleSearch = async (query) => {
  const products = await fetchAPI(urlAPI);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  listProduct.innerHTML = filteredProducts.length
    ? filteredProducts
        .map(
          (product) => `
            <div class="item" data-id='${product.id}'>
              <a href="detail.html?id=${product.id}">
                <img src="${product.image}"/>
              </a>
              <h2 class="name">${product.name}</h2>
              <div class="price">${product.price}$</div>
              <button class="addCart" data-id='${product.id}'>Add To Cart</button>
            </div>
          `
        )
        .join("")
    : "<p>Không tìm thấy sản phẩm nào!</p>";
};

const debounceSearch = debounce(handleSearch, 500);
searchInput?.addEventListener("input", (e) => debounceSearch(e.target.value));

document.querySelector(".sort")?.addEventListener("click", () => {
  sortOrder = sortOrder === "asc" ? "desc" : "asc";
  renderListProducts();
});

//////////////////////////////////

listCart.addEventListener("change", (e) => {
  const input = e.target;
  if (e.target.closest(".inputCart")) {
    let newQuantity = parseInt(input.value);
    if (Number.isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
      input.value = 1;
    }
    const itemElement = input.closest(".item");
    const productId = itemElement.dataset.id;
    cart = cart.map((item) =>
      item.id == productId ? { ...item, quantity: newQuantity } : item
    );
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  renderProducts();
});

//////////////////////////////////
iconCart?.addEventListener("click", () => {
  body.classList.toggle("activeTabCart");
});
//////////////////////////////////
listCart?.addEventListener("click", (e) => {
  if (e.target.classList.contains("inputCart")) return;
  const item = e.target.closest(".item");
  let productId = item?.dataset.id;
  handleCart(e, productId);
});
//////////////////////////////////
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("addCart")) {
    const button = e.target;
    const item = button.closest(".item");
    const productId = item?.dataset.id;
    const name = item?.querySelector(".name").innerText;
    const existingItem = cart.find((product) => product.id == productId);
    const quantity = existingItem ? existingItem.quantity : 1;
    const quantityPlace = 1;
    const price = parseFloat(
      item?.querySelector(".price").innerText.replace("$", "")
    );
    const image = item?.querySelector("img").src;

    addToCart(productId, name, price, image, quantity, quantityPlace, e);
  }

  if (!e.target.closest(".cartTap") && e.target.closest(".overlay")) {
    body.classList.remove("activeTabCart");
  }

  if (e.target.classList.contains("close")) {
    body.classList.toggle("activeTabCart");
  }

  if (e.target.classList.contains("checkOut")) {
    if (cart.length === 0) {
      alert("Giỏ hàng đang trống vui lòng thêm sản phẩm vào giỏ hàng");
      return;
    } else {
      localStorage.removeItem("cart");
      cart = [];
      listCart.innerHTML = "<p>Giỏ hàng trống</p>";
      document.querySelector(".icon-cart span").innerText = "0";
      alert("Đặt hàng thành công");
    }
  }
});
//////////////////////////////////
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelector("body").classList.remove("activeTabCart");
  }
});
//////////////////////////////////
renderProducts();

renderListProducts();
window.addEventListener("storage", renderProducts);
