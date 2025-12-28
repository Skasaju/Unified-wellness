const API_URL = '';

function getToken() {
    return localStorage.getItem('access_token');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

function updateNav() {
    const token = getToken();
    const navLinks = document.getElementById('navLinks');
    
    if (token) {
        const user = getUser();
        navLinks.innerHTML = `
            <a href="/dashboard">Dashboard</a>
            <a href="/products">Products</a>
            <a href="/blogs">Blogs</a>
            <a href="/profile">Profile</a>
            ${user.role === 'ADMIN' ? '<a href="/admin">Admin</a>' : ''}
            
            <a href="#" onclick="logout()" class="btn-secondary">Logout</a>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="/">Home</a>
            <a href="/products">Products</a>
            <a href="/blogs">Blogs</a>
            <a href="/login">Login</a>
            <a href="/signup" class="btn-primary">Sign Up</a>
        `;
    }
}

function getProductId() {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1];
}

async function loadProduct() {
    const productId = getProductId();

    try {
        const res = await fetch(`${API_URL}/api/products/${productId}`);
        if (!res.ok) throw new Error('Not found');

        const p = await res.json();

        // Update breadcrumb
        document.getElementById('breadcrumbProduct').textContent = p.name;

        // Update main image
        document.getElementById('productImage').src = p.image_url || '/static/images/placeholder.jpg';
        document.getElementById('productImage').alt = p.name;
        document.getElementById('productImage').onerror = function() {
            this.src = '/static/images/placeholder.jpg';
        };

        // Update all thumbnail images with the same image
        document.querySelectorAll('.thumbnail img').forEach(img => {
            img.src = p.image_url || '/static/images/placeholder.jpg';
            img.onerror = function() {
                this.src = '/static/images/placeholder.jpg';
            };
        });

        // Update product info
        document.getElementById('productCategory').textContent = p.category;
        document.getElementById('productName').textContent = p.name;
        document.getElementById('productPrice').textContent = `Rs. ${Number(p.price).toLocaleString()}`;
        document.getElementById('productDescription').textContent = p.description;

        // Calculate and display discount (assuming 20% discount for display)
        const originalPrice = Math.round(p.price * 1.25);
        const discountPercent = Math.round(((originalPrice - p.price) / originalPrice) * 100);
        
        document.querySelector('.original-price').textContent = `Rs. ${originalPrice.toLocaleString()}`;
        document.querySelector('.discount-badge').textContent = `${discountPercent}% OFF`;

        // Update specifications table with available data
        const specsTable = document.querySelector('.specifications-table');
        specsTable.innerHTML = `
            <tr>
                <td>Brand</td>
                <td>Unified Wellness</td>
            </tr>
            <tr>
                <td>Category</td>
                <td>${p.category}</td>
            </tr>
            <tr>
                <td>Product ID</td>
                <td>#${p.id}</td>
            </tr>
            <tr>
                <td>Price</td>
                <td>Rs. ${Number(p.price).toLocaleString()}</td>
            </tr>
            <tr>
                <td>Listed On</td>
                <td>${new Date(p.created_at).toLocaleDateString()}</td>
            </tr>
            <tr>
                <td>Warranty</td>
                <td>1 Year</td>
            </tr>
        `;

    } catch (err) {
        console.error('Failed to load product:', err);
        document.querySelector('.product-detail-container').innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <h2>Product not found</h2>
                <p style="color: #666; margin: 20px 0;">The product you're looking for doesn't exist or has been removed.</p>
                <a href="/products" class="btn-primary" style="display: inline-block; padding: 12px 24px; text-decoration: none;">
                    Back to Products
                </a>
            </div>
        `;
    }
}

function increaseQty() {
    const input = document.getElementById('quantity');
    input.value = parseInt(input.value) + 1;
}

function decreaseQty() {
    const input = document.getElementById('quantity');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

function addToCart() {
    const qty = document.getElementById('quantity').value;
    const productName = document.getElementById('productName').textContent;
    alert(`Added ${qty} x "${productName}" to cart!`);
    
    // Here you can add actual cart functionality
    // For example, save to localStorage or send to backend
}

function buyNow() {
    const qty = document.getElementById('quantity').value;
    const productName = document.getElementById('productName').textContent;
    
    // Check if user is logged in
    const token = getToken();
    if (!token) {
        alert('Please login to proceed with purchase');
        window.location.href = '/login';
        return;
    }
    
    alert(`Proceeding to checkout with ${qty} x "${productName}"`);
    // Here you can redirect to checkout page
    // window.location.href = '/checkout';
}

function toggleWishlist() {
    const btn = event.target;
    const token = getToken();
    
    if (!token) {
        alert('Please login to add items to wishlist');
        window.location.href = '/login';
        return;
    }
    
    if (btn.textContent === '♡') {
        btn.textContent = '♥';
        btn.style.color = '#ff6b6b';
        alert('Added to wishlist!');
    } else {
        btn.textContent = '♡';
        btn.style.color = '';
        alert('Removed from wishlist!');
    }
}

// Thumbnail image switching (all show same image since we only have one)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
        thumb.addEventListener('click', function() {
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Get the main image URL and set it (in this case, all thumbnails have same image)
            const thumbImg = this.querySelector('img').src;
            document.getElementById('productImage').src = thumbImg;
        });
    });
});

// Initialize page
updateNav();
loadProduct();