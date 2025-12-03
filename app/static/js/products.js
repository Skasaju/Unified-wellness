const API_URL = '';

function getToken() {
    return localStorage.getItem('access_token');
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
        const user = JSON.parse(localStorage.getItem('user'));
        navLinks.innerHTML = `
            <a href="/dashboard">Dashboard</a>
            <a href="/products" class="active">Products</a>
            <a href="/blogs">Blogs</a>
            <a href="/profile">Profile</a>
            ${user.role === 'ADMIN' ? '<a href="/admin">Admin</a>' : ''}
            <span>${user.name}</span>
            <a href="#" onclick="logout()" class="btn-secondary">Logout</a>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="/">Home</a>
            <a href="/products" class="active">Products</a>
            <a href="/blogs">Blogs</a>
            <a href="/login">Login</a>
            <a href="/signup" class="btn-primary">Sign Up</a>
        `;
    }
}

async function loadProducts(search = '') {
    try {
        const url = search ? `${API_URL}/api/products?search=${encodeURIComponent(search)}` : `${API_URL}/api/products`;
        const response = await fetch(url);
        const products = await response.json();
        
        const grid = document.getElementById('productGrid');
        
        if (products.length === 0) {
            grid.innerHTML = '<p>No products found</p>';
            return;
        }
        
        grid.innerHTML = products.map(p => `
            <div class="product-card">
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <div class="product-price">$${p.price.toFixed(2)}</div>
                <div class="product-category">${p.category}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productGrid').innerHTML = '<p>Error loading products</p>';
    }
}

document.getElementById('searchBtn')?.addEventListener('click', () => {
    const search = document.getElementById('searchInput').value;
    loadProducts(search);
});

document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const search = document.getElementById('searchInput').value;
        loadProducts(search);
    }
});

updateNav();
loadProducts();
