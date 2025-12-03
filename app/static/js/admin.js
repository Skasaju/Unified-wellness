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

function checkAuth() {
    const token = getToken();
    const user = getUser();
    if (!token || user.role !== 'ADMIN') {
        window.location.href = '/dashboard';
        return false;
    }
    return true;
}

async function loadAnalytics() {
    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/admin/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        
        const data = await response.json();
        document.getElementById('analytics').innerHTML = `
            <div class="stat-item"><span class="stat-label">Total Users:</span> ${data.total_users}</div>
            <div class="stat-item"><span class="stat-label">Total Workouts:</span> ${data.total_workouts}</div>
            <div class="stat-item"><span class="stat-label">Total Blogs:</span> ${data.total_blogs}</div>
            <div class="stat-item"><span class="stat-label">Total Products:</span> ${data.total_products}</div>
            <div class="stat-item"><span class="stat-label">Total Anomalies:</span> ${data.total_anomalies}</div>
        `;
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

async function loadUsers() {
    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        
        const users = await response.json();
        document.getElementById('userList').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Age</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(u => `
                        <tr>
                            <td>${u.id}</td>
                            <td>${u.name}</td>
                            <td>${u.email}</td>
                            <td>${u.role}</td>
                            <td>${u.age || '--'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        const products = await response.json();
        
        document.getElementById('productList').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(p => `
                        <tr>
                            <td>${p.id}</td>
                            <td>${p.name}</td>
                            <td>$${p.price.toFixed(2)}</td>
                            <td>${p.category}</td>
                            <td>
                                <button onclick="deleteProduct(${p.id})" class="btn-secondary">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            loadProducts();
            loadAnalytics();
        } else {
            alert('Error deleting product');
        }
    } catch (error) {
        alert('Error deleting product');
    }
}

document.getElementById('addProductBtn')?.addEventListener('click', () => {
    document.getElementById('productForm').style.display = 'block';
});

document.getElementById('cancelProduct')?.addEventListener('click', () => {
    document.getElementById('productForm').style.display = 'none';
    document.getElementById('newProductForm').reset();
});

document.getElementById('newProductForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value
    };
    
    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            document.getElementById('productForm').style.display = 'none';
            e.target.reset();
            loadProducts();
            loadAnalytics();
        } else {
            alert('Error creating product');
        }
    } catch (error) {
        alert('Error creating product');
    }
});

if (checkAuth()) {
    loadAnalytics();
    loadUsers();
    loadProducts();
}
