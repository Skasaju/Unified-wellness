const API_URL = '';

function getToken() {
    return localStorage.getItem('access_token');
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

async function loadProfile() {
    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/user/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        const user = await response.json();
        
        document.getElementById('name').value = user.name || '';
        document.getElementById('age').value = user.age || '';
        document.getElementById('gender').value = user.gender || '';
        document.getElementById('height').value = user.height_cm || '';
        document.getElementById('weight').value = user.weight_kg || '';
        document.getElementById('goals').value = user.goals || '';
        document.getElementById('diet_type').value = user.diet_type || '';
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function showMessage(message, type = 'success') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value || null,
        age: parseInt(document.getElementById('age').value) || null,
        gender: document.getElementById('gender').value || null,
        height_cm: parseFloat(document.getElementById('height').value) || null,
        weight_kg: parseFloat(document.getElementById('weight').value) || null,
        goals: document.getElementById('goals').value || null,
        diet_type: document.getElementById('diet_type').value || null
    };
    
    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/user/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('user', JSON.stringify(user));
            showMessage('Profile updated successfully!', 'success');
        } else {
            showMessage('Error updating profile', 'error');
        }
    } catch (error) {
        showMessage('Error updating profile', 'error');
    }
});

if (checkAuth()) {
    loadProfile();
}
