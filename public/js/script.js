let cart = [];
let items = [];
let isLoginPage = window.location.pathname.includes('login.html');
let isRegisterPage = window.location.pathname.includes('register.html');

const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(nav => {
  nav.addEventListener('click', (event) => {
    navLinks.forEach(link => {
      link.classList.remove('active');
      link.style.color = '';
    });
    event.target.classList.add('active');
    event.target.style.color = 'var(--primary)';
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  
  loadItems();
  updateNavigation();
  
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  if (category) {
    const categoryPill = document.querySelector(`.category-pill[data-category="${category}"]`);
    if (categoryPill) {
      categoryPill.classList.add('active', 'btn-primary');
      categoryPill.classList.remove('btn-outline-primary');
    }
    displayItems(category);
  }
  
  const currentPath = window.location.pathname;
  if (currentPath.includes('cart.html')) {
    displayCartItems();
  } else if (currentPath.includes('item-detail.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');
    if (itemId) {
      displayItemDetail(itemId);
    }
  }
});

function updateNavigation() {
  const authSection = document.getElementById('auth-section');
  if (!authSection) return;
  
  authSection.innerHTML = `
    <li class="nav-item">
      <a class="nav-link ${isLoginPage ? 'active' : ''}" href="login.html">Login</a>
    </li>
    <li class="nav-item">
      <a class="nav-link ${isRegisterPage ? 'active' : ''}" href="register.html">Register</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="cart.html">
        <i class="bi bi-cart"></i> Cart
        <span class="badge bg-primary rounded-pill cart-badge" id="cart-count">0</span>
      </a>
    </li>
  `;
  
  updateCartCount();
}

function updateCartCount() {
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = itemCount;
  }
}

function loadItems() {
  try {
    if (!localStorage.getItem('items')) {
      let dummyItems = [
        {
          id: '1',
          name: 'Fresh Vegetables Pack',
          price: 15.99,
          description: 'Fresh, seasonal vegetables sourced from local farms.',
          image: 'photos/vegetables.jpg',
          category: 'grocery'
        },
        {
          id: '2',
          name: 'Organic Fruit Basket', 
          price: 24.99,
          description: 'Fresh, seasonal fruits sourced from local farms.',
          image: 'photos/fruits.jpg',
          category: 'grocery'
        },
        {
          id: '3',
          name: 'Artisan Pizza',
          price: 18.50,
          description: 'Classic Margherita pizza with fresh mozzarella and basil.',
          image: 'photos/pizza.jpg',
          category: 'italian'
        },
        {
          id: '4',
          name: 'Chicken Burrito Bowl',
          price: 12.95,
          description: 'Rice, beans, grilled chicken, sour cream, guacamole, and pico de gallo.',
          image: 'photos/burrito-bowl.jpg',
          category: 'prepared meals'
        },
        {
          id: '5',
          name: 'Gourmet Burger',
          price: 14.99,
          description: 'Premium beef patty with cheese, lettuce, tomato, onions, and special sauce on a brioche bun.',
          image: 'photos/burger.jpg',
          category: 'fast food'
        },
        {
          id: '6',
          name: 'Fresh Sushi Platter',
          price: 29.99,
          description: 'Assortment of fresh sushi including California rolls, salmon nigiri, and tuna maki.',
          image: 'photos/sushi.jpg',
          category: 'sushi'
        },
        {
          id: '7',
          name: 'Premium Coffee',
          price: 4.50,
          description: 'Freshly brewed premium coffee made from sustainably sourced beans.',
          image: 'photos/coffee.jpg',
          category: 'beverages'
        },
        {
          id: '8',
          name: 'Pasta Carbonara',
          price: 16.95,
          description: 'Classic Italian pasta with creamy sauce, pancetta, and parmesan cheese.',
          image: 'photos/pasta.jpg',
          category: 'italian'
        },
        {
          id: '9',
          name: 'Chocolate Lava Cake',
          price: 8.99,
          description: 'Warm chocolate cake with a molten chocolate center, served with vanilla ice cream.',
          image: 'photos/lava-cake.jpg',
          category: 'prepared meals'
        },
        {
          id: '10',
          name: 'Avocado Toast',
          price: 11.50,
          description: 'Multigrain toast topped with mashed avocado, cherry tomatoes, and microgreens.',
          image: 'photos/avocado-toast.jpg',
          category: 'prepared meals'
        },
        {
          id: '11',
          name: 'Iced Matcha Latte',
          price: 5.75,
          description: 'Refreshing iced matcha latte made with premium grade matcha and almond milk.',
          image: 'photos/matcha-latte.jpg',
          category: 'beverages'
        },
        {
          id: '12',
          name: 'Quinoa Bowl',
          price: 13.99,
          description: 'Nutritious bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing.',
          image: 'photos/quinoa-bowl.jpg',
          category: 'prepared meals'
        }
      ];
      
      // Update image paths to use correct relative path
      dummyItems = dummyItems.map(item => ({
        ...item,
        image: item.image.replace('../photos/', 'photos/')
      }));
      
      localStorage.setItem('items', JSON.stringify(dummyItems));
    }
    
    const storedItems = localStorage.getItem('items');
    if (!storedItems) {
      throw new Error('Failed to load items from storage');
    }
    
    items = JSON.parse(storedItems);
    
    const itemsContainer = document.getElementById('items-container');
    if (itemsContainer) {
      displayItems();
    }
  } catch (error) {
    console.error('Error loading items:', error);
    showToast('Error loading items. Please refresh the page.', 'error');
  }
}

function displayItems(category = null) {
  const itemsContainer = document.getElementById('items-container');
  if (!itemsContainer) return;
  
  let filteredItems = items;
  if (category) {
    filteredItems = items.filter(item => item.category === category);
  }
  
  let html = '';
  filteredItems.forEach(item => {
    html += `
      <div class="col-md-6 col-lg-3 mb-4">
        <div class="card item-card h-100">
          <div style="height: 200px; overflow: hidden;">
            <img src="${item.image}" 
                 class="card-img-top w-100 h-100" 
                 alt="${item.name}" 
                 style="object-fit: cover;"
                 onerror="this.onerror=null; this.src='photos/placeholder.jpg';"
                 loading="lazy">
          </div>
          <div class="card-body">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text text-primary fw-bold">$${item.price.toFixed(2)}</p>
            <p class="card-text">${item.description.substring(0, 60)}...</p>
          </div>
          <div class="card-footer bg-white border-top-0">
            <div class="d-flex justify-content-between">
              <a href="item-detail.html?id=${item.id}" class="btn btn-outline-primary btn-sm">View Details</a>
              <button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  itemsContainer.innerHTML = html;
  
  // Add event listeners after DOM update
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      addToCart(id);
    });
  });
}

function addToCart(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item) {
    showToast('Item not found', 'error');
    return;
  }
  
  const existingItemIndex = cart.findIndex(i => i.id === itemId);
  const MAX_QUANTITY = 99; // Maximum allowed quantity per item
  
  if (existingItemIndex > -1) {
    if (cart[existingItemIndex].quantity >= MAX_QUANTITY) {
      showToast(`Maximum quantity (${MAX_QUANTITY}) reached for ${item.name}`, 'error');
      return;
    }
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
  }
  
  saveCart();
  updateCartCount();
  showToast(`${item.name} has been added to your cart!`, 'success');
}

function saveCart() {
  try {
    const cartString = JSON.stringify(cart);
    if (!cartString) {
      throw new Error('Failed to stringify cart');
    }
    localStorage.setItem('cart', cartString);
  } catch (error) {
    console.error('Error saving cart:', error);
    showToast('Error saving cart. Please try again.', 'error');
    // Attempt to recover by clearing the cart
    cart = [];
    localStorage.removeItem('cart');
  }
}

function calculateCartTotals() {
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  
  return { subtotal, shipping, tax, total };
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `position-fixed bottom-0 end-0 p-3`;
  toast.style.zIndex = '11';
  toast.innerHTML = `
    <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">${type === 'success' ? 'Success' : 'Error'}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
}

function displayItemDetail(itemId) {
  const itemDetailContainer = document.getElementById('item-detail');
  if (!itemDetailContainer) return;
  
  const item = items.find(i => i.id === itemId);
  if (!item) {
    itemDetailContainer.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Item not found!
      </div>
    `;
    return;
  }
  
  itemDetailContainer.innerHTML = `
    <div class="row">
      <div class="col-md-6 mb-4">
        <div style="height: 400px; overflow: hidden; border-radius: 8px;">
          <img src="${item.image}" 
               class="w-100 h-100" 
               alt="${item.name}" 
               style="object-fit: cover;"
               onerror="this.onerror=null; this.src='photos/placeholder.jpg';"
               loading="lazy">
        </div>
      </div>
      <div class="col-md-6">
        <h2>${item.name}</h2>
        <p class="text-primary fw-bold fs-4">$${item.price.toFixed(2)}</p>
        <p>${item.description}</p>
        <div class="d-flex align-items-center mb-3">
          <label for="quantity" class="me-2">Quantity:</label>
          <input type="number" 
                 id="quantity" 
                 class="form-control form-control-sm" 
                 style="width: 70px;" 
                 min="1" 
                 max="99"
                 value="1"
                 aria-label="Item quantity">
        </div>
        <button class="btn btn-primary btn-lg add-to-cart-detail" data-id="${item.id}">
          Add to Cart
        </button>
        <a href="index.html" class="btn btn-outline-secondary btn-lg ms-2">
          Continue Shopping
        </a>
      </div>
    </div>
    <div class="row mt-5">
      <div class="col-12">
        <h3>Related Items</h3>
        <div class="row" id="related-items">
        </div>
      </div>
    </div>
  `;
  
  // Add event listener after DOM update
  document.querySelector('.add-to-cart-detail').addEventListener('click', function() {
    const id = this.getAttribute('data-id');
    const quantityInput = document.getElementById('quantity');
    const quantity = parseInt(quantityInput.value) || 1;
    
    if (quantity < 1 || quantity > 99) {
      showToast('Please enter a quantity between 1 and 99', 'error');
      return;
    }
    
    addToCartWithQuantity(id, quantity);
  });
  
  // Display related items
  const relatedItems = items.filter(i => i.category === item.category && i.id !== item.id);
  const relatedItemsContainer = document.getElementById('related-items');
  
  if (relatedItemsContainer) {
    let html = '';
    relatedItems.forEach(relItem => {
      html += `
        <div class="col-6 col-md-3 mb-4">
          <div class="card h-100">
            <div style="height: 200px; overflow: hidden;">
              <img src="${relItem.image}" 
                   class="w-100 h-100" 
                   alt="${relItem.name}" 
                   style="object-fit: cover;"
                   onerror="this.onerror=null; this.src='photos/placeholder.jpg';"
                   loading="lazy">
            </div>
            <div class="card-body">
              <h5 class="card-title">${relItem.name}</h5>
              <p class="card-text text-primary fw-bold">$${relItem.price.toFixed(2)}</p>
            </div>
            <div class="card-footer bg-white border-top-0">
              <a href="item-detail.html?id=${relItem.id}" class="btn btn-outline-primary btn-sm d-block">View Details</a>
            </div>
          </div>
        </div>
      `;
    });
    relatedItemsContainer.innerHTML = html;
  }
}

function addToCartWithQuantity(itemId, quantity) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  
  const existingItemIndex = cart.findIndex(i => i.id === itemId);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: quantity
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  const toast = document.createElement('div');
  toast.className = 'position-fixed bottom-0 end-0 p-3';
  toast.style.zIndex = '11';
  toast.innerHTML = `
    <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">Item Added</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${quantity} ${quantity > 1 ? 'units' : 'unit'} of ${item.name} ${quantity > 1 ? 'have' : 'has'} been added to your cart!
      </div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
}

function displayCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartSummaryContainer = document.getElementById('cart-summary');
  
  if (!cartItemsContainer || !cartSummaryContainer) return;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="text-center py-5 d-flex justify-content-center align-items-center flex-column w-100">
        <h4>Your cart is empty</h4>
        <p>Add some items to your cart to see them here.</p>
        <a href="index.html" class="btn btn-primary mt-3">Browse Items</a>
      </div>
    `;
    cartSummaryContainer.innerHTML = '';
    return;
  }
  
  let html = '';
  cart.forEach(item => {
    html += `
      <div class="card mb-3">
        <div class="row g-0">
          <div class="col-md-2">
            <img src="${item.image}" 
                 class="img-fluid rounded-start" 
                 alt="${item.name}"
                 onerror="this.onerror=null; this.src='photos/placeholder.jpg';"
                 loading="lazy">
          </div>
          <div class="col-md-10">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title">${item.name}</h5>
                <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}">
                  <i class="bi bi-trash"></i> Remove
                </button>
              </div>
              <p class="card-text text-primary fw-bold">$${item.price.toFixed(2)}</p>
              <div class="d-flex align-items-center">
                <button class="btn btn-sm btn-outline-secondary dec-quantity" data-id="${item.id}">-</button>
                <span class="mx-2">${item.quantity}</span>
                <button class="btn btn-sm btn-outline-secondary inc-quantity" data-id="${item.id}">+</button>
                <span class="ms-3">Subtotal: <strong>$${(item.price * item.quantity).toFixed(2)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  cartItemsContainer.innerHTML = html;
  
  const { subtotal, shipping, tax, total } = calculateCartTotals();
  
  cartSummaryContainer.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Delivery Details</h5>
        <form id="delivery-form" class="mb-4">
          <div class="mb-3">
            <label for="delivery-name" class="form-label">Full Name</label>
            <input type="text" 
                   class="form-control" 
                   id="delivery-name" 
                   required
                   minlength="2"
                   maxlength="100"
                   pattern="[A-Za-z\\s]+"
                   title="Please enter a valid name (letters and spaces only)">
          </div>
          <div class="mb-3">
            <label for="delivery-phone" class="form-label">Phone Number</label>
            <input type="tel" 
                   class="form-control" 
                   id="delivery-phone" 
                   required
                   pattern="[0-9]{10}"
                   title="Please enter a valid 10-digit phone number">
          </div>
          <div class="mb-3">
            <label for="delivery-address" class="form-label">Delivery Address</label>
            <textarea class="form-control" 
                      id="delivery-address" 
                      rows="3" 
                      required
                      minlength="10"
                      maxlength="200"></textarea>
          </div>
          <div class="mb-3">
            <label for="delivery-instructions" class="form-label">Delivery Instructions (Optional)</label>
            <textarea class="form-control" 
                      id="delivery-instructions" 
                      rows="2" 
                      maxlength="200"
                      placeholder="Any special instructions for delivery?"></textarea>
          </div>
        </form>

        <h5 class="card-title">Delivery Options</h5>
        <div class="mb-4">
          <div class="form-check mb-2">
            <input class="form-check-input" 
                   type="radio" 
                   name="delivery-option" 
                   id="standard-delivery" 
                   value="standard" 
                   checked>
            <label class="form-check-label" for="standard-delivery">
              Standard Delivery (2-3 days) - $5.99
            </label>
          </div>
          <div class="form-check mb-2">
            <input class="form-check-input" 
                   type="radio" 
                   name="delivery-option" 
                   id="express-delivery" 
                   value="express">
            <label class="form-check-label" for="express-delivery">
              Express Delivery (1 day) - $12.99
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" 
                   type="radio" 
                   name="delivery-option" 
                   id="free-delivery" 
                   value="free"
                   ${subtotal > 50 ? '' : 'disabled'}>
            <label class="form-check-label ${subtotal > 50 ? '' : 'text-muted'}" for="free-delivery">
              Free Delivery (3-5 days) - Available for orders over $50
            </label>
          </div>
        </div>

        <h5 class="card-title">Order Summary</h5>
        <div class="d-flex justify-content-between mb-2">
          <span>Subtotal:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
          <span>Shipping:</span>
          <span id="shipping-cost">${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
          <span>Tax (8%):</span>
          <span>$${tax.toFixed(2)}</span>
        </div>
        <hr>
        <div class="d-flex justify-content-between mb-2 fw-bold">
          <span>Total:</span>
          <span id="total-cost">$${total.toFixed(2)}</span>
        </div>
        <button id="checkout-btn" class="btn btn-primary w-100 mt-3">Proceed to Checkout</button>
        <a href="index.html" class="btn btn-outline-secondary w-100 mt-2">Continue Shopping</a>
      </div>
    </div>
  `;
  
  // Add event listeners after DOM update
  document.querySelectorAll('input[name="delivery-option"]').forEach(radio => {
    radio.addEventListener('change', updateShippingCost);
  });
  
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      removeFromCart(id);
    });
  });
  
  document.querySelectorAll('.dec-quantity').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      decreaseQuantity(id);
    });
  });
  
  document.querySelectorAll('.inc-quantity').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      increaseQuantity(id);
    });
  });
  
  document.getElementById('checkout-btn').addEventListener('click', function() {
    const deliveryForm = document.getElementById('delivery-form');
    if (!deliveryForm.checkValidity()) {
      deliveryForm.reportValidity();
      return;
    }

    const deliveryDetails = {
      name: document.getElementById('delivery-name').value.trim(),
      phone: document.getElementById('delivery-phone').value.trim(),
      address: document.getElementById('delivery-address').value.trim(),
      instructions: document.getElementById('delivery-instructions').value.trim(),
      option: document.querySelector('input[name="delivery-option"]:checked').value
    };

    checkout(deliveryDetails);
  });
}

function removeFromCart(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  displayCartItems();
}

function decreaseQuantity(itemId) {
  const itemIndex = cart.findIndex(item => item.id === itemId);
  
  if (itemIndex > -1) {
    if (cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity -= 1;
    } else {
      cart = cart.filter(item => item.id !== itemId);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCartItems();
  }
}

function increaseQuantity(itemId) {
  const itemIndex = cart.findIndex(item => item.id === itemId);
  const MAX_QUANTITY = 99;
  
  if (itemIndex > -1) {
    if (cart[itemIndex].quantity >= MAX_QUANTITY) {
      showToast(`Maximum quantity (${MAX_QUANTITY}) reached`, 'error');
      return;
    }
    cart[itemIndex].quantity += 1;
    saveCart();
    updateCartCount();
    displayCartItems();
  }
}

function checkout(deliveryDetails) {
  const { subtotal, shipping, tax, total } = calculateCartTotals();
  
  const order = {
    id: 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    items: [...cart],
    subtotal,
    shipping,
    tax,
    total,
    status: 'pending',
    createdAt: new Date().toISOString(),
    deliveryDetails: {
      ...deliveryDetails,
      phone: sanitizePhoneNumber(deliveryDetails.phone)
    }
  };
  
  try {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    cart = [];
    saveCart();
    updateCartCount();
    
    window.location.href = `order-confirmation.html?id=${order.id}`;
  } catch (error) {
    console.error('Error during checkout:', error);
    showToast('Error processing checkout. Please try again.', 'error');
  }
}

function sanitizePhoneNumber(phone) {
  // Remove all non-numeric characters
  return phone.replace(/\D/g, '');
}

function updateShippingCost() {
  const selectedOption = document.querySelector('input[name="delivery-option"]:checked').value;
  const subtotal = calculateCartTotals().subtotal;
  let newShipping = 0;
  
  switch(selectedOption) {
    case 'standard':
      newShipping = 5.99;
      break;
    case 'express':
      newShipping = 12.99;
      break;
    case 'free':
      newShipping = subtotal > 50 ? 0 : 5.99;
      break;
  }
  
  const newTax = subtotal * 0.08;
  const newTotal = subtotal + newShipping + newTax;
  
  const shippingCostElement = document.getElementById('shipping-cost');
  const totalCostElement = document.getElementById('total-cost');
  
  if (shippingCostElement) {
    shippingCostElement.textContent = newShipping === 0 ? 'FREE' : '$' + newShipping.toFixed(2);
  }
  
  if (totalCostElement) {
    totalCostElement.textContent = '$' + newTotal.toFixed(2);
  }
  
  // Update free delivery option availability
  const freeDeliveryOption = document.getElementById('free-delivery');
  if (freeDeliveryOption) {
    if (subtotal > 50) {
      freeDeliveryOption.disabled = false;
      freeDeliveryOption.parentElement.classList.remove('text-muted');
    } else {
      freeDeliveryOption.disabled = true;
      freeDeliveryOption.parentElement.classList.add('text-muted');
    }
  }
}
