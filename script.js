// Business information
const BUSINESS_INFO = {
    name: "Sobji Haat",
    phone: "+919051410591",
    address: "Jadavpur Sandhya Bazar Rd,West Bengal  kolkata-700075",
    instagram: "https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=seyxfz6",
    facebook: "https://www.facebook.com/sobjihaat?mibextid=ZbWKwL",
    googleReview: "https://maps.app.goo.gl/1DNV5UUPp2MXR81fA",
    deliveryFee: 20,
    freeDeliveryMin: 999,
    servicePincodes: ["700047", "700045", "700075", "700094", "700084", "700092", "700040", "700068", "700095", "700032", "700031"],
    pincodeCharges: {
        "700047": 20, "700045": 25, "700075": 30, "700094": 20, "700084": 25,
        "700092": 30, "700040": 20, "700068": 25, "700031": 30, "700095": 30, "700032": 20
    }
};

// API Configuration
const API_CONFIG = {
    baseURL: 'https://your-backend-domain.onrender.com/api', // Update with your Render URL
    endpoints: {
        products: '/products',
        orders: '/orders',
        settings: '/settings',
        pincodes: '/pincodes'
    }
};

// Initialize products from backend
let PRODUCTS = {
    indian: [], exotic: [], leafy: [], others: []
};

// Cart state
let cart = [];
let currentCategory = 'indian';
let selectedQuantities = {};
let editingProductId = null;
let homePressTimer = null;

// Services animation variables
let servicesCurrentSlide = 0;
let servicesTotalSlides = 1;
let servicesAutoSlideInterval;
let reviewsScrollInterval;

// DOM elements
const productsContainer = document.getElementById('productsContainer');
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const searchInput = document.getElementById('searchInput');
const searchIcon = document.getElementById('searchIcon');
const categoryButtons = document.querySelectorAll('.category-btn');
const categoryImages = document.querySelectorAll('.category-image');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const billingSummary = document.getElementById('billingSummary');
const businessHoursModal = document.getElementById('businessHoursModal');
const notification = document.getElementById('notification');
const adminLoginModal = document.getElementById('adminLoginModal');
const adminPanel = document.getElementById('adminPanel');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const offerBanner = document.getElementById('offerBanner');

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "sobjihaat2025"
};

// API Service Functions
const apiService = {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    },

    // Products
    async getProducts() {
        return this.request(API_CONFIG.endpoints.products);
    },

    async createProduct(productData) {
        return this.request(API_CONFIG.endpoints.products, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },

    async updateProduct(id, productData) {
        return this.request(`${API_CONFIG.endpoints.products}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    },

    async deleteProduct(id) {
        return this.request(`${API_CONFIG.endpoints.products}/${id}`, {
            method: 'DELETE'
        });
    },

    // Orders
    async createOrder(orderData) {
        return this.request(API_CONFIG.endpoints.orders, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    // Settings
    async getSettings() {
        return this.request(API_CONFIG.endpoints.settings);
    },

    async updateSettings(settingsData) {
        return this.request(API_CONFIG.endpoints.settings, {
            method: 'PUT',
            body: JSON.stringify(settingsData)
        });
    },

    // Pincodes
    async getPincodes() {
        return this.request(API_CONFIG.endpoints.pincodes);
    },

    async updatePincodes(pincodesData) {
        return this.request(API_CONFIG.endpoints.pincodes, {
            method: 'PUT',
            body: JSON.stringify(pincodesData)
        });
    }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await initializeApp();
        setupEventListeners();
        updateCartCount();
        updateOfferBanner();
        initReviewsSlider();
        startReviewsAutoScroll();
        initServicesSlider();
    } catch (error) {
        console.error('App initialization failed:', error);
        showNotification('Failed to load products. Using demo data.', 'error');
        loadDemoProducts();
    }
});

// Initialize app data
async function initializeApp() {
    // Load products from backend
    await loadProductsFromBackend();
    
    // Load settings from backend
    await loadSettingsFromBackend();
    
    // Load current category
    loadProducts(currentCategory);
}

// Load products from backend
async function loadProductsFromBackend() {
    try {
        const productsData = await apiService.getProducts();
        
        // Transform backend data to frontend format
        PRODUCTS = {
            indian: productsData.filter(p => p.category === 'indian'),
            exotic: productsData.filter(p => p.category === 'exotic'),
            leafy: productsData.filter(p => p.category === 'leafy'),
            others: productsData.filter(p => p.category === 'others')
        };
    } catch (error) {
        console.error('Failed to load products from backend:', error);
        throw error;
    }
}

// Load settings from backend
async function loadSettingsFromBackend() {
    try {
        const settings = await apiService.getSettings();
        
        // Update BUSINESS_INFO with backend settings
        Object.assign(BUSINESS_INFO, settings);
    } catch (error) {
        console.error('Failed to load settings from backend:', error);
        // Use default settings if backend fails
    }
}

// Load demo products (fallback)
function loadDemoProducts() {
    PRODUCTS = {
        indian: [
            { id: 1, name: "Lemon", price: 5, image: "https://images.unsplash.com/photo-1642372849451-18113b4c5cd2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdyZWVuJTIwbGVtb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600", unit: "piece", stock: 50, category: "indian" },
            // Add more demo products as needed
        ],
        exotic: [],
        leafy: [],
        others: []
    };
}

// FIXED: Smooth Reviews Auto Scroll
function initReviewsSlider() {
    const countElem = document.getElementById('happyCount');
    let count = 0;
    const target = 1200;
    const increment = Math.ceil(target / 100);

    function countUp() {
        if (count < target) {
            count += increment;
            countElem.textContent = count > target ? target : count;
            requestAnimationFrame(countUp);
        }
    }
    countUp();
}

// FIXED: Improved Auto Scroll for Reviews
function startReviewsAutoScroll() {
    const reviewContainer = document.getElementById('reviewContainer');
    let scrollPosition = 0;
    const scrollStep = 1;
    const scrollSpeed = 30;
    let isPaused = false;

    function smoothScroll() {
        if (isPaused) return;
        
        scrollPosition += scrollStep;
        reviewContainer.scrollLeft = scrollPosition;
        
        // Check if we've reached the end
        if (scrollPosition >= reviewContainer.scrollWidth - reviewContainer.clientWidth) {
            // Smooth reset to start
            scrollPosition = 0;
            reviewContainer.scrollLeft = 0;
            
            // Brief pause before restarting
            setTimeout(() => {
                if (!isPaused) {
                    smoothScroll();
                }
            }, 2000);
        } else {
            requestAnimationFrame(smoothScroll);
        }
    }

    // Start scrolling
    smoothScroll();

    // Pause on hover
    reviewContainer.addEventListener('mouseenter', () => {
        isPaused = true;
    });
    
    reviewContainer.addEventListener('mouseleave', () => {
        isPaused = false;
        smoothScroll();
    });

    // Touch events for mobile
    reviewContainer.addEventListener('touchstart', () => {
        isPaused = true;
    });
    
    reviewContainer.addEventListener('touchend', () => {
        isPaused = false;
        smoothScroll();
    });
}

// Update offer banner
function updateOfferBanner() {
    const freeDeliveryMin = BUSINESS_INFO.freeDeliveryMin;
    offerBanner.innerHTML = `
        🚚 Free Delivery on orders above ₹${freeDeliveryMin} within 2km!  
        <div class="slider-item">📞 For Bulk Orders: +919051410591</div>
    `;
}

// Page navigation functions
function showHomePage() {
    document.querySelector('.main-app').style.display = 'block';
    document.getElementById('aboutPage').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'none';
    closeAdminLogin();
}

function showAboutPage() {
    document.querySelector('.main-app').style.display = 'none';
    document.getElementById('aboutPage').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    closeAdminLogin();
}

function showAdminPanel() {
    document.querySelector('.main-app').style.display = 'none';
    document.getElementById('aboutPage').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    closeAdminLogin();
    loadAdminProducts();
    loadAdminSettings();
    loadPincodes();
    loadStockManagement();
}

// Set up event listeners
function setupEventListeners() {
    // Category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            loadCategory(category);
        });
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        filterProducts(this.value);
        updateSearchIcon();
    });

    searchIcon.addEventListener('click', function() {
        searchInput.focus();
        if (searchInput.value.trim() !== '') {
            filterProducts(searchInput.value);
        }
    });

    searchInput.addEventListener('focus', function() {
        window.scrollTo(0, 0);
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            filterProducts(this.value);
            this.blur();
            
            setTimeout(() => {
                const productsSection = document.querySelector('.products-container');
                if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300);
        }
    });

    // Auto scroll to search bar
    document.addEventListener('click', function(e) {
        if (e.target.closest('.search-container') || e.target === searchInput || e.target === searchIcon) {
            const searchContainer = document.querySelector('.search-container');
            const headerHeight = document.querySelector('header').offsetHeight;
            
            window.scrollTo({
                top: searchContainer.offsetTop - headerHeight - 10,
                behavior: 'smooth'
            });
            
            setTimeout(() => {
                searchInput.focus();
            }, 300);
        }
    });

    // Modal close events
    [cartModal, checkoutModal, businessHoursModal, adminLoginModal].forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                if (this === cartModal) closeCart();
                if (this === checkoutModal) closeCheckoutModal();
                if (this === businessHoursModal) closeBusinessHoursModal();
                if (this === adminLoginModal) closeAdminLogin();
            }
        });
    });

    // Pincode validation
    document.getElementById('pincode').addEventListener('input', function() {
        validatePincode(this.value);
    });

    // Admin login form
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            showAdminPanel();
            showNotification('Admin login successful');
        } else {
            showNotification('Invalid credentials', 'error');
        }
    });
}

// Services slider functions (keep your existing implementation)
function initServicesSlider() {
    const servicesContainer = document.getElementById('servicesContainer');
    const serviceCards = servicesContainer.querySelectorAll('.service-card');
    servicesTotalSlides = Math.ceil(serviceCards.length / 3) - 1;
    
    createServicesDots();
    startServicesAutoSlide();
    
    servicesContainer.addEventListener('mouseenter', () => {
        clearInterval(servicesAutoSlideInterval);
    });
    
    servicesContainer.addEventListener('mouseleave', () => {
        startServicesAutoSlide();
    });
}

function createServicesDots() {
    const dotsContainer = document.getElementById('servicesDots');
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i <= servicesTotalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = `services-dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            goToServicesSlide(i);
        });
        dotsContainer.appendChild(dot);
    }
}

function slideServices(direction) {
    if (direction === 'next') {
        servicesCurrentSlide = Math.min(servicesCurrentSlide + 1, servicesTotalSlides);
    } else {
        servicesCurrentSlide = Math.max(servicesCurrentSlide - 1, 0);
    }
    
    updateServicesSlider();
}

function goToServicesSlide(slideIndex) {
    servicesCurrentSlide = slideIndex;
    updateServicesSlider();
}

function updateServicesSlider() {
    const servicesContainer = document.getElementById('servicesContainer');
    const translateX = -servicesCurrentSlide * 100;
    servicesContainer.style.transform = `translateX(${translateX}%)`;
    
    const dots = document.querySelectorAll('.services-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === servicesCurrentSlide);
    });
    
    resetServicesAutoSlide();
}

function startServicesAutoSlide() {
    servicesAutoSlideInterval = setInterval(() => {
        if (servicesCurrentSlide >= servicesTotalSlides) {
            servicesCurrentSlide = 0;
        } else {
            servicesCurrentSlide++;
        }
        updateServicesSlider();
    }, 4000);
}

function resetServicesAutoSlide() {
    clearInterval(servicesAutoSlideInterval);
    startServicesAutoSlide();
}

// Update search icon
function updateSearchIcon() {
    if (searchInput.value.trim() !== '') {
        searchIcon.className = 'search-icon fas fa-times';
        searchIcon.onclick = function() {
            searchInput.value = '';
            filterProducts('');
            updateSearchIcon();
            searchInput.blur();
        };
    } else {
        searchIcon.className = 'search-icon fas fa-search';
        searchIcon.onclick = function() {
            searchInput.focus();
            filterProducts(searchInput.value);
        };
    }
}

// Load category
function loadCategory(category) {
    productsContainer.style.display = 'grid';
    setActiveCategory(category);
    loadProducts(category);
}

// Set active category
function setActiveCategory(category) {
    categoryButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-category') === category) {
            button.classList.add('active');
        }
    });
    
    categoryImages.forEach(image => {
        image.classList.remove('active');
        if (image.getAttribute('data-category') === category) {
            image.classList.add('active');
        }
    });
    
    currentCategory = category;
}

// Load products for a category
function loadProducts(category) {
    const products = PRODUCTS[category];
    productsContainer.innerHTML = '';
    
    if (!products || products.length === 0) {
        productsContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #666;">No products available in this category</div>';
        return;
    }
    
    products.forEach(product => {
        const quantityOptions = getQuantityOptions(product.unit);
        const isOutOfStock = product.stock <= 0;
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            ${isOutOfStock ? '<div class="out-of-stock">Out of Stock</div>' : ''}
            ${product.stock < 10 && product.stock > 0 ? `<div class="stock-badge">Low Stock</div>` : ''}
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">₹${product.price}<span class="unit-display">/${product.unit}</span></div>
                <div class="quantity-selector">
                    <div class="quantity-options" id="quantity-options-${product.id}">
                        ${quantityOptions.map(option => `
                            <div class="quantity-option" data-value="${option.value}" data-product="${product.id}">${option.label}</div>
                        `).join('')}
                    </div>
                    <div class="custom-quantity">
                        <input type="number" class="custom-quantity-input" id="custom-quantity-${product.id}" placeholder="Custom" min="0.1" step="0.1" oninput="validateNumberInput(this)" ${isOutOfStock ? 'disabled' : ''}>
                        <span class="custom-quantity-unit">${product.unit}</span>
                    </div>
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id})" ${isOutOfStock ? 'disabled' : ''}>${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</button>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });

    // Add event listeners to quantity options
    products.forEach(product => {
        setupQuantitySelectors(product.id);
    });
}

// Setup quantity selectors
function setupQuantitySelectors(productId) {
    const optionsContainer = document.getElementById(`quantity-options-${productId}`);
    if (optionsContainer) {
        const options = optionsContainer.querySelectorAll('.quantity-option');
        const customInput = document.getElementById(`custom-quantity-${productId}`);
        
        options.forEach(option => {
            option.addEventListener('click', function() {
                options.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                const quantity = parseFloat(this.getAttribute('data-value'));
                selectedQuantities[productId] = quantity;
                
                if (customInput) {
                    customInput.value = '';
                }
            });
        });
        
        if (customInput) {
            customInput.addEventListener('input', function() {
                const customValue = parseFloat(this.value);
                if (!isNaN(customValue) && customValue > 0) {
                    options.forEach(opt => opt.classList.remove('active'));
                    selectedQuantities[productId] = customValue;
                } else {
                    selectedQuantities[productId] = 0;
                }
            });
        }
    }
}

// Quantity options based on product type
function getQuantityOptions(unit) {
    switch(unit) {
        case 'piece':
        case 'bunch':
        case 'packet':
        case 'tin':
        case 'bottle':
            return [
                { label: "1", value: 1 },
                { label: "2", value: 2 },
                { label: "3", value: 3 },
                { label: "4", value: 4 }
            ];
        case 'kg':
            return [
                { label: "250g", value: 0.25 },
                { label: "500g", value: 0.5 },
                { label: "1kg", value: 1 },
                { label: "2kg", value: 2 }
            ];
        default:
            return [
                { label: "250g", value: 0.25 },
                { label: "500g", value: 0.5 },
                { label: "1kg", value: 1 },
                { label: "2kg", value: 2 }
            ];
    }
}

// Validate number input
function validateNumberInput(input) {
    input.value = input.value.replace(/[^0-9.]/g, '');
    
    if ((input.value.match(/\./g) || []).length > 1) {
        input.value = input.value.substring(0, input.value.lastIndexOf('.'));
    }
    
    const value = parseFloat(input.value);
    if (!isNaN(value) && value > 0) {
        const roundedValue = Math.round(value * 10) / 10;
        input.value = roundedValue;
        selectedQuantities[input.id.replace('custom-quantity-', '')] = roundedValue;
    }
}

// Filter products based on search
function filterProducts(searchTerm) {
    if (searchTerm.trim() === '') {
        loadProducts(currentCategory);
        return;
    }
    
    const allProducts = [];
    for (const category in PRODUCTS) {
        allProducts.push(...PRODUCTS[category]);
    }
    
    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    productsContainer.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #666;">No products found matching your search</div>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const quantityOptions = getQuantityOptions(product.unit);
        const isOutOfStock = product.stock <= 0;
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            ${isOutOfStock ? '<div class="out-of-stock">Out of Stock</div>' : ''}
            ${product.stock < 10 && product.stock > 0 ? `<div class="stock-badge">Low Stock</div>` : ''}
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">₹${product.price}<span class="unit-display">/${product.unit}</span></div>
                <div class="quantity-selector">
                    <div class="quantity-options" id="quantity-options-${product.id}">
                        ${quantityOptions.map(option => `
                            <div class="quantity-option" data-value="${option.value}" data-product="${product.id}">${option.label}</div>
                        `).join('')}
                    </div>
                    <div class="custom-quantity">
                        <input type="number" class="custom-quantity-input" id="custom-quantity-${product.id}" placeholder="Custom" min="0.1" step="0.1" oninput="validateNumberInput(this)" ${isOutOfStock ? 'disabled' : ''}>
                        <span class="custom-quantity-unit">${product.unit}</span>
                    </div>
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id})" ${isOutOfStock ? 'disabled' : ''}>${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</button>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });

    // Add event listeners to quantity options for filtered products
    filteredProducts.forEach(product => {
        setupQuantitySelectors(product.id);
    });
}

// Add product to cart
async function addToCart(productId) {
    if (!selectedQuantities[productId] || selectedQuantities[productId] === 0) {
        showNotification('Please select quantity first');
        return;
    }
    
    const quantity = selectedQuantities[productId];
    
    // Find product in all categories
    let product = null;
    for (const category in PRODUCTS) {
        product = PRODUCTS[category].find(p => p.id === productId);
        if (product) break;
    }
    
    if (!product) return;
    
    if (product.stock <= 0) {
        showNotification('Sorry, this product is out of stock', 'error');
        return;
    }
    
    if (quantity > product.stock) {
        showNotification(`Only ${product.stock} ${product.unit} available`, 'error');
        return;
    }
    
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            unit: product.unit
        });
    }
    
    // Reset selected quantity
    selectedQuantities[productId] = 0;
    
    // Reset active class for quantity options
    const optionsContainer = document.getElementById(`quantity-options-${productId}`);
    if (optionsContainer) {
        const options = optionsContainer.querySelectorAll('.quantity-option');
        options.forEach(opt => opt.classList.remove('active'));
    }
    
    // Clear custom input
    const customInput = document.getElementById(`custom-quantity-${productId}`);
    if (customInput) {
        customInput.value = '';
    }
    
    // Update cart
    updateCartCount();
    showNotification(`${product.name} added to cart`);
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = Math.round(totalItems * 10) / 10;
}

// Open cart modal
function openCart() {
    renderCartItems();
    cartModal.style.display = 'flex';
}

// Close cart modal
function closeCart() {
    cartModal.style.display = 'none';
}

// Render cart items
function renderCartItems() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartTotal.textContent = 'Total: ₹0';
        return;
    }
    
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price}/${item.unit} × ${item.quantity}${getUnitDisplay(item.unit)} = ₹${itemTotal.toFixed(2)}</div>
            </div>
            <div class="cart-item-actions">
                <button class="quantity-btn minus" onclick="updateCartItemQuantity(${item.id}, -${getQuantityStep(item.unit)})">-</button>
                <span class="quantity">${item.quantity}${getUnitDisplay(item.unit)}</span>
                <button class="quantity-btn plus" onclick="updateCartItemQuantity(${item.id}, ${getQuantityStep(item.unit)})">+</button>
                <button class="quantity-btn remove" onclick="removeFromCart(${item.id})" style="background: #e74c3c;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    const total = subtotal + BUSINESS_INFO.deliveryFee;
    
    cartTotal.innerHTML = `
        <div class="billing-row">
            <span>Subtotal:</span>
            <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div class="billing-row">
            <span>Delivery Fee:</span>
            <span>₹${BUSINESS_INFO.deliveryFee}</span>
        </div>
        <div class="billing-row billing-total">
            <span>Total:</span>
            <span>₹${total.toFixed(2)}</span>
        </div>
        <div class="billing-row" style="color: #2e7d32; font-weight: bold;">
            <span>After 5% Cashback:</span>
            <span>₹${(total * 0.95).toFixed(2)}</span>
        </div>
    `;
}

// Get unit display
function getUnitDisplay(unit) {
    switch(unit) {
        case 'piece':
        case 'bunch':
        case 'packet':
        case 'tin':
        case 'bottle':
            return '';
        case 'kg':
            return 'kg';
        default:
            return '';
    }
}

// Get quantity step
function getQuantityStep(unit) {
    switch(unit) {
        case 'piece':
        case 'bunch':
        case 'packet':
        case 'tin':
        case 'bottle':
            return 1;
        case 'kg':
            return 0.1;
        default:
            return 1;
    }
}

// Update cart item quantity
function updateCartItemQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        const newQuantity = cart[itemIndex].quantity + change;
        
        if (newQuantity <= 0) {
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity = newQuantity;
        }
        
        updateCartCount();
        renderCartItems();
    }
}

// Remove item from cart
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cart.splice(itemIndex, 1);
        updateCartCount();
        renderCartItems();
    }
}

// Check business hours
function checkBusinessHours() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + currentMinute/60;
    
    const openTime = 9;
    const closeTime = 22;
    
    if (currentTime >= openTime && currentTime < closeTime) {
        openCheckoutModal();
    } else {
        businessHoursModal.style.display = 'flex';
    }
}

// Open checkout modal
function openCheckoutModal() {
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }
    
    renderBillingSummary();
    checkoutModal.style.display = 'flex';
}

// Close checkout modal
function closeCheckoutModal() {
    checkoutModal.style.display = 'none';
}

// Close business hours modal
function closeBusinessHoursModal() {
    businessHoursModal.style.display = 'none';
}

// Render billing summary
function renderBillingSummary() {
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
    });
    
    const total = subtotal + BUSINESS_INFO.deliveryFee;
    
    billingSummary.innerHTML = `
        <h3>Order Summary</h3>
        ${cart.map(item => `
            <div class="billing-row">
                <span>${item.name} (${item.quantity}${getUnitDisplay(item.unit)})</span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('')}
        <div class="billing-row">
            <span>Subtotal:</span>
            <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div class="billing-row">
            <span>Delivery Fee:</span>
            <span>₹${BUSINESS_INFO.deliveryFee}</span>
        </div>
        <div class="billing-row billing-total">
            <span>Total:</span>
            <span>₹${total.toFixed(2)}</span>
        </div>
        <div class="billing-row" style="color: #2e7d32; font-weight: bold; border-top: 1px dashed #ddd; padding-top: 10px;">
            <span>After 5% Cashback:</span>
            <span>₹${(total * 0.95).toFixed(2)}</span>
        </div>
    `;
}

// Validate pincode
function validatePincode(pincode) {
    if (pincode.length === 6) {
        if (BUSINESS_INFO.servicePincodes.includes(pincode)) {
            const deliveryFee = BUSINESS_INFO.pincodeCharges[pincode] || BUSINESS_INFO.deliveryFee;
            BUSINESS_INFO.deliveryFee = deliveryFee;
            showNotification('Delivery available in your area', 'success');
            return true;
        } else {
            showNotification('Sorry, we don\'t deliver to this pincode yet', 'error');
            return false;
        }
    }
    return null;
}

// Get current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                showNotification('Location fetched successfully');
                document.getElementById('customerAddress').value = 
                    `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Auto-detected)`;
            },
            function(error) {
                showNotification('Unable to get your location. Please enter manually.', 'error');
            }
        );
    } else {
        showNotification('Geolocation is not supported by your browser', 'error');
    }
}

// Validate and process checkout
async function validateAndCheckout() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    const pincode = document.getElementById('pincode').value;
    
    if (!name || !phone || !address || !pincode) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (!validatePincode(pincode)) {
        return;
    }
    
    if (phone.length < 10) {
        showNotification('Please enter a valid phone number', 'error');
        return;
    }
    
    await processCheckout(name, phone, address, pincode);
}

// Process checkout and send to WhatsApp
async function processCheckout(name, phone, address, pincode) {
    try {
        // Prepare order data for backend
        const orderData = {
            customer: { name, phone, address, pincode },
            items: cart,
            subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            deliveryFee: BUSINESS_INFO.deliveryFee,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + BUSINESS_INFO.deliveryFee,
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        // Save order to backend
        await apiService.createOrder(orderData);
        
        // Prepare WhatsApp message
        let message = `*${BUSINESS_INFO.name} - New Order*\n\n`;
        message += `*Customer Details:*\n`;
        message += `Name: ${name}\n`;
        message += `Phone: ${phone}\n`;
        message += `Address: ${address}\n`;
        message += `Pincode: ${pincode}\n`;
        message += `Payment: Cash on Delivery\n\n`;
        message += `*Order Items:*\n`;
        
        let subtotal = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            message += `• ${item.name} - ${item.quantity}${getUnitDisplay(item.unit)} × ₹${item.price} = ₹${itemTotal.toFixed(2)}\n`;
        });
        
        message += `\n*Order Summary:*\n`;
        message += `Subtotal: ₹${subtotal.toFixed(2)}\n`;
        message += `Delivery Fee: ₹${BUSINESS_INFO.deliveryFee}\n`;
        message += `*Total: ₹${(subtotal + BUSINESS_INFO.deliveryFee).toFixed(2)}*\n\n`;
        message += `*SPECIAL OFFER:* Show us your Google Maps review when receiving order to get 5% CASHBACK (Pay only ₹${((subtotal + BUSINESS_INFO.deliveryFee) * 0.95).toFixed(2)})!\n\n`;
        message += `Please confirm order. Thank you!`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${BUSINESS_INFO.phone.replace('+', '')}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
        
        // Clear cart after successful order
        cart = [];
        updateCartCount();
        closeCheckoutModal();
        closeCart();
        
        showNotification('Order sent to WhatsApp successfully!', 'success');
    } catch (error) {
        console.error('Checkout failed:', error);
        showNotification('Failed to save order. Please try again.', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.style.background = type === 'success' ? '#2ecc71' : '#e74c3c';
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Social media functions
function openWhatsApp() {
    window.open(`https://wa.me/${BUSINESS_INFO.phone.replace('+', '')}`, '_blank');
}

function openFacebook() {
    window.open(BUSINESS_INFO.facebook, '_blank');
}

function openInstagram() {
    window.open(BUSINESS_INFO.instagram, '_blank');
}

function openGoogleReview() {
    window.open("https://maps.app.goo.gl/1DNV5UUPp2MXR81fA", '_blank');
}

// Services section functions
function openServiceWhatsApp(serviceType) {
    const message = `Hello Sobji Haat! I'm interested in your ${serviceType} service. Please provide me with more details.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${BUSINESS_INFO.phone.replace('+', '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

// Admin functions
function startHomePress() {
    homePressTimer = setTimeout(function() {
        openAdminLogin();
    }, 10000);
}

function endHomePress() {
    if (homePressTimer) {
        clearTimeout(homePressTimer);
        homePressTimer = null;
    }
}

function openAdminLogin() {
    adminLoginModal.style.display = 'flex';
}

function closeAdminLogin() {
    adminLoginModal.style.display = 'none';
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.admin-tab').forEach(button => {
        button.classList.remove('active');
    });
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

async function loadAdminProducts() {
    try {
        await loadProductsFromBackend();
        const productList = document.getElementById('adminProductList');
        productList.innerHTML = '';
        
        let totalProducts = 0;
        
        for (const category in PRODUCTS) {
            PRODUCTS[category].forEach(product => {
                totalProducts++;
                const productItem = document.createElement('div');
                productItem.className = 'admin-product-item';
                productItem.innerHTML = `
                    <div class="admin-product-info">
                        <div class="admin-product-name">${product.name}</div>
                        <div class="admin-product-details">₹${product.price}/${product.unit} | ${category} | Stock: ${product.stock}</div>
                    </div>
                    <div class="admin-product-actions">
                        <button class="admin-btn edit-btn" onclick="editProduct(${product.id})">Edit</button>
                        <button class="admin-btn delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
                    </div>
                `;
                productList.appendChild(productItem);
            });
        }
        
        document.getElementById('totalProducts').textContent = totalProducts;
    } catch (error) {
        showNotification('Failed to load products', 'error');
    }
}

function filterAdminProducts() {
    const searchTerm = document.getElementById('adminProductSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('adminCategoryFilter').value;
    
    const productList = document.getElementById('adminProductList');
    productList.innerHTML = '';
    
    let totalProducts = 0;
    
    for (const category in PRODUCTS) {
        if (categoryFilter !== 'all' && categoryFilter !== category) continue;
        
        PRODUCTS[category].forEach(product => {
            if (product.name.toLowerCase().includes(searchTerm)) {
                totalProducts++;
                const productItem = document.createElement('div');
                productItem.className = 'admin-product-item';
                productItem.innerHTML = `
                    <div class="admin-product-info">
                        <div class="admin-product-name">${product.name}</div>
                        <div class="admin-product-details">₹${product.price}/${product.unit} | ${category} | Stock: ${product.stock}</div>
                    </div>
                    <div class="admin-product-actions">
                        <button class="admin-btn edit-btn" onclick="editProduct(${product.id})">Edit</button>
                        <button class="admin-btn delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
                    </div>
                `;
                productList.appendChild(productItem);
            }
        });
    }
    
    document.getElementById('totalProducts').textContent = totalProducts;
}

function loadAdminSettings() {
    document.getElementById('deliveryCharge').value = BUSINESS_INFO.deliveryFee;
    document.getElementById('freeDeliveryMin').value = BUSINESS_INFO.freeDeliveryMin;
}

async function saveSettings() {
    try {
        const deliveryCharge = parseInt(document.getElementById('deliveryCharge').value);
        const freeDeliveryMin = parseInt(document.getElementById('freeDeliveryMin').value);
        
        const settingsData = {
            deliveryFee: deliveryCharge,
            freeDeliveryMin: freeDeliveryMin
        };
        
        await apiService.updateSettings(settingsData);
        
        // Update local BUSINESS_INFO
        BUSINESS_INFO.deliveryFee = deliveryCharge;
        BUSINESS_INFO.freeDeliveryMin = freeDeliveryMin;
        
        updateOfferBanner();
        showNotification('Settings saved successfully');
    } catch (error) {
        showNotification('Failed to save settings', 'error');
    }
}

function showAddProductForm() {
    document.getElementById('addProductForm').classList.remove('hidden');
}

function hideAddProductForm() {
    document.getElementById('addProductForm').classList.add('hidden');
    document.getElementById('newProductName').value = '';
    document.getElementById('newProductPrice').value = '';
    document.getElementById('newProductImage').value = '';
    document.getElementById('newProductStock').value = '10';
}

function handleImageUpload(input, targetInputId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // In a real app, upload to cloud storage and get URL
            document.getElementById(targetInputId).value = `Uploaded: ${file.name}`;
            showNotification('Image selected: ' + file.name);
        };
        reader.readAsDataURL(file);
    }
}

async function addNewProduct() {
    try {
        const name = document.getElementById('newProductName').value;
        const price = parseInt(document.getElementById('newProductPrice').value);
        const category = document.getElementById('newProductCategory').value;
        const unit = document.getElementById('newProductUnit').value;
        const stock = parseInt(document.getElementById('newProductStock').value);
        const image = document.getElementById('newProductImage').value;
        
        if (!name || !price || !image) {
            showNotification('Please fill all fields', 'error');
            return;
        }
        
        const productData = {
            name,
            price,
            category,
            unit,
            stock,
            image
        };
        
        await apiService.createProduct(productData);
        
        // Reload products from backend
        await loadProductsFromBackend();
        loadAdminProducts();
        hideAddProductForm();
        showNotification('Product added successfully');
    } catch (error) {
        showNotification('Failed to add product', 'error');
    }
}

function editProduct(productId) {
    let product = null;
    let productCategory = null;
    
    for (const category in PRODUCTS) {
        product = PRODUCTS[category].find(p => p.id === productId);
        if (product) {
            productCategory = category;
            break;
        }
    }
    
    if (!product) return;
    
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductCategory').value = productCategory;
    document.getElementById('editProductUnit').value = product.unit;
    document.getElementById('editProductStock').value = product.stock;
    document.getElementById('editProductImage').value = product.image;
    
    editingProductId = productId;
    document.getElementById('editProductForm').classList.remove('hidden');
}

function hideEditProductForm() {
    document.getElementById('editProductForm').classList.add('hidden');
    editingProductId = null;
}

async function updateProduct() {
    try {
        if (!editingProductId) return;
        
        const name = document.getElementById('editProductName').value;
        const price = parseInt(document.getElementById('editProductPrice').value);
        const category = document.getElementById('editProductCategory').value;
        const unit = document.getElementById('editProductUnit').value;
        const stock = parseInt(document.getElementById('editProductStock').value);
        const image = document.getElementById('editProductImage').value;
        
        if (!name || !price || !image) {
            showNotification('Please fill all fields', 'error');
            return;
        }
        
        const productData = {
            name,
            price,
            category,
            unit,
            stock,
            image
        };
        
        await apiService.updateProduct(editingProductId, productData);
        
        // Reload products from backend
        await loadProductsFromBackend();
        loadAdminProducts();
        hideEditProductForm();
        showNotification('Product updated successfully');
    } catch (error) {
        showNotification('Failed to update product', 'error');
    }
}

async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await apiService.deleteProduct(productId);
            
            // Reload products from backend
            await loadProductsFromBackend();
            loadAdminProducts();
            showNotification('Product deleted successfully');
        } catch (error) {
            showNotification('Failed to delete product', 'error');
        }
    }
}

// Pincode management functions
async function loadPincodes() {
    try {
        const pincodesData = await apiService.getPincodes();
        
        // Update BUSINESS_INFO with backend pincodes
        BUSINESS_INFO.servicePincodes = pincodesData.servicePincodes;
        BUSINESS_INFO.pincodeCharges = pincodesData.pincodeCharges;
        
        const pincodeList = document.getElementById('pincodeList');
        pincodeList.innerHTML = '';
        
        BUSINESS_INFO.servicePincodes.forEach(pincode => {
            const charge = BUSINESS_INFO.pincodeCharges[pincode] || BUSINESS_INFO.deliveryFee;
            const pincodeItem = document.createElement('div');
            pincodeItem.className = 'pincode-item';
            pincodeItem.innerHTML = `
                <div>
                    <strong>${pincode}</strong>
                    <div>Delivery Charge: ₹${charge}</div>
                </div>
                <div class="pincode-actions">
                    <input type="number" class="pincode-charge" value="${charge}" onchange="updatePincodeCharge('${pincode}', this.value)">
                    <button class="admin-btn delete-btn" onclick="removePincode('${pincode}')">Remove</button>
                </div>
            `;
            pincodeList.appendChild(pincodeItem);
        });
    } catch (error) {
        showNotification('Failed to load pincodes', 'error');
    }
}

async function addPincode() {
    try {
        const newPincode = document.getElementById('newPincode').value;
        const newCharge = parseInt(document.getElementById('newPincodeCharge').value);
        
        if (!newPincode || newPincode.length !== 6) {
            showNotification('Please enter a valid 6-digit pincode', 'error');
            return;
        }
        
        if (BUSINESS_INFO.servicePincodes.includes(newPincode)) {
            showNotification('Pincode already exists', 'error');
            return;
        }
        
        // Update local data
        BUSINESS_INFO.servicePincodes.push(newPincode);
        BUSINESS_INFO.pincodeCharges[newPincode] = newCharge;
        
        // Save to backend
        await apiService.updatePincodes({
            servicePincodes: BUSINESS_INFO.servicePincodes,
            pincodeCharges: BUSINESS_INFO.pincodeCharges
        });
        
        document.getElementById('newPincode').value = '';
        document.getElementById('newPincodeCharge').value = '';
        
        loadPincodes();
        showNotification('Pincode added successfully');
    } catch (error) {
        showNotification('Failed to add pincode', 'error');
    }
}

async function updatePincodeCharge(pincode, charge) {
    try {
        BUSINESS_INFO.pincodeCharges[pincode] = parseInt(charge);
        
        await apiService.updatePincodes({
            servicePincodes: BUSINESS_INFO.servicePincodes,
            pincodeCharges: BUSINESS_INFO.pincodeCharges
        });
        
        showNotification('Delivery charge updated');
    } catch (error) {
        showNotification('Failed to update delivery charge', 'error');
    }
}

async function removePincode(pincode) {
    if (confirm('Are you sure you want to remove this pincode?')) {
        try {
            const index = BUSINESS_INFO.servicePincodes.indexOf(pincode);
            if (index !== -1) {
                BUSINESS_INFO.servicePincodes.splice(index, 1);
                delete BUSINESS_INFO.pincodeCharges[pincode];
                
                await apiService.updatePincodes({
                    servicePincodes: BUSINESS_INFO.servicePincodes,
                    pincodeCharges: BUSINESS_INFO.pincodeCharges
                });
                
                loadPincodes();
                showNotification('Pincode removed successfully');
            }
        } catch (error) {
            showNotification('Failed to remove pincode', 'error');
        }
    }
}

// Stock management functions
function loadStockManagement() {
    const stockList = document.getElementById('stockList');
    stockList.innerHTML = '';
    
    let outOfStockCount = 0;
    let lowStockCount = 0;
    
    for (const category in PRODUCTS) {
        PRODUCTS[category].forEach(product => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock < 10;
            
            if (isOutOfStock) outOfStockCount++;
            if (isLowStock) lowStockCount++;
            
            const stockItem = document.createElement('div');
            stockItem.className = 'stock-item';
            stockItem.innerHTML = `
                <div class="stock-info">
                    <div class="stock-name">${product.name}</div>
                    <div class="stock-details">₹${product.price}/${product.unit} | ${category}</div>
                </div>
                <div class="stock-actions">
                    <span class="stock-status ${isOutOfStock ? 'out-of-stock' : 'in-stock'}">
                        ${isOutOfStock ? 'Out of Stock' : (isLowStock ? 'Low Stock' : 'In Stock')}
                    </span>
                    <input type="number" class="stock-input" value="${product.stock}" onchange="updateStock(${product.id}, this.value)">
                    <button class="admin-btn save-btn" onclick="updateStock(${product.id}, document.querySelector('#stockList input[data-product=\"${product.id}\"]').value)">Update</button>
                </div>
            `;
            stockList.appendChild(stockItem);
        });
    }
    
    document.getElementById('totalProducts').textContent = Object.values(PRODUCTS).flat().length;
    document.getElementById('totalOrders').textContent = outOfStockCount + lowStockCount;
}

function filterStockProducts() {
    const searchTerm = document.getElementById('stockSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('stockCategoryFilter').value;
    
    const stockList = document.getElementById('stockList');
    stockList.innerHTML = '';
    
    for (const category in PRODUCTS) {
        if (categoryFilter !== 'all' && categoryFilter !== category) continue;
        
        PRODUCTS[category].forEach(product => {
            if (product.name.toLowerCase().includes(searchTerm)) {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock < 10;
                
                const stockItem = document.createElement('div');
                stockItem.className = 'stock-item';
                stockItem.innerHTML = `
                    <div class="stock-info">
                        <div class="stock-name">${product.name}</div>
                        <div class="stock-details">₹${product.price}/${product.unit} | ${category}</div>
                    </div>
                    <div class="stock-actions">
                        <span class="stock-status ${isOutOfStock ? 'out-of-stock' : 'in-stock'}">
                            ${isOutOfStock ? 'Out of Stock' : (isLowStock ? 'Low Stock' : 'In Stock')}
                        </span>
                        <input type="number" class="stock-input" value="${product.stock}" onchange="updateStock(${product.id}, this.value)">
                        <button class="admin-btn save-btn" onclick="updateStock(${product.id}, document.querySelector('#stockList input[data-product=\"${product.id}\"]').value)">Update</button>
                    </div>
                `;
                stockList.appendChild(stockItem);
            }
        });
    }
}

async function updateStock(productId, newStock) {
    try {
        let product = null;
        
        for (const category in PRODUCTS) {
            product = PRODUCTS[category].find(p => p.id === productId);
            if (product) break;
        }
        
        if (!product) return;
        
        const stockValue = parseInt(newStock);
        
        if (isNaN(stockValue) || stockValue < 0) {
            showNotification('Please enter a valid stock quantity', 'error');
            return;
        }
        
        // Update product stock via API
        await apiService.updateProduct(productId, { stock: stockValue });
        
        // Update local product data
        product.stock = stockValue;
        
        loadStockManagement();
        loadProducts(currentCategory);
        
        showNotification('Stock updated successfully');
    } catch (error) {
        showNotification('Failed to update stock', 'error');
    }
}