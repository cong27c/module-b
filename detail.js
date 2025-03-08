import { addToCart, handleCart } from "./index.js";

const detail = document.querySelector(".detail");
const urlAPI = "http://localhost:3009/products";
const listCart = document.querySelector(".listCart");
let cart = JSON.parse(localStorage.getItem("cart")) || [];
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

const renderDetailProduct = async () => {
  const products = await fetchAPI(urlAPI);
  const productId = Number(
    new URLSearchParams(window.location.search).get("id")
  );
  const product = products.find((item) => item.id == productId);
  if (!product) return;
  detail.innerHTML = `
       <div class="slide-image">
            <div class="btns">
                <div class="prev"><</div>
                <div class="next">></div>
            </div>
             <div class="image">
                <img src="${product.image}" alt="" />
                <img src="${product.image}" alt="" />
                <img src="${product.image}" alt="" />
                <img src="${product.image}" alt="" />
            </div>
            <div class="dotList">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
       </div>
        <div class="container">
           <div class="wrap">
                <div class="name">${product.name}</div>
                    <div class="price stuff">${
                      product.quantity
                        ? product.price * product.quantity
                        : product.price
                    }$
                        <div class="upDown">
                            <button class="down">-</button>
                            <span>${
                              product.quantity ? product.quantity : 1
                            }</span>
                            <button class="up">+</button>
                        </div>
                </div>
                <div class="stock">Stock: ${product.stock}</div>
           </div>
        <div class="buttons">
            <button class="checkOut ">Check out</button>
            <button class="addToCart" data-id="${
              product.id
            }">Add to Cart</button>
            <div class="description">${product.description}</div>
        </div>
        </div>
    `;
  document.querySelector(".addToCart").addEventListener("click", (e) => {
    const quantityPlace = product.quantity ? product.quantity : 1;
    if (quantityPlace > product.stock) {
      alert("Số lượng vượt quá tồn kho!");
      e.stopPropagation();
      return;
    }
    addToCart(
      product.id,
      product.name,
      product.price,
      product.image,
      product.quantity,
      quantityPlace,
      e
    );
  });
  setupSlider();
};

const handleQuantity = async (e) => {
  const products = await fetchAPI(urlAPI);
  const item = e.target.closest(".detail .container");
  const productId = Number(
    new URLSearchParams(window.location.search).get("id")
  );
  const existingItem = products.find((product) => product.id == productId);

  if (!existingItem) return;
  let currentQuantity = existingItem.quantity
    ? Number(existingItem.quantity)
    : 1;

  if (e.target.closest(".up")) {
    await fetchAPI(`${urlAPI}/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...existingItem,
        quantity: Number(currentQuantity) + 1,
      }),
    });
  }
  if (e.target.closest(".down")) {
    await fetchAPI(`${urlAPI}/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...existingItem,
        quantity: Number(currentQuantity) - 1,
      }),
    });
  }
  renderDetailProduct();
};

const setupSlider = () => {
  let current = 0;
  const listImage = document.querySelector(".image");
  const imgs = document.querySelectorAll(".image img");
  const next = document.querySelector(".next");
  const prev = document.querySelector(".prev");
  const dots = document.querySelectorAll(".dot");
  const length = imgs.length;

  function updateDots() {
    dots.forEach((dot) => {
      dot.classList.remove("active");
    });
    dots[current].classList.add("active");
  }
  updateDots();

  const handleSlideShow = () => {
    if (current == length - 1) {
      current = 0;
      listImage.style.transform = `translateX(0px)`;
    } else {
      current++;
      const width = imgs[0].offsetWidth;
      listImage.style.transform = `translateX(${width * -1 * current}px)`;
    }
    updateDots();
  };

  next.addEventListener("click", (e) => {
    e.stopPropagation();
    handleSlideShow();
  });

  prev.addEventListener("click", (e) => {
    e.stopPropagation();
    if (current == 0) {
      current = length - 1;
    } else {
      current--;
    }
    const width = imgs[0].offsetWidth;
    listImage.style.transform = `translateX(${width * -1 * current}px)`;
    updateDots();
  });
};

detail.addEventListener("click", handleQuantity);

listCart.addEventListener("click", (e) => {
  if (e.target.classList.contains("inputCart")) return;
  const itemElement = e.target.closest(".item");
  if (!itemElement) return;
  const productId = Number(itemElement.dataset.id);
  handleCart(e, productId);
});
renderDetailProduct();
