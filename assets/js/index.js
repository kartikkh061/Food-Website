/**
 * Index Page JavaScript
 * Handles user profile, search, and cart functionality
 */

// Add keyboard support for menu filters
document.addEventListener('DOMContentLoaded', function() {
    const filters = document.querySelectorAll('.filter[role="tab"]');
    
    filters.forEach(filter => {
        filter.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
});

// User Profile Modal
document.addEventListener('DOMContentLoaded', function() {
    const userIcon = document.getElementById('userIcon');
    const profileModal = document.getElementById('profileModal');
    const closeProfile = document.getElementById('closeProfile');
    const signOutBtn = document.getElementById('signOutBtn');

    // Get the user session from localStorage
    let storedUser = JSON.parse(localStorage.getItem('activeUser'));

    // Check if session expired (for "Remember me" feature)
    if (storedUser && storedUser.expiresAt) {
        const expirationDate = new Date(storedUser.expiresAt);
        if (new Date() > expirationDate) {
            // Session expired, remove active user
            localStorage.removeItem('activeUser');
            storedUser = null;
        }
    }

    if (userIcon) {
        userIcon.addEventListener('click', function(e) {
            // Check if user is logged in
            if (storedUser) {
                e.preventDefault(); // Stop the link from going to login.html
                
                // Set the text from user data
                document.getElementById('profileName').textContent = storedUser.fullname; 
                document.getElementById('profileUserName').textContent = storedUser.username;
                document.getElementById('profileEmail').textContent = storedUser.email;
                
                // Show the modal with accessibility features
                openModal(profileModal, userIcon);
                announceToScreenReader('Profile modal opened');
            }
            // If NOT logged in, the browser will follow the link to login.html automatically
        });
    }

    // Modal Close Logic
    if (closeProfile) {
        closeProfile.addEventListener('click', () => {
            closeModal(profileModal);
            announceToScreenReader('Profile modal closed');
        });
    }
    
    // Close modal on backdrop click
    if (profileModal) {
        profileModal.addEventListener('click', function(e) {
            if (e.target === profileModal) {
                closeModal(profileModal);
                announceToScreenReader('Profile modal closed');
            }
        });
    }

    // Sign Out Logic
    if (signOutBtn) {
        signOutBtn.onclick = () => {
            // Update user's login status in users array
            const activeUser = JSON.parse(localStorage.getItem('activeUser'));
            if (activeUser && activeUser.id) {
                let users = getRegisteredUsers();
                const userIndex = users.findIndex(u => u.id === activeUser.id);
                if (userIndex !== -1) {
                    users[userIndex].isLoggedIn = false;
                    saveRegisteredUsers(users);
                }
            }
            
            localStorage.removeItem('activeUser'); 
            window.location.reload(); 
        };
    }
});

// Search Functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const menuSection = document.getElementById('menu');
    
    if (searchInput) {
        // Function to reset the menu items to visible
        const resetSearch = () => {
            let items = document.querySelectorAll('.search-item');
            items.forEach(item => {
                item.style.removeProperty('display'); 
            });
        };

        searchInput.addEventListener('input', function() {
            // If user starts typing, jump to the menu section
            if (this.value.length > 0) {
                menuSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                // If they manually backspace everything, reset items
                resetSearch();
                return;
            }

            // Standard search logic
            let filter = this.value.toLowerCase();
            let items = document.querySelectorAll('.search-item');

            items.forEach(function(item) {
                let text = item.innerText.toLowerCase();
                if (text.indexOf(filter) > -1) {
                    item.style.setProperty('display', 'block', 'important');
                } else {
                    item.style.setProperty('display', 'none', 'important');
                }
            });
        });

        // Listen for the "search" event (triggered by the 'x' button)
        searchInput.addEventListener('search', function() {
            if (this.value === "") {
                resetSearch();
            }
        });
    }
});

// Cart Functionality
document.addEventListener('DOMContentLoaded', function() {
    let cart = JSON.parse(localStorage.getItem('foodCart')) || [];
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartCountElement = document.querySelector('.cart-number');
    const cartSidebar = document.getElementById('cartSidebar');

    // Open/Close Logic
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            openModal(cartSidebar, cartBtn);
            announceToScreenReader(`Shopping cart opened with ${cart.length} item${cart.length !== 1 ? 's' : ''}`);
        });
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', () => {
            closeModal(cartSidebar);
            announceToScreenReader('Shopping cart closed');
        });
    }
    
    // Close cart on backdrop click
    if (cartSidebar) {
        cartSidebar.addEventListener('click', function(e) {
            if (e.target === cartSidebar) {
                closeModal(cartSidebar);
                announceToScreenReader('Shopping cart closed');
            }
        });
    }

    // Add alt text to dish images dynamically
    document.querySelectorAll('.dish-box').forEach(dishBox => {
        const dishName = dishBox.querySelector('.h3-title')?.innerText;
        const dishImage = dishBox.querySelector('.dist-img img');
        if (dishImage && dishName && !dishImage.getAttribute('alt')) {
            dishImage.setAttribute('alt', dishName);
        }
    });

    // Add to Cart Logic
    document.querySelectorAll('.dish-add-btn').forEach(button => {
        button.addEventListener('click', function() {
            const dishBox = this.closest('.dish-box');
            const name = dishBox.querySelector('.h3-title').innerText;
            const priceText = dishBox.querySelector('.dist-bottom-row b').innerText;
            const price = parseInt(priceText.replace('Rs. ', ''));

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
                announceToScreenReader(`Increased quantity of ${name} to ${existingItem.quantity}`);
            } else {
                cart.push({ name, price, quantity: 1 });
                announceToScreenReader(`${name} added to cart`);
            }
            updateCart();
        });
        
        // Keyboard support
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });

    // UI Update Function
    function updateCart() {
        localStorage.setItem('foodCart', JSON.stringify(cart));
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
        }
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            if (cartItemsContainer) {
                cartItemsContainer.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">Your cart is empty</p>';
            }
        } else {
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                count += item.quantity;
                if (cartItemsContainer) {
                    cartItemsContainer.innerHTML += `
                        <div role="listitem" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:5px;">
                            <div>
                                <h5 style="margin:0; font-size:1rem; color:#0d0d25;">${item.name}</h5>
                                <p style="margin:0; color:#ff8243;">Rs. ${item.price} x ${item.quantity}</p>
                            </div>
                            <button onclick="removeFromCart(${index})" aria-label="Remove ${item.name} from cart" tabindex="0" style="background:#ff8243; color:white; border:none; padding:2px 8px; border-radius:5px; cursor:pointer;">
                                <span aria-hidden="true">&times;</span>
                                <span class="sr-only">Remove ${item.name}</span>
                            </button>
                        </div>`;
                }
            });
        }

        if (cartTotalElement) {
            cartTotalElement.innerText = total;
        }
        if (cartCountElement) {
            cartCountElement.innerText = count;
            cartCountElement.setAttribute('aria-label', `${count} item${count !== 1 ? 's' : ''} in cart`);
        }
        
        // Announce cart update
        if (cart.length > 0) {
            announceToScreenReader(`Cart updated: ${count} item${count !== 1 ? 's' : ''}, total Rs. ${total}`);
        }
    }

    // Remove Function
    window.removeFromCart = (index) => {
        const itemName = cart[index].name;
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
            announceToScreenReader(`Reduced quantity of ${itemName}`);
        } else {
            cart.splice(index, 1);
            announceToScreenReader(`${itemName} removed from cart`);
        }
        updateCart();
    };

    // Checkout Functionality
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckout = document.getElementById('closeCheckout');
    const cancelCheckout = document.getElementById('cancelCheckout');
    const confirmCheckout = document.getElementById('confirmCheckout');
    const checkoutOrderSummary = document.getElementById('checkoutOrderSummary');
    const orderSuccessModal = document.getElementById('orderSuccessModal');
    const closeOrderSuccess = document.getElementById('closeOrderSuccess');
    const orderSuccessMessage = document.getElementById('orderSuccessMessage');
    const orderNumber = document.getElementById('orderNumber');

    // Open checkout modal
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                announceToScreenReader('Your cart is empty. Please add items before checkout.');
                return;
            }
            
            // Check if user is logged in
            const activeUser = JSON.parse(localStorage.getItem('activeUser'));
            if (!activeUser) {
                announceToScreenReader('Please login to proceed with checkout');
                alert('Please login to proceed with checkout');
                closeModal(cartSidebar);
                window.location.href = 'login.html';
                return;
            }
            
            displayOrderSummary();
            openModal(checkoutModal, checkoutBtn);
            announceToScreenReader('Checkout modal opened. Review your order summary.');
        });
    }

    // Display order summary
    function displayOrderSummary() {
        let total = 0;
        let itemCount = 0;
        
        let summaryHTML = '<h4 style="margin-bottom: 15px; color: #0d0d25;">Order Summary</h4>';
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemCount += item.quantity;
            
            summaryHTML += `
                <div class="order-summary-item">
                    <div>
                        <div class="order-summary-item-name">${item.name}</div>
                        <div class="order-summary-item-details">Quantity: ${item.quantity} × Rs. ${item.price}</div>
                    </div>
                    <div class="order-summary-item-price">Rs. ${itemTotal}</div>
                </div>
            `;
        });
        
        summaryHTML += `
            <div class="order-total-section">
                <div class="order-total-row">
                    <span>Subtotal (${itemCount} item${itemCount !== 1 ? 's' : ''}):</span>
                    <span>Rs. ${total}</span>
                </div>
                <div class="order-total-row">
                    <span>Delivery Charges:</span>
                    <span>Rs. 50</span>
                </div>
                <div class="order-total-row final">
                    <span>Total Amount:</span>
                    <span>Rs. ${total + 50}</span>
                </div>
            </div>
        `;
        
        checkoutOrderSummary.innerHTML = summaryHTML;
    }

    // Close checkout modal
    if (closeCheckout) {
        closeCheckout.addEventListener('click', () => {
            closeModal(checkoutModal);
            announceToScreenReader('Checkout cancelled');
        });
    }

    if (cancelCheckout) {
        cancelCheckout.addEventListener('click', () => {
            closeModal(checkoutModal);
            announceToScreenReader('Checkout cancelled');
        });
    }

    // Close checkout on backdrop click
    if (checkoutModal) {
        checkoutModal.addEventListener('click', function(e) {
            if (e.target === checkoutModal) {
                closeModal(checkoutModal);
                announceToScreenReader('Checkout cancelled');
            }
        });
    }

    // Confirm checkout
    if (confirmCheckout) {
        confirmCheckout.addEventListener('click', function() {
            const activeUser = JSON.parse(localStorage.getItem('activeUser'));
            if (!activeUser) {
                alert('Please login to proceed with checkout');
                return;
            }
            
            // Calculate total
            let total = 0;
            cart.forEach(item => {
                total += item.price * item.quantity;
            });
            const finalTotal = total + 50; // Add delivery charges
            
            // Create order object
            const order = {
                id: 'ORD-' + Date.now(),
                userId: activeUser.id,
                userEmail: activeUser.email,
                items: [...cart],
                subtotal: total,
                deliveryCharges: 50,
                total: finalTotal,
                status: 'confirmed',
                orderDate: new Date().toISOString(),
                estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
                statusHistory: [
                    {
                        status: 'confirmed',
                        date: new Date().toISOString(),
                        message: 'Order confirmed and received'
                    }
                ]
            };
            
            // Save order to localStorage
            try {
                const orders = JSON.parse(localStorage.getItem('orders')) || [];
                orders.push(order);
                localStorage.setItem('orders', JSON.stringify(orders));
                
                // Clear cart
                cart = [];
                localStorage.removeItem('foodCart');
                updateCart();
                
                // Close checkout modal
                closeModal(checkoutModal);
                
                // Show success modal
                orderSuccessMessage.textContent = `Thank you for your order, ${activeUser.fullname}!`;
                orderNumber.textContent = `Order Number: ${order.id}`;
                openModal(orderSuccessModal, null);
                announceToScreenReader(`Order placed successfully. Order number: ${order.id}`);
                
            } catch (error) {
                console.error('Error saving order:', error);
                alert('Error placing order. Please try again.');
            }
        });
    }

    // Close order success modal
    if (closeOrderSuccess) {
        closeOrderSuccess.addEventListener('click', () => {
            closeModal(orderSuccessModal);
            closeModal(cartSidebar);
            announceToScreenReader('Returning to shopping');
        });
    }

    // Close order success on backdrop click
    if (orderSuccessModal) {
        orderSuccessModal.addEventListener('click', function(e) {
            if (e.target === orderSuccessModal) {
                closeModal(orderSuccessModal);
                closeModal(cartSidebar);
                announceToScreenReader('Returning to shopping');
            }
        });
    }

    updateCart(); // Load existing cart on refresh
});

