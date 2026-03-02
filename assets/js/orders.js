/**
 * Order Tracking JavaScript
 * Handles order history display and tracking
 */

document.addEventListener('DOMContentLoaded', function() {
    const ordersContainer = document.getElementById('ordersContainer');
    const ordersList = document.getElementById('ordersList');
    const loadingMessage = document.getElementById('loadingMessage');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    const orderSearch = document.getElementById('orderSearch');
    const statusFilter = document.getElementById('statusFilter');
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const closeOrderDetails = document.getElementById('closeOrderDetails');
    const orderDetailsContent = document.getElementById('orderDetailsContent');
    const orderDetailsTitle = document.getElementById('orderDetailsTitle');

    // Check if user is logged in
    const activeUser = JSON.parse(localStorage.getItem('activeUser'));
    
    if (!activeUser) {
        ordersContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; background: #f8f9fa; border-radius: 12px;">
                <i class="uil uil-user-circle" style="font-size: 60px; color: #ccc; margin-bottom: 20px;" aria-hidden="true"></i>
                <h3 style="color: #666; margin-bottom: 10px;">Please Login</h3>
                <p style="color: #999; margin-bottom: 30px;">You need to be logged in to view your orders.</p>
                <a href="login.html" class="sec-btn" style="display: inline-block;">Login</a>
            </div>
        `;
        return;
    }

    // Load and display orders
    function loadOrders() {
        loadingMessage.style.display = 'block';
        ordersList.innerHTML = '';
        noOrdersMessage.style.display = 'none';

        setTimeout(() => {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const userOrders = orders.filter(order => order.userId === activeUser.id);
            
            loadingMessage.style.display = 'none';

            if (userOrders.length === 0) {
                noOrdersMessage.style.display = 'block';
                return;
            }

            // Sort orders by date (newest first)
            userOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

            displayOrders(userOrders);
        }, 500);
    }

    // Display orders
    function displayOrders(orders) {
        ordersList.innerHTML = '';
        
        orders.forEach(order => {
            const orderCard = createOrderCard(order);
            ordersList.appendChild(orderCard);
        });
    }

    // Create order card element
    function createOrderCard(order) {
        const card = document.createElement('div');
        card.className = 'order-card';
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', `Order ${order.id}`);
        
        const orderDate = new Date(order.orderDate);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const statusClass = order.status.replace(/\s+/g, '_').toLowerCase();

        card.innerHTML = `
            <div class="order-card-header">
                <div>
                    <div class="order-number">${order.id}</div>
                    <div class="order-date">${formattedDate}</div>
                </div>
                <span class="order-status ${statusClass}">${formatStatus(order.status)}</span>
            </div>
            <div class="order-summary">
                <div>
                    <div class="order-items-count">${itemCount} item${itemCount !== 1 ? 's' : ''}</div>
                </div>
                <div class="order-total">Rs. ${order.total}</div>
            </div>
            <div class="order-actions">
                <button class="btn-view-details" onclick="viewOrderDetails('${order.id}')" aria-label="View details for order ${order.id}">
                    View Details
                </button>
            </div>
        `;

        return card;
    }

    // Format status text
    function formatStatus(status) {
        const statusMap = {
            'confirmed': 'Confirmed',
            'preparing': 'Preparing',
            'out_for_delivery': 'Out for Delivery',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    }

    // View order details
    window.viewOrderDetails = function(orderId) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            alert('Order not found');
            return;
        }

        displayOrderDetails(order);
        openModal(orderDetailsModal, null);
        announceToScreenReader(`Viewing order details for ${orderId}`);
    };

    // Display order details
    function displayOrderDetails(order) {
        const orderDate = new Date(order.orderDate);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const estimatedDelivery = order.estimatedDelivery 
            ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : 'Not available';

        orderDetailsTitle.textContent = `Order ${order.id}`;
        
        let itemsHTML = '';
        order.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            itemsHTML += `
                <div class="order-details-item">
                    <div>
                        <div class="order-details-item-label" style="font-weight: 500;">${item.name}</div>
                        <div style="font-size: 12px; color: #999;">Quantity: ${item.quantity} × Rs. ${item.price}</div>
                    </div>
                    <div class="order-details-item-value">Rs. ${itemTotal}</div>
                </div>
            `;
        });

        const statusClass = order.status.replace(/\s+/g, '_').toLowerCase();
        const timelineHTML = generateTimeline(order);

        orderDetailsContent.innerHTML = `
            <div class="order-details-section">
                <h4>Order Information</h4>
                <div class="order-details-item">
                    <span class="order-details-item-label">Order Number:</span>
                    <span class="order-details-item-value">${order.id}</span>
                </div>
                <div class="order-details-item">
                    <span class="order-details-item-label">Order Date:</span>
                    <span class="order-details-item-value">${formattedDate}</span>
                </div>
                <div class="order-details-item">
                    <span class="order-details-item-label">Status:</span>
                    <span class="order-details-item-value">
                        <span class="order-status ${statusClass}">${formatStatus(order.status)}</span>
                    </span>
                </div>
                <div class="order-details-item">
                    <span class="order-details-item-label">Estimated Delivery:</span>
                    <span class="order-details-item-value">${estimatedDelivery}</span>
                </div>
            </div>

            <div class="order-details-section">
                <h4>Order Items</h4>
                ${itemsHTML}
            </div>

            <div class="order-details-section">
                <h4>Pricing</h4>
                <div class="order-details-item">
                    <span class="order-details-item-label">Subtotal:</span>
                    <span class="order-details-item-value">Rs. ${order.subtotal}</span>
                </div>
                <div class="order-details-item">
                    <span class="order-details-item-label">Delivery Charges:</span>
                    <span class="order-details-item-value">Rs. ${order.deliveryCharges}</span>
                </div>
                <div class="order-details-item" style="border-top: 2px solid #ff8243; padding-top: 15px; margin-top: 10px;">
                    <span class="order-details-item-label" style="font-size: 18px; font-weight: 700; color: #ff8243;">Total:</span>
                    <span class="order-details-item-value" style="font-size: 18px; font-weight: 700; color: #ff8243;">Rs. ${order.total}</span>
                </div>
            </div>

            <div class="order-timeline">
                <h4>Order Timeline</h4>
                ${timelineHTML}
            </div>
        `;
    }

    // Generate timeline based on order status
    function generateTimeline(order) {
        const orderDate = new Date(order.orderDate);
        const status = order.status.toLowerCase().replace(/\s+/g, '_');
        
        const timelineSteps = [
            {
                title: 'Order Confirmed',
                date: orderDate,
                status: 'completed',
                condition: true
            },
            {
                title: 'Preparing Your Order',
                date: new Date(orderDate.getTime() + 5 * 60000), // 5 minutes after
                status: status === 'preparing' || status === 'out_for_delivery' || status === 'delivered' ? 'completed' : (status === 'confirmed' ? 'active' : ''),
                condition: status !== 'cancelled'
            },
            {
                title: 'Out for Delivery',
                date: order.estimatedDelivery ? new Date(order.estimatedDelivery) : new Date(orderDate.getTime() + 20 * 60000),
                status: status === 'out_for_delivery' || status === 'delivered' ? (status === 'out_for_delivery' ? 'active' : 'completed') : '',
                condition: status === 'out_for_delivery' || status === 'delivered'
            },
            {
                title: 'Delivered',
                date: order.estimatedDelivery ? new Date(order.estimatedDelivery) : new Date(orderDate.getTime() + 30 * 60000),
                status: status === 'delivered' ? 'completed' : '',
                condition: status === 'delivered'
            }
        ];

        let timelineHTML = '';
        timelineSteps.forEach(step => {
            if (step.condition) {
                const stepDate = step.date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                timelineHTML += `
                    <div class="timeline-item ${step.status}">
                        <div class="timeline-content">
                            <div class="timeline-title">${step.title}</div>
                            <div class="timeline-date">${stepDate}</div>
                        </div>
                    </div>
                `;
            }
        });

        if (status === 'cancelled') {
            timelineHTML += `
                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="timeline-title" style="color: #dc3545;">Order Cancelled</div>
                        <div class="timeline-date">${orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>
            `;
        }

        return timelineHTML || '<p style="color: #999;">Timeline information not available</p>';
    }

    // Filter orders
    function filterOrders() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const userOrders = orders.filter(order => order.userId === activeUser.id);
        
        let filteredOrders = userOrders;

        // Filter by search term
        const searchTerm = orderSearch.value.toLowerCase().trim();
        if (searchTerm) {
            filteredOrders = filteredOrders.filter(order => 
                order.id.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by status
        const statusValue = statusFilter.value;
        if (statusValue !== 'all') {
            filteredOrders = filteredOrders.filter(order => 
                order.status.toLowerCase().replace(/\s+/g, '_') === statusValue
            );
        }

        // Sort by date (newest first)
        filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        if (filteredOrders.length === 0) {
            ordersList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <p>No orders found matching your criteria.</p>
                </div>
            `;
        } else {
            displayOrders(filteredOrders);
        }
    }

    // Event listeners
    if (orderSearch) {
        orderSearch.addEventListener('input', filterOrders);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', filterOrders);
    }

    if (closeOrderDetails) {
        closeOrderDetails.addEventListener('click', () => {
            closeModal(orderDetailsModal);
            announceToScreenReader('Order details closed');
        });
    }

    if (orderDetailsModal) {
        orderDetailsModal.addEventListener('click', function(e) {
            if (e.target === orderDetailsModal) {
                closeModal(orderDetailsModal);
                announceToScreenReader('Order details closed');
            }
        });
    }

    // Auto-update order statuses (simulate real-time updates)
    function updateOrderStatuses() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const now = new Date();
        let updated = false;

        orders.forEach(order => {
            const orderDate = new Date(order.orderDate);
            const minutesSinceOrder = (now - orderDate) / (1000 * 60);
            const currentStatus = order.status.toLowerCase().replace(/\s+/g, '_');

            // Auto-update status based on time elapsed
            if (currentStatus === 'confirmed' && minutesSinceOrder >= 5) {
                order.status = 'preparing';
                updated = true;
            } else if (currentStatus === 'preparing' && minutesSinceOrder >= 15) {
                order.status = 'out_for_delivery';
                updated = true;
            } else if (currentStatus === 'out_for_delivery' && minutesSinceOrder >= 30) {
                order.status = 'delivered';
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem('orders', JSON.stringify(orders));
            loadOrders(); // Reload to show updated statuses
        }
    }

    // Update statuses every minute
    setInterval(updateOrderStatuses, 60000);

    // Initial load
    loadOrders();
    updateOrderStatuses(); // Check on initial load
});

