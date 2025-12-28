const API_URL = '';
let heartRateChart = null;
let heartRateWS = null;
let heartRateData = [];

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
    if (!token) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
        logout();
        return null;
    }
    
    return response;
}

async function loadUserData() {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/user/me`);
        if (!response) return;
        
        const user = await response.json();
        
        // Update welcome message
        const firstName = user.email ? user.email.split('@')[0] : 'User';
        document.getElementById('userName').textContent = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        
        // Update stat cards
        document.getElementById('ageValue').textContent = user.age || '--';
        document.getElementById('heightValue').textContent = user.height_cm || '--';
        document.getElementById('weightValue').textContent = user.weight_kg || '--';
        
        loadBMI();
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function loadBMI() {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/bmi`);
        if (!response) return;
        
        const data = await response.json();
        document.getElementById('bmiValue').textContent = data.bmi;
        
        const categoryEl = document.getElementById('bmiCategory');
        categoryEl.textContent = data.category;
        
        const colors = {
            'Underweight': '#f59e0b',
            'Normal': '#10b981',
            'Overweight': '#f59e0b',
            'Obese': '#ef4444'
        };
        categoryEl.style.backgroundColor = colors[data.category] + '20';
        categoryEl.style.color = colors[data.category];
    } catch (error) {
        console.error('Error loading BMI:', error);
    }
}

function initHeartRateChart() {
    const ctx = document.getElementById('heartRateChart').getContext('2d');
    heartRateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Heart Rate (BPM)',
                data: [],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 50,
                    max: 180,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    display: false
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            animation: {
                duration: 0
            }
        }
    });
}

function startHeartRateMonitoring() {
    const user = getUser();
    if (!user) return;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    heartRateWS = new WebSocket(`${protocol}//${window.location.host}/ws/heart-rate/${user.id}`);
    
    heartRateWS.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateHeartRateChart(data.bpm);
        document.getElementById('currentBPM').textContent = `${data.bpm} BPM`;
        
        const activityEl = document.getElementById('activityStatus');
        activityEl.textContent = data.activity;
        activityEl.className = 'activity-badge activity-' + data.activity.toLowerCase().replace(' ', '-');
    };
    
    heartRateWS.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    
    heartRateWS.onclose = () => {
        console.log('WebSocket closed');
    };
    
    document.getElementById('startHR').disabled = true;
    document.getElementById('stopHR').disabled = false;
}

function stopHeartRateMonitoring() {
    if (heartRateWS) {
        heartRateWS.close();
        heartRateWS = null;
    }
    document.getElementById('startHR').disabled = false;
    document.getElementById('stopHR').disabled = true;
}

function updateHeartRateChart(bpm) {
    if (!heartRateChart) return;
    
    const now = new Date().toLocaleTimeString();
    heartRateData.push({ time: now, bpm });
    
    if (heartRateData.length > 30) {
        heartRateData.shift();
    }
    
    heartRateChart.data.labels = heartRateData.map(d => d.time);
    heartRateChart.data.datasets[0].data = heartRateData.map(d => d.bpm);
    heartRateChart.update('none');
}

async function checkAnomalies() {
    try {
        document.getElementById('anomalyList').innerHTML = '<div class="loading-spinner"></div><p>Analyzing heart rate data...</p>';
        const response = await fetchWithAuth(`${API_URL}/api/heart-rate/anomalies`);
        
        if (!response) return;
        
        const data = await response.json();
        
        if (data.anomalies_detected === 0) {
            document.getElementById('anomalyList').innerHTML = `
                <div class="anomaly-success">
                    <div class="success-icon">✓</div>
                    <p>No anomalies detected</p>
                    <span class="success-subtext">Your heart rate is within normal range</span>
                </div>
            `;
        } else {
            document.getElementById('anomalyList').innerHTML = data.anomalies.map(a => `
                <div class="anomaly-alert severity-${a.severity.toLowerCase()}">
                    <div class="anomaly-header">
                        <span class="anomaly-icon">⚠️</span>
                        <span class="anomaly-severity">${a.severity}</span>
                    </div>
                    <div class="anomaly-details">
                        <strong>${a.bpm} BPM</strong> detected
                        <span class="anomaly-score">Z-score: ${a.z_score}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        document.getElementById('anomalyList').innerHTML = '<p class="error-text">Error checking anomalies</p>';
    }
}

async function loadRecommendedProducts() {
    try {
        const token = localStorage.getItem('access_token');

        const res = await fetch('/api/products/recommended', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Failed to fetch recommendations');

        const products = await res.json();
        const container = document.getElementById('recommendedProducts');

        if (!products.length) {
            container.innerHTML = '<p class="placeholder-text">No recommendations available</p>';
            return;
        }

        container.innerHTML = products.slice(0, 4).map(p => `
            <a href="/products/${p.id}" class="product-card-modern">
                <div class="product-image-wrapper">
                    <img src="${p.image_url}" alt="${p.name}">
                </div>
                <div class="product-info-modern">
                    <h4>${p.name}</h4>
                    <p class="product-price">Rs. ${p.price.toLocaleString()}</p>
                    <span class="recommendation-badge">
                        ${p.recommendation_reason}
                    </span>
                </div>
            </a>
        `).join('');
    } catch (err) {
        console.error(err);
        document.getElementById('recommendedProducts').innerHTML =
            '<p class="error-text">Error loading recommendations</p>';
    }
}

async function loadSleepHistory() {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/sleep`);
        if (!response) return;
        
        const records = await response.json();
        const historyHtml = records.slice(0, 5).map(r => `
            <div class="history-item-modern">
                <div class="history-icon">💤</div>
                <div class="history-content">
                    <span class="history-date">${new Date(r.date).toLocaleDateString()}</span>
                    <span class="history-value">${r.hours}h</span>
                    <span class="history-quality">Quality: ${r.quality}/10</span>
                </div>
            </div>
        `).join('');
        
        document.getElementById('sleepHistory').innerHTML = historyHtml || '<p class="placeholder-text">No sleep records yet</p>';
    } catch (error) {
        console.error('Error loading sleep history:', error);
    }
}

async function loadWorkoutHistory() {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/workouts`);
        if (!response) return;
        
        const workouts = await response.json();
        const historyHtml = workouts.slice(0, 5).map(w => `
            <div class="history-item-modern">
                <div class="history-icon">${getWorkoutIcon(w.type)}</div>
                <div class="history-content">
                    <span class="history-date">${new Date(w.date).toLocaleDateString()}</span>
                    <span class="history-value">${w.duration_min}min</span>
                    <span class="history-calories">${w.calories_burned} cal</span>
                </div>
            </div>
        `).join('');
        
        document.getElementById('workoutHistory').innerHTML = historyHtml || '<p class="placeholder-text">No workouts logged yet</p>';
    } catch (error) {
        console.error('Error loading workout history:', error);
    }
}

function getWorkoutIcon(type) {
    const icons = {
        cardio: '🏃',
        strength: '💪',
        yoga: '🧘',
        sports: '⚽'
    };
    return icons[type] || '🏋️';
}

async function loadNutritionHistory() {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/nutrition`);
        if (!response) return;
        
        const nutrition = await response.json();
        const historyHtml = nutrition.slice(0, 5).map(n => `
            <div class="history-item-modern">
                <div class="history-icon">🍽️</div>
                <div class="history-content">
                    <span class="history-title">${n.food_name}</span>
                    <div class="nutrition-macros">
                        <span>${n.calories} cal</span>
                        <span>P: ${n.protein}g</span>
                        <span>C: ${n.carbs}g</span>
                        <span>F: ${n.fats}g</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        document.getElementById('nutritionHistory').innerHTML = historyHtml || '<p class="placeholder-text">No nutrition records yet</p>';
    } catch (error) {
        console.error('Error loading nutrition history:', error);
    }
}

document.getElementById('sleepForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const hours = parseFloat(document.getElementById('sleepHours').value);
    const quality = parseInt(document.getElementById('sleepQuality').value);
    
    try {
        await fetchWithAuth(`${API_URL}/api/sleep`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hours, quality })
        });
        
        e.target.reset();
        loadSleepHistory();
        showNotification('Sleep logged successfully!', 'success');
    } catch (error) {
        showNotification('Error logging sleep', 'error');
    }
});

document.getElementById('workoutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('workoutType').value;
    const duration_min = parseInt(document.getElementById('workoutDuration').value);
    const calories_burned = parseFloat(document.getElementById('workoutCalories').value);
    
    try {
        await fetchWithAuth(`${API_URL}/api/workouts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, duration_min, calories_burned })
        });
        
        e.target.reset();
        loadWorkoutHistory();
        showNotification('Workout logged successfully!', 'success');
    } catch (error) {
        showNotification('Error logging workout', 'error');
    }
});

document.getElementById('nutritionForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const food_name = document.getElementById('foodName').value;
    const calories = parseFloat(document.getElementById('calories').value);
    const protein = parseFloat(document.getElementById('protein').value);
    const carbs = parseFloat(document.getElementById('carbs').value);
    const fats = parseFloat(document.getElementById('fats').value);
    
    try {
        await fetchWithAuth(`${API_URL}/api/nutrition`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ food_name, calories, protein, carbs, fats })
        });
        
        e.target.reset();
        loadNutritionHistory();
        showNotification('Nutrition logged successfully!', 'success');
    } catch (error) {
        showNotification('Error logging nutrition', 'error');
    }
});

function showNotification(message, type) {
    // Simple notification - you can enhance this
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

document.getElementById('startHR')?.addEventListener('click', startHeartRateMonitoring);
document.getElementById('stopHR')?.addEventListener('click', stopHeartRateMonitoring);
document.getElementById('checkAnomalies')?.addEventListener('click', checkAnomalies);

if (checkAuth()) {
    initHeartRateChart();
    loadUserData();
    loadRecommendedProducts();
    loadSleepHistory();
    loadWorkoutHistory();
    loadNutritionHistory();
}