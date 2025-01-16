document.addEventListener('DOMContentLoaded', () => {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartItemsContainer = document.querySelector('.cart-items');
    const openCartBtns = document.querySelectorAll('.open-cart, .btn-outline-danger');
    const closeCartBtn = document.querySelector('.close-cart');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const orderSummary = document.getElementById('orderSummary');
    const checkoutForm = document.getElementById('checkoutForm');
    const cartBadge = document.querySelector('.cart-icon .cart-badge');

    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Utility function to update the cart UI
    function updateCartUI() {
        cartItemsContainer.innerHTML = ''; // Clear current cart

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>No items in the cart yet!</p>';
            if (checkoutBtn) {
                checkoutBtn.disabled = true;
            }
            cartBadge.style.display = 'none'; // Hide yellow dot if cart is empty
            return;
        }

        let total = 0;
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item d-flex justify-content-between align-items-center mb-3';
            cartItem.innerHTML = `
                <div>
                    <h5>${item.name}</h5>
                    <p>${item.quantity} x $${item.price.toFixed(2)}</p>
                </div>
                <div>
                    <button class="btn btn-sm btn-success increase-btn" data-index="${index}">+</button>
                    <button class="btn btn-sm btn-danger decrease-btn" data-index="${index}">-</button>
                    <button class="btn btn-sm btn-dark remove-btn" data-index="${index}">Remove</button>
                </div>
            `;

            cartItemsContainer.appendChild(cartItem);
        });

        const totalElement = document.createElement('div');
        totalElement.className = 'cart-total text-right mt-3';
        totalElement.innerHTML = `<h5>Total: $${total.toFixed(2)}</h5>`;
        cartItemsContainer.appendChild(totalElement);

        if (checkoutBtn) {
            checkoutBtn.disabled = false;
        }

        cartBadge.style.display = 'block'; // Show yellow dot if cart is not empty

        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Utility function to update the order summary UI
    function updateOrderSummary() {
        if (!orderSummary) return;

        orderSummary.innerHTML = ''; // Clear current order summary

        if (cart.length === 0) {
            orderSummary.innerHTML = '<p>No items in the cart yet!</p>';
            return;
        }

        let total = 0;
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const orderItem = document.createElement('li');
            orderItem.className = 'list-group-item d-flex justify-content-between lh-condensed';
            orderItem.innerHTML = `
                <div>
                    <h6 class="my-0">${item.name}</h6>
                    <small class="text-muted">${item.quantity} x $${item.price.toFixed(2)}</small>
                </div>
                <span class="text-muted">$${itemTotal.toFixed(2)}</span>
            `;

            orderSummary.appendChild(orderItem);
        });

        const totalElement = document.createElement('li');
        totalElement.className = 'list-group-item d-flex justify-content-between';
        totalElement.innerHTML = `
            <span>Total (USD)</span>
            <strong>$${total.toFixed(2)}</strong>
        `;
        orderSummary.appendChild(totalElement);
    }

    // Open cart sidebar
    openCartBtns.forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            cartSidebar.classList.add('active', 'open');
            updateCartUI(); // Update cart UI when opening the sidebar
        });
    });

    // Close cart sidebar
    closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('active', 'open');
    });

    // Add item to cart
    function addToCart(name, price) {
        const existingItem = cart.find((item) => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }

        updateCartUI();
        updateOrderSummary();
    }

    // Event listener for "Add to Cart" buttons
    document.querySelectorAll('.btn-danger:not(.btn-outline-danger)').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();

            const card = btn.closest('.card');
            const name = card.querySelector('.card-title').textContent;
            const price = parseFloat(card.querySelector('.card-text').textContent.replace('$', ''));

            addToCart(name, price);
        });
    });

    // Event listener for "Buy Now" buttons
    document.querySelectorAll('.btn-outline-danger').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();

            const card = btn.closest('.card');
            const name = card.querySelector('.card-title').textContent;
            const price = parseFloat(card.querySelector('.card-text').textContent.replace('$', ''));

            addToCart(name, price);

            // Open the cart sidebar after adding the item
            cartSidebar.classList.add('active', 'open');
            updateCartUI();
        });
    });

    // Handle cart item actions (increase, decrease, remove)
    cartItemsContainer.addEventListener('click', (event) => {
        const index = event.target.dataset.index;

        if (event.target.classList.contains('increase-btn')) {
            cart[index].quantity += 1;
        } else if (event.target.classList.contains('decrease-btn')) {
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1); // Remove item if quantity reaches 0
            }
        } else if (event.target.classList.contains('remove-btn')) {
            cart.splice(index, 1); // Remove item from cart
        }

        updateCartUI();
        updateOrderSummary();
    });

    // Redirect to checkout page on "Checkout" button click
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }

    // Handle checkout form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(event.target);
            const formObject = Object.fromEntries(formData.entries());
            formObject.cart = cart;

            fetch('/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formObject)
            })
            .then(response => response.json())
            .then(data => {
                alert('Order placed successfully!');
                localStorage.removeItem('cart'); // Clear cart after successful order
                window.location.href = '/';
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    // Initial render of the cart and order summary
    updateCartUI();
    updateOrderSummary();
});