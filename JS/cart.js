function formatCartPrice(price) {
    return "$" + Number(price).toFixed(2).replace(".00", "");
}

function getCartTotal(cart) {
    let total = 0;

    cart.forEach(function (product) {
        total += product.price * product.quantity;
    });

    return total;
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
    let category = "";

    if (product.category) {
        category = "<p>" + product.category + "</p>";
    }

    return `
        <article class="cart-item">
            <img src="${product.image}" alt="${product.name}">

            <div class="cart-item-info">
                <h3>${product.name}</h3>
                ${category}
                <strong>${formatCartPrice(product.price)}</strong>
            </div>

            <div class="quantity-control">
                <button type="button" data-cart-decrease="${product.id}">-</button>
                <span>${product.quantity}</span>
                <button type="button" data-cart-increase="${product.id}">+</button>
            </div>

            <button class="remove-btn" type="button" data-cart-remove="${product.id}">Remove</button>
        </article>
    `;
}

function renderCart() {
    const cartItems = document.querySelector("#cart-items");
    const cartTotal = document.querySelector("#cart-total");
    const cart = getCartProducts();

    updateCartBadge();
    cartTotal.textContent = formatCartPrice(getCartTotal(cart));

    if (cart.length === 0) {
        renderEmptyCart();
        return;
    }

    cartItems.innerHTML = cart.map(createCartItem).join("");
}

function changeCartItem(productId, action) {
    const cart = getCartProducts();
    const product = cart.find(function (item) {
        return item.id === String(productId);
    });

    if (!product) {
        return;
    }

    if (action === "plus") {
        product.quantity++;
    }

    if (action === "minus") {
        product.quantity--;
    }

    if (action === "remove" || product.quantity <= 0) {
        const index = cart.indexOf(product);
        cart.splice(index, 1);
    }

    saveCartProducts(cart);
    renderCart();
}

function initCartEvents() {
    const cartItems = document.querySelector("#cart-items");

    cartItems.addEventListener("click", function (event) {
        const plusButton = event.target.closest("[data-cart-increase]");
        const minusButton = event.target.closest("[data-cart-decrease]");
        const removeButton = event.target.closest("[data-cart-remove]");

        if (plusButton) {
            changeCartItem(plusButton.dataset.cartIncrease, "plus");
        }

        if (minusButton) {
            changeCartItem(minusButton.dataset.cartDecrease, "minus");
        }

        if (removeButton) {
            changeCartItem(removeButton.dataset.cartRemove, "remove");
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    renderCart();
    initCartEvents();
});
