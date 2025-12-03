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
            <a href="/products">Products</a>
            <a href="/blogs" class="active">Blogs</a>
            <a href="/profile">Profile</a>
            ${user.role === 'ADMIN' ? '<a href="/admin">Admin</a>' : ''}
            <span>${user.name}</span>
            <a href="#" onclick="logout()" class="btn-secondary">Logout</a>
        `;
        addBtn.style.display = 'inline-block';
    } else {
        navLinks.innerHTML = `
            <a href="/">Home</a>
            <a href="/products">Products</a>
            <a href="/blogs" class="active">Blogs</a>
            <a href="/login">Login</a>
            <a href="/signup" class="btn-primary">Sign Up</a>
        `;
        addBtn.style.display = 'none';
    }
}

async function loadBlogs() {
    try {
        const response = await fetch(`${API_URL}/api/blogs`);
        const blogs = await response.json();
        
        const list = document.getElementById('blogList');
        
        if (blogs.length === 0) {
            list.innerHTML = '<p>No blogs available yet. Be the first to create one!</p>';
            return;
        }
        
        const user = getUser();
        list.innerHTML = blogs.map(blog => {
            const canDelete = user && (user.id === blog.author_id || user.role === 'ADMIN');
            return `
                <div class="blog-item">
                    <h3>${blog.title}</h3>
                    <div class="blog-meta">
                        Posted on ${new Date(blog.created_at).toLocaleDateString()}
                    </div>
                    <div class="blog-content">${blog.content}</div>
                    ${canDelete ? `<button onclick="deleteBlog(${blog.id})" class="btn-secondary">Delete</button>` : ''}
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading blogs:', error);
        document.getElementById('blogList').innerHTML = '<p>Error loading blogs</p>';
    }
}

async function deleteBlog(id) {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    
    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/blogs/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            loadBlogs();
        } else {
            alert('Error deleting blog');
        }
    } catch (error) {
        alert('Error deleting blog');
    }
}

document.getElementById('addBlogBtn')?.addEventListener('click', () => {
    document.getElementById('blogForm').style.display = 'block';
});

document.getElementById('cancelBlog')?.addEventListener('click', () => {
    document.getElementById('blogForm').style.display = 'none';
    document.getElementById('newBlogForm').reset();
});

document.getElementById('newBlogForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('blogTitle').value;
    const content = document.getElementById('blogContent').value;
    
    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/blogs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });
        
        if (response.ok) {
            document.getElementById('blogForm').style.display = 'none';
            e.target.reset();
            loadBlogs();
        } else {
            alert('Error creating blog');
        }
    } catch (error) {
        alert('Error creating blog');
    }
});

updateNav();
loadBlogs();
