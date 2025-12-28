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
    const addBtn = document.getElementById('addBlogBtn');
    
    if (token) {
        const user = getUser();
        navLinks.innerHTML = `
            <a href="/dashboard">Dashboard</a>
            <a href="/nutrition">Nutrition</a>
            <a href="/workout">Workout</a>
            <a href="/products" class="active">Products</a>
            <a href="/blogs">Blogs</a>
            <a href="/profile">Profile</a>
            ${user.role === 'ADMIN' ? '<a href="/admin">Admin</a>' : ''}
            <a href="#" onclick="logout()" class="btn-secondary">Logout</a>
        `;
        addBtn.style.display = 'inline-block';
    } else {
        navLinks.innerHTML = `
            <a href="/">Home</a>
            <a href="/products" class="active">Products</a>
            <a href="/blogs">Blogs</a>
            <a href="/login">Login</a>
            <a href="/signup" class="btn-primary">Sign Up</a>
        `;
        addBtn.style.display = 'none';
    }
}

let selectedCategory = 'ALL';

/* -------------------------
   LOAD CATEGORIES
-------------------------- */
async function loadCategories() {
    try {
        const res = await fetch(`${API_URL}/api/products/categories`);
        const categories = await res.json();

        const list = document.getElementById('categoryList');

        // Reset category list with "All"
        list.innerHTML = `
            <li data-category="ALL" class="active">All</li>
        `;

        // Bind "All" click
        const allLi = list.querySelector('[data-category="ALL"]');
        allLi.onclick = () => {
            document.querySelectorAll('.category-list li')
                .forEach(el => el.classList.remove('active'));
            allLi.classList.add('active');
            selectedCategory = 'ALL';
            loadProducts();
        };

        // Add dynamic categories
        categories.forEach(cat => {
            const li = document.createElement('li');
            li.textContent = cat;
            li.dataset.category = cat;

            li.onclick = () => {
                document.querySelectorAll('.category-list li')
                    .forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                selectedCategory = cat;
                loadProducts();
            };

            list.appendChild(li);
        });

    } catch (err) {
        console.error('Failed to load categories', err);
    }
}

/* -------------------------
   LOAD PRODUCTS
-------------------------- */
async function loadProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '<p>Loading products...</p>';

    const search = document.getElementById('searchInput').value.trim();
    const params = new URLSearchParams();

    if (search) params.append('search', search);
    if (selectedCategory !== 'ALL') {
        params.append('category', selectedCategory);
    }

    try {
        const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
        const products = await res.json();

        if (!products.length) {
            grid.innerHTML = '<p>No products found</p>';
            return;
        }

        grid.innerHTML = products.map(p => `
            <a href="/products/${p.id}" class="product-card">
                <img 
                    src="${p.image_url || '/static/images/placeholder.jpg'}" 
                    alt="${p.name}"
                    onerror="this.src='/static/images/placeholder.jpg'"
                >
                <div class="product-info">
                    <h4>${p.name}</h4>
                    <p class="price">Rs. ${Number(p.price).toLocaleString()}</p>
                </div>
            </a>
        `).join('');

    } catch (err) {
        console.error('Failed to load products', err);
        grid.innerHTML = '<p>Error loading products</p>';
    }
}

/* -------------------------
   SEARCH EVENTS
-------------------------- */
document.getElementById('searchBtn').onclick = loadProducts;

document.getElementById('searchInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') loadProducts();
});

/* -------------------------
   INIT
-------------------------- */

loadCategories();

loadProducts();
updateNav();
