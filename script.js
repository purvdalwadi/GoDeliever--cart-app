let cart = [];
let items = [];
let isLoginPage = window.location.pathname.includes('login.html');
let isRegisterPage = window.location.pathname.includes('register.html');
let currentUser = null;

try {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    if (!currentUser || typeof currentUser !== 'object') {
      throw new Error('Invalid user data');
    }
  }
} catch (error) {
  console.error('Error loading user:', error);
  currentUser = null;
  localStorage.removeItem('currentUser');
}

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
  

  
  // Handle login form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Handle register form submission
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
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
  } else if (currentPath.includes('orders.html')) {
    displayOrders();
  }
  
  // Check if user is logged in for protected pages
  if (window.location.pathname.includes('profile.html') || 
      window.location.pathname.includes('orders.html')) {
    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }
  }
  
  // Load profile page content
  if (window.location.pathname.includes('profile.html')) {
    displayProfile();
  }

  // Handle delivery form submission with validation
  const deliveryForm = document.getElementById('delivery-form');
  if (deliveryForm) {
    deliveryForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate form fields
      const fullName = document.getElementById('fullName')?.value.trim();
      const address = document.getElementById('address')?.value.trim();
      const city = document.getElementById('city')?.value.trim();
      const state = document.getElementById('state')?.value.trim();
      const zipCode = document.getElementById('zipCode')?.value.trim();
      const phone = document.getElementById('phone')?.value.trim();

      if (!fullName || !address || !city || !state || !zipCode || !phone) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      // Validate phone number format
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(phone)) {
        showToast('Please enter a valid phone number', 'error');
        return;
      }

      // Validate ZIP code format
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(zipCode)) {
        showToast('Please enter a valid ZIP code', 'error');
        return;
      }

      checkout();
    });
  }

  // Add order confirmation page handling
  if (window.location.pathname.includes('order-confirmation.html')) {
    displayOrderConfirmation();
  }
});

function updateNavigation() {
  const authSection = document.getElementById('auth-section');
  if (!authSection) return;
  
  if (currentUser) {
    // User is logged in
    authSection.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="profile.html">
          <i class="bi bi-person"></i> ${currentUser.name}
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="cart.html">
          <i class="bi bi-cart"></i> Cart
          <span class="badge bg-primary rounded-pill cart-badge" id="cart-count">0</span>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#" id="logout-btn">
          <i class="bi bi-box-arrow-right"></i> Logout
        </a>
      </li>
    `;
    
    // Add logout event listener
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
  } else {
    // User is not logged in
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
  }
  
  updateCartCount();
}

function updateCartCount() {
  try {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
      const itemCount = cart.reduce((total, item) => {
        if (!item || typeof item.quantity !== 'number') {
          return total;
        }
        return total + item.quantity;
      }, 0);
      cartCountElement.textContent = itemCount;
    }
  } catch (error) {
    console.error('Error updating cart count:', error);
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
          image: './vegetables.jpg',
          category: 'grocery'
        },
        {
          id: '2',
          name: 'Organic Fruit Basket', 
          price: 24.99,
          description: 'Fresh, seasonal fruits sourced from local farms.',
          image: './fruits.jpg',
          category: 'grocery'
        },
        {
          id: '3',
          name: 'Artisan Pizza',
          price: 18.50,
          description: 'Classic Margherita pizza with fresh mozzarella and basil.',
          image: './pizza.jpg',
          category: 'italian'
        },
        {
          id: '4',
          name: 'Chicken Burrito Bowl',
          price: 12.95,
          description: 'Rice, beans, grilled chicken, sour cream, guacamole, and pico de gallo.',
          image: './burrito-bowl.jpg',
          category: 'preparedmeals'
        },
        {
          id: '5',
          name: 'Gourmet Burger',
          price: 14.99,
          description: 'Premium beef patty with cheese, lettuce, tomato, onions, and special sauce on a brioche bun.',
          image: './burger.jpg',
          category: 'fastfood'
        },
        {
          id: '6',
          name: 'Fresh Sushi Platter',
          price: 29.99,
          description: 'Assortment of fresh sushi including California rolls, salmon nigiri, and tuna maki.',
          image: './sushi.jpg',
          category: 'sushi'
        },
        {
          id: '7',
          name: 'Premium Coffee',
          price: 4.50,
          description: 'Freshly brewed premium coffee made from sustainably sourced beans.',
          image: './coffee.jpg',
          category: 'beverages'
        },
        {
          id: '8',
          name: 'Pasta Carbonara',
          price: 16.95,
          description: 'Classic Italian pasta with creamy sauce, pancetta, and parmesan cheese.',
          image: './pasta.jpg',
          category: 'italian'
        },
        {
          id: '9',
          name: 'Chocolate Lava Cake',
          price: 8.99,
          description: 'Warm chocolate cake with a molten chocolate center, served with vanilla ice cream.',
          image: './lava-cake.jpg',
          category: 'desserts'
        },
        {
          id: '10',
          name: 'Avocado Toast',
          price: 11.50,
          description: 'Multigrain toast topped with mashed avocado, cherry tomatoes, and microgreens.',
          image: './avocado-toast.jpg',
          category: 'healthy'
        },
        {
          id: '11',
          name: 'Iced Matcha Latte',
          price: 5.75,
          description: 'Refreshing iced matcha latte made with premium grade matcha and almond milk.',
          image: './matcha-latte.jpg',
          category: 'beverages'
        },
        {
          id: '12',
          name: 'Quinoa Bowl',
          price: 13.99,
          description: 'Nutritious bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing.',
          image: './quinoa-bowl.jpg',
          category: 'healthy'
        }
      ];
      
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
                 onerror="this.onerror=null; this.src='../photos/placeholder.svg';"
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
    if (!Array.isArray(cart)) {
      throw new Error('Invalid cart data');
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  } catch (error) {
    console.error('Error saving cart:', error);
    showToast('Error saving cart. Please try again.', 'error');
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
               onerror="this.onerror=null; this.src='../photos/placeholder.svg';"
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
                   onerror="this.onerror=null; this.src='../photos/placeholder.svg';"
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
                 class="img-fluid rounded" 
                 style="object-fit: cover; width: 100%; aspect-ratio: 1/1;"
                 alt="${item.name}"
                 onerror="this.onerror=null; this.src='../photos/placeholder.svg';"
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
                   id="delivery-name">
          </div>
          <div class="mb-3">
            <label for="delivery-phone" class="form-label">Phone Number</label>
            <input type="tel" 
                   class="form-control" 
                   id="delivery-phone">
          </div>
          <div class="mb-3">
            <label for="delivery-address" class="form-label">Delivery Address</label>
            <textarea class="form-control" 
                      id="delivery-address" 
                      rows="3"></textarea>
          </div>
          <div class="mb-3">
            <label for="delivery-instructions" class="form-label">Delivery Instructions (Optional)</label>
            <textarea class="form-control" 
                      id="delivery-instructions" 
                      rows="2"
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
      email: currentUser.email,
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

function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const alertContainer = document.getElementById('alert-container');
  
  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Store current user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    currentUser = user;
    
    // Show success message
    alertContainer.innerHTML = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        Login successful! Redirecting...
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    
    // Redirect to home page after 1 second
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } else {
    // Show error message
    alertContainer.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        Invalid email or password.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }
}

function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const alertContainer = document.getElementById('alert-container');
  
  // Validate password
  if (password.length < 6) {
    alertContainer.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        Password must be at least 6 characters long.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    return;
  }
  
  // Check if passwords match
  if (password !== confirmPassword) {
    alertContainer.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        Passwords do not match.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    return;
  }
  
  // Get existing users
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Check if email already exists
  if (users.some(user => user.email === email)) {
    alertContainer.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        Email already registered.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    return;
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    createdAt: new Date().toISOString()
  };
  
  // Add user to users array
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  // Show success message
  alertContainer.innerHTML = `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      Registration successful! Redirecting to login...
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  
  // Redirect to login page after 1 second
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

function handleLogout(event) {
  event.preventDefault();
  clearUserData();
}

function clearUserData() {
  // Remove specific user-related items
  localStorage.removeItem('currentUser');
  localStorage.removeItem('cart');
  localStorage.removeItem('orders');
  
  // Or clear everything (use with caution)
  // localStorage.clear();
  
  // Update application state
  currentUser = null;
  cart = [];
  
  // Update UI
  updateNavigation();
  updateCartCount();
  
  // Redirect to home page
  window.location.href = 'index.html';
}

function displayProfile() {
  const profileContainer = document.getElementById('profile-container');
  if (!profileContainer) return;

  try {
    // Display user information
    profileContainer.innerHTML = `
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card shadow-sm h-100">
            <div class="card-body p-4">
              <div class="d-flex align-items-center mb-4">
                <div class="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i class="bi bi-person-circle text-primary fs-4"></i>
                </div>
                <div>
                  <h5 class="card-title mb-1">Profile Information</h5>
                  <p class="text-muted small mb-0">Manage your account details</p>
                </div>
              </div>
              <form id="profile-form">
                <div class="mb-3">
                  <label for="profile-name" class="form-label fw-medium">Full Name</label>
                  <input type="text" class="form-control form-control-lg" id="profile-name" value="${currentUser.name}">
                </div>
                <div class="mb-3">
                  <label for="profile-email" class="form-label fw-medium">Email</label>
                  <input type="email" class="form-control form-control-lg" id="profile-email" value="${currentUser.email}" readonly>
                </div>
                <div class="mb-3">
                  <label for="profile-password" class="form-label fw-medium">New Password</label>
                  <input type="password" class="form-control form-control-lg" id="profile-password" placeholder="Leave blank to keep current password">
                </div>
                <div class="mb-4">
                  <label for="profile-confirm-password" class="form-label fw-medium">Confirm New Password</label>
                  <input type="password" class="form-control form-control-lg" id="profile-confirm-password">
                </div>
                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary btn-lg">Update Profile</button>
                  <button type="button" class="btn btn-outline-danger btn-lg" id="delete-account-btn">
                    <i class="bi bi-trash me-2"></i>Delete Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card shadow-sm h-100">
            <div class="card-body p-4">
              <div class="d-flex align-items-center mb-4">
                <div class="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i class="bi bi-clock-history text-primary fs-4"></i>
                </div>
                <div>
                  <h5 class="card-title mb-1">Order History</h5>
                  <p class="text-muted small mb-0">View your past orders</p>
                </div>
              </div>
              <div id="order-history">
                <!-- Order history will be loaded here -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
    document.getElementById('delete-account-btn').addEventListener('click', handleAccountDeletion);

    // Display order history
    displayOrderHistory();
  } catch (error) {
    console.error('Error displaying profile:', error);
    profileContainer.innerHTML = '<div class="alert alert-danger">Error loading profile</div>';
  }
}

function handleProfileUpdate(event) {
  event.preventDefault();
  
  const name = document.getElementById('profile-name').value;
  const password = document.getElementById('profile-password').value;
  const confirmPassword = document.getElementById('profile-confirm-password').value;
  
  // Validate password if changed
  if (password) {
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
  }
  
  // Update user data
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const userIndex = users.findIndex(u => u.email === currentUser.email);
  
  if (userIndex > -1) {
    users[userIndex] = {
      ...users[userIndex],
      name,
      ...(password && { password }) // Only update password if changed
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
    currentUser = users[userIndex];
    
    showToast('Profile updated successfully', 'success');
    updateNavigation();
  }
}

function handleAccountDeletion() {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.filter(u => u.email !== currentUser.email);
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    clearUserData();
    showToast('Account deleted successfully', 'success');
  }
}

function displayOrders() {
  const ordersContainer = document.getElementById('orders-container');
  if (!ordersContainer) {
    console.error('Orders container not found');
    return;
  }
  
  if (!currentUser) {
    console.error('No user logged in');
    ordersContainer.innerHTML = `
      <div class="alert alert-danger d-flex align-items-center">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <div>
        Please <a href="login.html" class="alert-link">login</a> to view your orders.
        </div>
      </div>
    `;
    return;
  }
  
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const userOrders = orders.filter(order => {
    const orderEmail = order.deliveryDetails?.email;
    return orderEmail && currentUser.email && 
           orderEmail.toLowerCase() === currentUser.email.toLowerCase();
  });
  
  if (userOrders.length === 0) {
    ordersContainer.innerHTML = `
      <div class="text-center py-5">
        <div class="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
          <i class="bi bi-bag text-primary fs-2"></i>
        </div>
        <h4 class="mb-3">No Orders Yet</h4>
        <p class="text-muted mb-4">You haven't placed any orders yet. Start shopping to place your first order!</p>
        <a href="index.html" class="btn btn-primary btn-lg">
          <i class="bi bi-shop me-2"></i>Start Shopping
        </a>
      </div>
    `;
    return;
  }
  
  userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  let html = '';
  userOrders.forEach(order => {
    const orderDate = new Date(order.createdAt).toLocaleDateString();
    const orderTime = new Date(order.createdAt).toLocaleTimeString();
    
    html += `
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">Order #${order.id}</h5>
              <small class="text-muted">
                <i class="bi bi-calendar me-1"></i>${orderDate} at ${orderTime}
              </small>
          </div>
            <span class="badge rounded-pill bg-${getStatusBadgeColor(order.status)} px-3 py-2">
              <i class="bi bi-${getStatusIcon(order.status)} me-1"></i>${order.status}
            </span>
        </div>
        </div>
        <div class="card-body p-4">
          <div class="row g-4">
            <div class="col-md-6">
              <div class="bg-light p-3 rounded">
                <h6 class="mb-3">
                  <i class="bi bi-geo-alt me-2 text-primary"></i>Delivery Details
                </h6>
                <p class="mb-1"><strong>${order.deliveryDetails.name}</strong></p>
              <p class="mb-1">${order.deliveryDetails.address}</p>
              <p class="mb-1">${order.deliveryDetails.phone}</p>
                ${order.deliveryDetails.instructions ? `
                  <p class="mb-0 mt-2">
                    <small class="text-muted">
                      <i class="bi bi-info-circle me-1"></i>${order.deliveryDetails.instructions}
                    </small>
                  </p>
                ` : ''}
              </div>
            </div>
            <div class="col-md-6">
              <div class="bg-light p-3 rounded">
                <h6 class="mb-3">
                  <i class="bi bi-receipt me-2 text-primary"></i>Order Summary
                </h6>
                <div class="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>$${order.subtotal.toFixed(2)}</span>
              </div>
                <div class="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>${order.shipping === 0 ? 'FREE' : '$' + order.shipping.toFixed(2)}</span>
              </div>
                <div class="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>$${order.tax.toFixed(2)}</span>
              </div>
                <hr class="my-2">
              <div class="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span>$${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          </div>
          <div class="mt-4">
            <h6 class="mb-3">
              <i class="bi bi-bag me-2 text-primary"></i>Order Items
            </h6>
          <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                <tr>
                  <th>Item</th>
                    <th class="text-end">Price</th>
                    <th class="text-center">Quantity</th>
                    <th class="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                      <td class="text-end">$${item.price.toFixed(2)}</td>
                      <td class="text-center">${item.quantity}</td>
                      <td class="text-end">$${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  ordersContainer.innerHTML = html;
}

function getStatusBadgeColor(status) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'processing':
      return 'info';
    case 'shipped':
      return 'primary';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
}

function getStatusIcon(status) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'clock';
    case 'processing':
      return 'arrow-repeat';
    case 'shipped':
      return 'truck';
    case 'delivered':
      return 'check-circle';
    case 'cancelled':
      return 'x-circle';
    default:
      return 'question-circle';
  }
}

function displayOrderConfirmation() {
  const orderDetailsContainer = document.getElementById('order-details');
  if (!orderDetailsContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');
  
  if (!orderId) {
    orderDetailsContainer.innerHTML = '<div class="alert alert-danger">Order ID not found</div>';
    return;
  }

  try {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      orderDetailsContainer.innerHTML = '<div class="alert alert-danger">Order not found</div>';
      return;
    }

    let itemsHtml = '';
    order.items.forEach(item => {
      itemsHtml += `
        <div class="d-flex justify-content-between mb-2">
          <span>${item.name} × ${item.quantity}</span>
          <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `;
    });

    orderDetailsContainer.innerHTML = `
      <div class="mb-4" >
        <p class="mb-1"><strong>Order ID:</strong> ${order.id}</p>
        <p class="mb-1"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p class="mb-1"><strong>Status:</strong> <span class="badge bg-${getStatusBadgeColor(order.status)}">${order.status}</span></p>
      </div>
      
      <h6>Delivery Details</h6>
      <div class="mb-3">
        <p class="mb-1">${order.deliveryDetails.name}</p>
        <p class="mb-1">${order.deliveryDetails.address}</p>
        <p class="mb-1">${order.deliveryDetails.city}, ${order.deliveryDetails.state} ${order.deliveryDetails.zipCode}</p>
        <p class="mb-1">${order.deliveryDetails.phone}</p>
        ${order.deliveryDetails.instructions ? `<p class="mb-1"><small>Instructions: ${order.deliveryDetails.instructions}</small></p>` : ''}
      </div>
      
      <h6>Items</h6>
      <div class="mb-3">
        ${itemsHtml}
      </div>
      
      <hr>
      
      <div class="d-flex justify-content-between mb-1">
        <span>Subtotal:</span>
        <span>$${order.subtotal.toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between mb-1">
        <span>Shipping:</span>
        <span>${order.shipping === 0 ? 'FREE' : '$' + order.shipping.toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between mb-1">
        <span>Tax:</span>
        <span>$${order.tax.toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between fw-bold">
        <span>Total:</span>
        <span>$${order.total.toFixed(2)}</span>
      </div>
    `;
  } catch (error) {
    console.error('Error displaying order confirmation:', error);
    orderDetailsContainer.innerHTML = '<div class="alert alert-danger">Error loading order details</div>';
  }
}

function displayOrderHistory() {
  const orderHistoryContainer = document.getElementById('order-history');
  if (!orderHistoryContainer) return;

  try {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = orders.filter(order => order.deliveryDetails.email === currentUser.email);

    if (userOrders.length === 0) {
      orderHistoryContainer.innerHTML = `
        <div class="text-center py-4">
          <div class="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
            <i class="bi bi-bag text-primary fs-4"></i>
          </div>
          <p class="text-muted mb-0">You haven't placed any orders yet.</p>
        </div>
      `;
      return;
    }

    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let html = '';
    userOrders.forEach(order => {
      const orderDate = new Date(order.createdAt).toLocaleDateString();
      const orderTime = new Date(order.createdAt).toLocaleTimeString();
      
      html += `
        <div class="card shadow-sm mb-3">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <h6 class="mb-1">Order #${order.id}</h6>
                <small class="text-muted">
                  <i class="bi bi-calendar me-1"></i>${orderDate} at ${orderTime}
                </small>
            </div>
              <span class="badge rounded-pill bg-${getStatusBadgeColor(order.status)} px-2 py-1">
                <i class="bi bi-${getStatusIcon(order.status)} me-1"></i>${order.status}
              </span>
          </div>
            <div class="row g-2">
              <div class="col-md-6">
                <div class="bg-light p-2 rounded">
                  <p class="mb-1"><strong>${order.deliveryDetails.name}</strong></p>
                  <p class="mb-1 small text-muted">${order.deliveryDetails.address}</p>
              </div>
                </div>
              <div class="col-md-6">
                <div class="bg-light p-2 rounded">
                  <div class="d-flex justify-content-between">
                  <span>Total:</span>
                    <span class="fw-bold">$${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            </div>
            <div class="mt-2 text-end">
              <a href="order-confirmation.html?id=${order.id}" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-eye me-1"></i>View Details
              </a>
            </div>
          </div>
        </div>
      `;
    });

    orderHistoryContainer.innerHTML = html;
  } catch (error) {
    console.error('Error displaying order history:', error);
    orderHistoryContainer.innerHTML = '<div class="alert alert-danger">Error loading order history</div>';
  }
}
