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
        document.getElementById('userNameNav').textContent = user.name;
        document.getElementById('userAge').textContent = user.age || '--';
        document.getElementById('userHeight').textContent = user.height_cm ? `${user.height_cm} cm` : '--';
        document.getElementById('userWeight').textContent = user.weight_kg ? `${user.weight_kg} kg` : '--';
        document.getElementById('userGoals').textContent = user.goals || '--';
        
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
        document.getElementById('bmiDisplay').querySelector('.metric-value').textContent = data.bmi;
        const categoryEl = document.getElementById('bmiCategory');
        categoryEl.textContent = data.category;
        
        const colors = {
            'Underweight': '#f59e0b',
            'Normal': '#10b981',
            'Overweight': '#f59e0b',
            'Obese': '#ef4444'
        };
        categoryEl.style.backgroundColor = colors[data.category] + '33';
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
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 50,
                    max: 180
                },
                x: {
                    display: false
                }
            },
            plugins: {
                legend: {
                    display: true
                }
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
        document.getElementById('activityStatus').textContent = data.activity;
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

async function generateWorkoutPlan() {
    try {
        document.getElementById('workoutPlan').innerHTML = '<p>Generating personalized workout plan...</p>';
        const response = await fetchWithAuth(`${API_URL}/api/ai/workout-plan`, {
            method: 'POST'
        });
        
        if (!response) return;
        
        const plan = await response.json();
        document.getElementById('workoutPlan').innerHTML = `
            <div style="margin-bottom: 1rem;">
                <strong>Daily:</strong> ${plan.daily}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Weekly:</strong> ${plan.weekly}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Monthly:</strong> ${plan.monthly}
            </div>
            <div>
                <strong>Tips:</strong>
                <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                    ${plan.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        `;
    } catch (error) {
        document.getElementById('workoutPlan').innerHTML = '<p style="color: #ef4444;">Error generating workout plan</p>';
    }
}

async function checkAnomalies() {
    try {
        document.getElementById('anomalyList').innerHTML = '<p>Checking for anomalies...</p>';
        const response = await fetchWithAuth(`${API_URL}/api/heart-rate/anomalies`);
        
        if (!response) return;
        
        const data = await response.json();
        
        if (data.anomalies_detected === 0) {
            document.getElementById('anomalyList').innerHTML = '<p style="color: #10b981;">✓ No anomalies detected</p>';
        } else {
            document.getElementById('anomalyList').innerHTML = data.anomalies.map(a => `
                <div style="padding: 0.5rem; background: #fee2e2; border-radius: 4px; margin-bottom: 0.5rem;">
                    <strong>Alert:</strong> ${a.bpm} BPM (z-score: ${a.z_score}, ${a.severity})
                </div>
            `).join('');
        }
    } catch (error) {
        document.getElementById('anomalyList').innerHTML = '<p style="color: #ef4444;">Error checking anomalies</p>';
    }
}

async function analyzeFood() {
    const fileInput = document.getElementById('foodImage');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select an image first');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        document.getElementById('nutritionResult').innerHTML = '<p>Analyzing image...</p>';
        
        const token = getToken();
        const response = await fetch(`${API_URL}/api/ai/nutrition-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        const data = await response.json();
        document.getElementById('nutritionResult').innerHTML = `
            <div><strong>Food:</strong> ${data.food_name}</div>
            <div><strong>Calories:</strong> ${data.calories} kcal</div>
            <div><strong>Protein:</strong> ${data.protein}g</div>
            <div><strong>Carbs:</strong> ${data.carbs}g</div>
            <div><strong>Fats:</strong> ${data.fats}g</div>
            ${data.portion_size ? `<div><strong>Portion:</strong> ${data.portion_size}</div>` : ''}
        `;
    } catch (error) {
        document.getElementById('nutritionResult').innerHTML = '<p style="color: #ef4444;">Error analyzing image. Make sure OpenAI API key is configured.</p>';
    }
}

async function loadRecommendedProducts() {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/products/recommended`);
        if (!response) return;
        
        const products = await response.json();
        
        if (products.length === 0) {
            document.getElementById('recommendedProducts').innerHTML = '<p>No recommendations available yet</p>';
            return;
        }
        
        document.getElementById('recommendedProducts').innerHTML = products.map(p => `
            <div class="product-card">
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <div class="product-price">$${p.price.toFixed(2)}</div>
                <div class="product-category">${p.category}</div>
                <p style="margin-top: 0.5rem; color: #10b981; font-size: 0.9rem;">
                    ${p.recommendation_reason}
                </p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading recommendations:', error);
    }
}

async function loadSleepHistory() {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/sleep`);
        if (!response) return;
        
        const records = await response.json();
        document.getElementById('sleepHistory').innerHTML = records.slice(0, 5).map(r => `
            <div class="history-item">
                ${new Date(r.date).toLocaleDateString()}: ${r.hours}h (Quality: ${r.quality}/10)
            </div>
        `).join('') || '<p>No sleep records yet</p>';
    } catch (error) {
        console.error('Error loading sleep history:', error);
    }
}

async function loadWorkoutHistory() {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/workouts`);
        if (!response) return;
        
        const workouts = await response.json();
        document.getElementById('workoutHistory').innerHTML = workouts.slice(0, 5).map(w => `
            <div class="history-item">
                ${new Date(w.date).toLocaleDateString()}: ${w.type} - ${w.duration_min}min (${w.calories_burned} cal)
            </div>
        `).join('') || '<p>No workouts logged yet</p>';
    } catch (error) {
        console.error('Error loading workout history:', error);
    }
}

async function loadNutritionHistory() {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/nutrition`);
        if (!response) return;
        
        const nutrition = await response.json();
        document.getElementById('nutritionHistory').innerHTML = nutrition.slice(0, 5).map(n => `
            <div class="history-item">
                ${n.food_name}: ${n.calories} cal (P: ${n.protein}g, C: ${n.carbs}g, F: ${n.fats}g)
            </div>
        `).join('') || '<p>No nutrition records yet</p>';
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
    } catch (error) {
        alert('Error logging sleep');
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
    } catch (error) {
        alert('Error logging workout');
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
    } catch (error) {
        alert('Error logging nutrition');
    }
});

document.getElementById('startHR')?.addEventListener('click', startHeartRateMonitoring);
document.getElementById('stopHR')?.addEventListener('click', stopHeartRateMonitoring);
document.getElementById('generatePlan')?.addEventListener('click', generateWorkoutPlan);
document.getElementById('checkAnomalies')?.addEventListener('click', checkAnomalies);
document.getElementById('analyzefood')?.addEventListener('click', analyzeFood);

if (checkAuth()) {
    initHeartRateChart();
    loadUserData();
    loadRecommendedProducts();
    loadSleepHistory();
    loadWorkoutHistory();
    loadNutritionHistory();
}
