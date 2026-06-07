const STORAGE_KEYS = {
    likes: "plantify_likes",
    cart: "plantify_cart"
};

function readStorage(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        return fallback;
    }
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getLikedProducts() {
    return readStorage(STORAGE_KEYS.likes, []);
}

function saveLikedProducts(productIds) {
    writeStorage(STORAGE_KEYS.likes, productIds);
}

function getCartProducts() {
    return readStorage(STORAGE_KEYS.cart, []);
}

function saveCartProducts(cartProducts) {
    writeStorage(STORAGE_KEYS.cart, cartProducts);
}

function getCartCount() {
    return getCartProducts().reduce((total, item) => total + item.quantity, 0);
}

function updateCartBadge() {
    const badges = document.querySelectorAll("[data-cart-count]");
    const count = getCartCount();

    badges.forEach((badge) => {
        badge.textContent = count;
        badge.setAttribute("aria-label", `${count} products in cart`);
    });
}
