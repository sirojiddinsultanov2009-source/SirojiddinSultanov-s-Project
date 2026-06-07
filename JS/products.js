const localProductImages = [
    "assets/images/image 8.png",
    "assets/images/image 9.png",
    "assets/images/image 10.png",
    "assets/images/image 11.png",
    "assets/images/image 14.png",
    "assets/images/image 15.png",
    "assets/images/image 16.png",
    "assets/images/image 17.png"
];

let products = [];
let activeProductList = [];
let showingAllProducts = false;

const FEATURED_VISIBLE_COUNT = 4;

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getProductId(product, index) {
    return product.id ?? product._id ?? product.slug ?? `product-${index}`;
}

function getProductImage(product, index) {
    if (typeof product.image === "string") {
        return product.image;
    }

    if (typeof product.thumbnail === "string") {
        return product.thumbnail;
    }

    if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0];
    }

    return localProductImages[index % localProductImages.length];
}

function getRating(product) {
    if (typeof product.rating === "number") {
        return product.rating;
    }

    if (product.rating && typeof product.rating.rate === "number") {
        return product.rating.rate;
    }

    if (product.rating && typeof product.rating.value === "number") {
        return product.rating.value;
    }

    return null;
}

function getCategory(product) {
    if (typeof product.category === "string") {
        return product.category;
    }

    if (product.category && typeof product.category.name === "string") {
        return product.category.name;
    }

    return "";
}

function getPrice(product) {
    const rawPrice = product.price ?? product.cost ?? product.amount ?? 0;
    const price = Number(String(rawPrice).replace(/[^\d.]/g, ""));

    return Number.isFinite(price) ? price : 0;
}

function normalizeProduct(product, index) {
    return {
        id: String(getProductId(product, index)),
        name: product.name ?? product.title ?? product.productName ?? "Unnamed product",
        price: getPrice(product),
        image: getProductImage(product, index),
        rating: getRating(product),
        category: getCategory(product)
    };
}

function formatPrice(price) {
    return `$${Number(price).toFixed(2).replace(".00", "")}`;
}

function renderProductState(message, type = "loading") {
    const productsList = document.querySelector("#products-list");

    if (!productsList) {
        return;
    }

    productsList.innerHTML = `
        <div class="products-message ${type}">
            ${message}
        </div>
    `;

    updateFeaturedToggle(0);
}

function createProductCard(product) {
    const likedClass = isProductLiked(product.id) ? "liked" : "";
    const productId = escapeHTML(product.id);
    const productName = escapeHTML(product.name);
    const categoryText = product.category ? `<span>${escapeHTML(product.category)}</span>` : "";
    const productImage = escapeHTML(product.image);
    const ratingText = product.rating ? `<span>Rating: ${escapeHTML(product.rating)}</span>` : "";
    const metaHTML = categoryText || ratingText
        ? `<div class="product-meta">${categoryText}${ratingText}</div>`
        : "";

    return `
        <article class="product-card" data-product-id="${productId}">
            <button class="like-btn ${likedClass}" type="button" data-like-id="${productId}" aria-label="Like ${productName}"></button>

            <div class="product-image">
                <img src="${productImage}" alt="${productName}">
            </div>

            <div class="product-info">
                <div class="product-top">
                    <h3>${productName}</h3>
                    <span>${formatPrice(product.price)}</span>
                </div>

                ${metaHTML}

                <div class="product-bottom">
                    <div class="colors" aria-hidden="true">
                        <span class="black"></span>
                        <span class="pink"></span>
                        <span class="beige"></span>
                        <span class="brown"></span>
                    </div>

                    <button class="buy-btn" type="button" data-cart-id="${productId}">Buy</button>
                </div>
            </div>
        </article>
    `;
}

function getVisibleProducts(productList, shouldLimit) {
    if (!shouldLimit || showingAllProducts) {
        return productList;
    }

    return productList.slice(0, FEATURED_VISIBLE_COUNT);
}

function updateFeaturedToggle(totalProducts) {
    const featuredToggle = document.querySelector("#featured-toggle");

    if (!featuredToggle) {
        return;
    }

    const canToggle = totalProducts > FEATURED_VISIBLE_COUNT;

    featuredToggle.hidden = !canToggle;
    featuredToggle.textContent = showingAllProducts ? "show less" : "view all";
    featuredToggle.setAttribute("aria-expanded", String(showingAllProducts));
}

function renderProducts(productList) {
    const productsList = document.querySelector("#products-list");

    if (!productsList) {
        return;
    }

    activeProductList = productList;
    const shouldLimit = productsList.dataset.featuredList === "true";
    const visibleProducts = getVisibleProducts(productList, shouldLimit);

    if (productList.length === 0) {
        renderProductState("No products found.", "empty");
        return;
    }

    productsList.innerHTML = visibleProducts.map(createProductCard).join("");
    updateFeaturedToggle(productList.length);
}

function addProductToCart(productId) {
    const product = products.find((item) => item.id === String(productId));

    if (!product) {
        return;
    }

    const cartProducts = getCartProducts();
    const existingProduct = cartProducts.find((item) => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cartProducts.push({ ...product, quantity: 1 });
    }

    saveCartProducts(cartProducts);
    updateCartBadge();
}

function filterProducts(searchValue) {
    const value = searchValue.trim().toLowerCase();
    showingAllProducts = false;

    if (!value) {
        renderProducts(products);
        return;
    }

    const filteredProducts = products.filter((product) => {
        return product.name.toLowerCase().includes(value)
            || product.category.toLowerCase().includes(value);
    });

    renderProducts(filteredProducts);
}

async function initProducts() {
    renderProductState("Loading products...");

    try {
        const productData = await fetchProducts();
        products = productData.map(normalizeProduct);
        renderProducts(products);
    } catch (error) {
        renderProductState("Something went wrong. Please try again later.", "error");
    }
}

function initProductEvents() {
    const productsList = document.querySelector("#products-list");
    const searchInput = document.querySelector("#product-search");
    const featuredToggle = document.querySelector("#featured-toggle");

    if (productsList) {
        productsList.addEventListener("click", (event) => {
            const likeButton = event.target.closest("[data-like-id]");
            const cartButton = event.target.closest("[data-cart-id]");

            if (likeButton) {
                const isLiked = toggleProductLike(likeButton.dataset.likeId);
                likeButton.classList.toggle("liked", isLiked);
            }

            if (cartButton) {
                addProductToCart(cartButton.dataset.cartId);
                cartButton.textContent = "Added";

                setTimeout(() => {
                    cartButton.textContent = "Buy";
                }, 900);
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            filterProducts(event.target.value);
        });
    }

    if (featuredToggle) {
        featuredToggle.addEventListener("click", () => {
            showingAllProducts = !showingAllProducts;
            renderProducts(activeProductList);
        });
    }
}
