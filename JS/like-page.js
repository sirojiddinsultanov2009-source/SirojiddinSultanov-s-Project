function getLikedProductList() {
    const likedIds = getLikedProducts();

    return products.filter((product) => likedIds.includes(product.id));
}

function renderLikedProducts() {
    const likedProducts = getLikedProductList();

    if (likedProducts.length === 0) {
        renderProductState("No liked products yet.", "empty");
        return;
    }

    renderProducts(likedProducts);
}

async function initLikedProductsPage() {
    renderProductState("Loading liked products...");

    try {
        const productData = await fetchProducts();
        products = productData.map(normalizeProduct);
        renderLikedProducts();
    } catch (error) {
        renderProductState("Something went wrong. Please try again later.", "error");
    }
}

function initLikedPageEvents() {
    const productsList = document.querySelector("#products-list");

    productsList.addEventListener("click", (event) => {
        if (event.target.closest("[data-like-id]")) {
            renderLikedProducts();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
    initProductEvents();
    initLikedPageEvents();
    initLikedProductsPage();
});
