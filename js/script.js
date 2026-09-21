/* =========================================
   MOBILE NAVIGATION
========================================= */

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("active");

        menuToggle.classList.toggle("active");

        menuToggle.setAttribute("aria-expanded", isOpen);
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            menuToggle.classList.remove("active");

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
        });
    });
}


/* =========================================
   SHOPPING CART ELEMENTS
========================================= */

const cartButton = document.querySelector(".cart-button");
const cartDrawer = document.querySelector(".cart-drawer");
const cartOverlay = document.querySelector(".cart-overlay");
const cartClose = document.querySelector(".cart-close");
const cartItemsContainer = document.querySelector(".cart-items");
const cartCount = document.querySelector(".cart-count");
const cartTotal = document.querySelector(".cart-total strong");
const checkoutButton = document.querySelector(".checkout-button");

const addToCartButton = document.querySelector(".add-to-cart");
const decreaseButton = document.querySelector(".decrease");
const increaseButton = document.querySelector(".increase");
const quantityValue = document.querySelector(".quantity-value");


/* =========================================
   CART DATA
========================================= */

let quantity = 1;
let cart = [];

try {
    cart = JSON.parse(localStorage.getItem("ceeCart")) || [];

    if (!Array.isArray(cart)) {
        cart = [];
    }
} catch (error) {
    cart = [];
}


/* =========================================
   PRODUCT QUANTITY
========================================= */

if (decreaseButton && increaseButton && quantityValue) {

    decreaseButton.addEventListener("click", () => {
        if (quantity > 1) {
            quantity--;
            quantityValue.textContent = quantity;
        }
    });

    increaseButton.addEventListener("click", () => {
        quantity++;
        quantityValue.textContent = quantity;
    });
}


/* =========================================
   ADD PRODUCT TO CART
========================================= */

if (addToCartButton) {

    addToCartButton.addEventListener("click", () => {

        const productName = addToCartButton.dataset.product;
        const productPrice = Number(addToCartButton.dataset.price);

        if (!productName || Number.isNaN(productPrice)) {
            return;
        }

        const existingProduct = cart.find(
            (item) => item.name === productName
        );

        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.push({
                name: productName,
                price: productPrice,
                quantity: quantity,
                image: "images/cee-glue.png"
            });
        }

        saveCart();
        updateCart();
        openCart();

        quantity = 1;

        if (quantityValue) {
            quantityValue.textContent = quantity;
        }
    });
}


/* =========================================
   SAVE CART
========================================= */

function saveCart() {
    localStorage.setItem("ceeCart", JSON.stringify(cart));
}


/* =========================================
   UPDATE CART
========================================= */

function updateCart() {

    if (!cartItemsContainer || !cartCount || !cartTotal) {
        return;
    }

    cartItemsContainer.innerHTML = "";

    let totalItems = 0;
    let subtotal = 0;

    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `
            <p class="empty-cart">
                Your cart is currently empty.
            </p>
        `;

    } else {

        cart.forEach((item, index) => {

            const itemQuantity = Number(item.quantity) || 0;
            const itemPrice = Number(item.price) || 0;

            totalItems += itemQuantity;
            subtotal += itemPrice * itemQuantity;

            const cartItem = document.createElement("div");

            cartItem.className = "cart-item";

            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >
                </div>

                <div class="cart-item-info">

                    <h4>${item.name}</h4>

                    <p>
                        R${itemPrice.toLocaleString("en-ZA")}
                    </p>

                    <div class="cart-item-quantity">

                        <button
                            type="button"
                            data-action="decrease"
                            data-index="${index}"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>

                        <span>
                            ${itemQuantity}
                        </span>

                        <button
                            type="button"
                            data-action="increase"
                            data-index="${index}"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>

                    </div>

                    <button
                        type="button"
                        class="remove-item"
                        data-action="remove"
                        data-index="${index}"
                    >
                        Remove
                    </button>

                </div>

                <div class="cart-item-price">
                    R${(itemPrice * itemQuantity).toLocaleString("en-ZA")}
                </div>
            `;

            cartItemsContainer.appendChild(cartItem);
        });
    }

    cartCount.textContent = totalItems;
    cartTotal.textContent = `R${subtotal.toLocaleString("en-ZA")}`;
}


/* =========================================
   CART ITEM ACTIONS
========================================= */

if (cartItemsContainer) {

    cartItemsContainer.addEventListener("click", (event) => {

        const button = event.target.closest("button");

        if (!button) {
            return;
        }

        const index = Number(button.dataset.index);
        const action = button.dataset.action;

        if (!Number.isInteger(index) || !cart[index]) {
            return;
        }

        if (action === "increase") {
            cart[index].quantity++;
        }

        if (action === "decrease") {
            cart[index].quantity--;

            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
        }

        if (action === "remove") {
            cart.splice(index, 1);
        }

        saveCart();
        updateCart();
    });
}


/* =========================================
   OPEN CART
========================================= */

function openCart() {

    if (!cartDrawer || !cartOverlay) {
        return;
    }

    cartDrawer.classList.add("open");
    cartOverlay.classList.add("open");

    document.body.style.overflow = "hidden";
}


/* =========================================
   CLOSE CART
========================================= */

function closeCart() {

    if (!cartDrawer || !cartOverlay) {
        return;
    }

    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("open");

    document.body.style.overflow = "";
}


/* =========================================
   CART EVENTS
========================================= */

if (cartButton) {
    cartButton.addEventListener("click", openCart);
}

if (cartClose) {
    cartClose.addEventListener("click", closeCart);
}

if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCart);
}


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        closeCart();

        if (navLinks && menuToggle) {
            navLinks.classList.remove("active");
            menuToggle.classList.remove("active");

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
        }
    }
});


/* =========================================
   CHECKOUT BUTTON
========================================= */

if (checkoutButton) {

    checkoutButton.addEventListener("click", () => {

        if (cart.length === 0) {
            alert("Your cart is empty. Please add a product first.");
            return;
        }

        window.location.href = "checkout.html";
    });
}

/* =========================================
   INITIAL CART LOAD
========================================= */

updateCart();

/* =========================================
   CHECKOUT PAGE
========================================= */

const checkoutItemsContainer = document.querySelector("#checkout-items");
const checkoutSubtotal = document.querySelector("#checkout-subtotal");
const checkoutTotal = document.querySelector("#checkout-total");


function updateCheckoutSummary() {

    // Only run this code on checkout.html
    if (
        !checkoutItemsContainer ||
        !checkoutSubtotal ||
        !checkoutTotal
    ) {
        return;
    }

    checkoutItemsContainer.innerHTML = "";

    let subtotal = 0;

    if (cart.length === 0) {

        checkoutItemsContainer.innerHTML = `
            <div class="checkout-empty">
                <p>Your cart is currently empty.</p>
                <a href="index.html#shop">
                    Continue Shopping
                </a>
            </div>
        `;

        checkoutSubtotal.textContent = "R0";
        checkoutTotal.textContent = "R0";

        return;
    }


    cart.forEach((item) => {

        const itemQuantity = Number(item.quantity) || 0;
        const itemPrice = Number(item.price) || 0;

        const itemTotal = itemPrice * itemQuantity;

        subtotal += itemTotal;


        const checkoutItem = document.createElement("div");

        checkoutItem.className = "checkout-item";

        checkoutItem.innerHTML = `
            
            <div class="checkout-item-image">

                <img
                    src="${item.image}"
                    alt="${item.name}"
                >

            </div>


            <div class="checkout-item-info">

                <h3>
                    ${item.name}
                </h3>

                <p>
                    R${itemPrice.toLocaleString("en-ZA")}
                    × ${itemQuantity}
                </p>

            </div>


            <div class="checkout-item-price">

                R${itemTotal.toLocaleString("en-ZA")}

            </div>

        `;

        checkoutItemsContainer.appendChild(checkoutItem);

    });


    checkoutSubtotal.textContent =
        `R${subtotal.toLocaleString("en-ZA")}`;

    checkoutTotal.textContent =
        `R${subtotal.toLocaleString("en-ZA")}`;
}


/* =========================================
   LOAD CHECKOUT SUMMARY
========================================= */

updateCheckoutSummary();

/* =========================================
   CHECKOUT FORM
========================================= */

const checkoutForm = document.querySelector("#checkout-form");
const checkoutMessage = document.querySelector("#checkout-message");
const placeOrderButton = document.querySelector(".place-order-button");

if (checkoutForm) {

    checkoutForm.addEventListener("submit", (event) => {

        event.preventDefault();


        /* -----------------------------------------
           CHECK THAT THE CART HAS PRODUCTS
        ----------------------------------------- */

        if (cart.length === 0) {

            if (checkoutMessage) {

                checkoutMessage.textContent =
                    "Your cart is empty. Please add a product before continuing.";

                checkoutMessage.classList.remove("success");
                checkoutMessage.classList.add("error");

            }

            return;
        }


        /* -----------------------------------------
           CHECK FORM VALIDATION
        ----------------------------------------- */

        if (!checkoutForm.checkValidity()) {

            checkoutForm.reportValidity();

            return;
        }


        /* -----------------------------------------
           GET CART QUANTITY
        ----------------------------------------- */

        let totalQuantity = 0;

        cart.forEach((item) => {

            totalQuantity += Number(item.quantity) || 0;

        });


        /* -----------------------------------------
           ADD CART QUANTITY TO FORM
        ----------------------------------------- */

        let quantityInput =
            checkoutForm.querySelector('input[name="quantity"]');

        if (!quantityInput) {

            quantityInput =
                document.createElement("input");

            quantityInput.type = "hidden";
            quantityInput.name = "quantity";

            checkoutForm.appendChild(quantityInput);

        }

        quantityInput.value = totalQuantity;


        /* -----------------------------------------
           SAVE ORDER DETAILS
        ----------------------------------------- */

        const formData = new FormData(checkoutForm);

        const customerDetails = {

            fullName: formData.get("fullName"),

            email: formData.get("email"),

            phone: formData.get("phone"),

            address: formData.get("address"),

            suburb: formData.get("suburb"),

            city: formData.get("city"),

            province: formData.get("province"),

            postalCode: formData.get("postalCode"),

            deliveryMethod: formData.get("delivery")

        };


        /* -----------------------------------------
           CALCULATE SUBTOTAL
        ----------------------------------------- */

        let subtotal = 0;

        cart.forEach((item) => {

            subtotal +=
                Number(item.price) *
                Number(item.quantity);

        });


        /* -----------------------------------------
           SAVE PENDING ORDER
        ----------------------------------------- */

        const pendingOrder = {

            customer: customerDetails,

            products: cart,

            subtotal: subtotal,

            delivery: null,

            total: subtotal,

            createdAt: new Date().toISOString()

        };


        localStorage.setItem(
            "ceePendingOrder",
            JSON.stringify(pendingOrder)
        );


        /* -----------------------------------------
           SUBMIT TO PAYMENT.PHP
        ----------------------------------------- */

        checkoutForm.submit();

    });

}