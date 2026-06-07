function formatCartPrice(price) {
    return `$${Number(price).toFixed(2).replace(".00", "")}`;
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function calculateCartTotal(cartProducts) {
    return cartProducts.reduce((total, product) => {
        return total + Number(product.price) * product.quantity;
    }, 0);
}

function renderEmptyCart() {
    const cartItems = document.querySelector("#cart-items");

    cartItems.innerHTML = `
        <div class="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Choose a plant from the catalog and add it here.</p>
            <a href="index.html#products">Shop products</a>
        </div>
    `;
}

function createCartItem(product) {
    const productId = escapeHTML(product.id);
    const productName = escapeHTML(product.name);
    const productCategory = product.category ? `<p>${escapeHTML(product.category)}</p>` : "";
    const productImage = escapeHTML(product.image);

    return `
        <article class="cart-item" data-cart-item="${productId}">
            <img src="${productImage}" alt="${productName}">

            <div class="cart-item-info">
                <h3>${productName}</h3>
                ${productCategory}
                <strong>${formatCartPrice(product.price)}</strong>
            </div>

            <div class="quantity-control">
                <button type="button" data-cart-decrease="${productId}" aria-label="Decrease quantity">-</button>
                <span>${product.quantity}</span>
                <button type="button" data-cart-increase="${productId}" aria-label="Increase quantity">+</button>
            </div>

            <button class="remove-btn" type="button" data-cart-remove="${productId}">Remove</button>
        </article>
    `;
}

function renderCart() {
    const cartItems = document.querySelector("#cart-items");
    const cartTotal = document.querySelector("#cart-total");
    const cartProducts = getCartProducts();

    updateCartBadge();
    cartTotal.textContent = formatCartPrice(calculateCartTotal(cartProducts));

    if (cartProducts.length === 0) {
        renderEmptyCart();
        return;
    }

    cartItems.innerHTML = cartProducts.map(createCartItem).join("");
}

function updateCartItem(productId, action) {
    const cartProducts = getCartProducts();
    const productIndex = cartProducts.findIndex((product) => product.id === String(productId));

    if (productIndex === -1) {
        return;
    }

    if (action === "increase") {
        cartProducts[productIndex].quantity += 1;
    }

    if (action === "decrease") {
        cartProducts[productIndex].quantity -= 1;

        if (cartProducts[productIndex].quantity <= 0) {
            cartProducts.splice(productIndex, 1);
        }
    }

    if (action === "remove") {
        cartProducts.splice(productIndex, 1);
    }

    saveCartProducts(cartProducts);
    renderCart();
}

function initCartEvents() {
    const cartItems = document.querySelector("#cart-items");

    cartItems.addEventListener("click", (event) => {
        const increaseButton = event.target.closest("[data-cart-increase]");
        const decreaseButton = event.target.closest("[data-cart-decrease]");
        const removeButton = event.target.closest("[data-cart-remove]");

        if (increaseButton) {
            updateCartItem(increaseButton.dataset.cartIncrease, "increase");
        }

        if (decreaseButton) {
            updateCartItem(decreaseButton.dataset.cartDecrease, "decrease");
        }

        if (removeButton) {
            updateCartItem(removeButton.dataset.cartRemove, "remove");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    initCartEvents();
});
