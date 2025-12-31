const API_URL = ''; // Your API base URL (e.g., 'http://localhost:8000')
let selectedFile = null;
let debounceTimer;

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

// ============================================
// NUTRITION LOGGER - Auto-fill from API
// ============================================

// Auto-fill nutrition data when typing food name
document.getElementById('foodName')?.addEventListener('input', function(e) {
    const foodName = e.target.value.trim();
    
    clearTimeout(debounceTimer);
    
    if (foodName.length >= 3) {
        debounceTimer = setTimeout(() => {
            fetchNutritionData(foodName);
        }, 500);
    }
});

async function fetchNutritionData(foodName) {
    try {
        document.getElementById('foodName').style.borderColor = '#3b82f6';
        
        const response = await fetch(`${API_URL}/api/nutrition/search/${encodeURIComponent(foodName)}`);
        const data = await response.json();
        
        if (data.success) {
            // Auto-fill the form fields
            document.getElementById('calories').value = data.calories;
            document.getElementById('protein').value = data.protein;
            document.getElementById('carbs').value = data.carbs;
            document.getElementById('fats').value = data.fats;
            
            document.getElementById('foodName').style.borderColor = '#10b981';
        } else {
            document.getElementById('foodName').style.borderColor = '#e5e7eb';
        }
    } catch (error) {
        console.error('Error fetching nutrition data:', error);
        document.getElementById('foodName').style.borderColor = '#ef4444';
    }
}

// Handle nutrition form submission
document.getElementById('nutritionForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const foodData = {
        food_name: document.getElementById('foodName').value,
        calories: parseFloat(document.getElementById('calories').value) || 0,
        protein: parseFloat(document.getElementById('protein').value) || 0,
        carbs: parseFloat(document.getElementById('carbs').value) || 0,
        fats: parseFloat(document.getElementById('fats').value) || 0
    };
    
    try {
        const token = getToken();
        
        const response = await fetch(`${API_URL}/api/nutrition`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(foodData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Food logged successfully!');
            document.getElementById('nutritionForm').reset();
            // Optionally reload nutrition list or update stats
            loadNutritionLogs();
        } else {
            alert('Error logging food: ' + (result.detail || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error logging food:', error);
        alert('Error logging food. Please try again.');
    }
});

// Load user's nutrition logs
async function loadNutritionLogs() {
    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/nutrition`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayNutritionLogs(data);
        }
    } catch (error) {
        console.error('Error loading nutrition logs:', error);
    }
}

function displayNutritionLogs(logs) {
    const logsContainer = document.getElementById('nutritionLogs');
    if (!logsContainer) return;
    
    if (logs.length === 0) {
        logsContainer.innerHTML = '<p class="no-records">No nutrition records yet</p>';
        return;
    }
    
    logsContainer.innerHTML = logs.map(log => `
        <div class="log-item">
            <div class="log-item-header">${log.food_name}</div>
            <div class="log-item-details">
                <span>🔥 ${log.calories} cal</span>
                <span>💪 ${log.protein}g protein</span>
                <span>🍞 ${log.carbs}g carbs</span>
                <span>🥑 ${log.fats}g fats</span>
            </div>
            <div class="log-date">${new Date(log.date).toLocaleDateString()}</div>
        </div>
    `).join('');
}

// ============================================
// AI FOOD ANALYZER - Image Analysis
// ============================================

// Handle file selection
document.getElementById('foodImage')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    selectedFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `
            <div class="preview-container">
                <img src="${event.target.result}" alt="Food preview">
                <button class="remove-preview" onclick="clearPreview()">×</button>
            </div>
        `;
    };
    reader.readAsDataURL(file);
    
    // Enable analyze button
    document.getElementById('analyzeFood').disabled = false;
});

function clearPreview() {
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('foodImage').value = '';
    document.getElementById('analyzeFood').disabled = true;
    selectedFile = null;
}

async function analyzeFood() {
    if (!selectedFile) {
        alert('Please select an image first');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    const resultDiv = document.getElementById('nutritionResult');
    
    try {
        // Show loading state
        resultDiv.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <h3>Analyzing your food...</h3>
                <p>This may take a few seconds</p>
            </div>
        `;
        
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
        
        if (!response.ok) {
            throw new Error('Analysis failed');
        }
        
        const data = await response.json();
        displayNutritionResult(data);
        saveToHistory(data);
        
    } catch (error) {
        console.error('Error analyzing food:', error);
        resultDiv.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Analysis Failed</h3>
                <p>Unable to analyze the image. Please ensure your API key is configured correctly.</p>
            </div>
        `;
    }
}

function displayNutritionResult(data) {
    const resultDiv = document.getElementById('nutritionResult');
    
    const macros = data.macros || {};
    const micronutrients = data.micronutrients || [];
    
    resultDiv.innerHTML = `
        <div class="nutrition-result-content">
            <div class="result-header">
                <h2>${data.food_name}</h2>
                <span class="portion-badge">${data.estimated_portion_size}</span>
            </div>
            
            <div class="calories-display">
                <div class="calories-circle">
                    <div class="calories-value">${data.calories_kcal}</div>
                    <div class="calories-label">kcal</div>
                </div>
            </div>
            
            <div class="macros-grid">
                <div class="macro-card">
                    <div class="macro-icon">🥩</div>
                    <div class="macro-label">Protein</div>
                    <div class="macro-value">${macros.protein_g}g</div>
                </div>
                <div class="macro-card">
                    <div class="macro-icon">🍞</div>
                    <div class="macro-label">Carbs</div>
                    <div class="macro-value">${macros.carbs_total_g}g</div>
                    <div class="macro-sub">Fiber: ${macros.fiber_g}g | Sugar: ${macros.sugars_g}g</div>
                </div>
                <div class="macro-card">
                    <div class="macro-icon">🥑</div>
                    <div class="macro-label">Fats</div>
                    <div class="macro-value">${macros.fats_total_g}g</div>
                    <div class="macro-sub">Saturated: ${macros.fats_saturated_g}g | Unsaturated: ${macros.fats_unsaturated_g}g</div>
                </div>
            </div>
            
            ${micronutrients.length > 0 ? `
                <div class="micronutrients-section">
                    <h3>Key Micronutrients</h3>
                    <div class="micronutrients-grid">
                        ${micronutrients.map(micro => `
                            <div class="micronutrient-item">
                                <div class="micronutrient-name">${micro.name}</div>
                                <div class="micronutrient-amount">${micro.amount_mg_mcg}</div>
                                <div class="micronutrient-bar">
                                    <div class="micronutrient-progress" style="width: ${Math.min(micro.daily_value_percent, 100)}%"></div>
                                </div>
                                <div class="micronutrient-percent">${micro.daily_value_percent}% DV</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="health-tip">
                <div class="tip-icon">💡</div>
                <div class="tip-content">
                    <h4>Health Tip</h4>
                    <p>${data.summary_and_tips}</p>
                </div>
            </div>
        </div>
    `;
}

function saveToHistory(data) {
    try {
        let history = JSON.parse(localStorage.getItem('nutritionHistory') || '[]');
        history.unshift({
            ...data,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 analyses
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        localStorage.setItem('nutritionHistory', JSON.stringify(history));
        loadHistory();
    } catch (error) {
        console.error('Error saving to history:', error);
    }
}

function loadHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('nutritionHistory') || '[]');
        const historyDiv = document.getElementById('analysisHistory');
        
        if (!historyDiv) return;
        
        if (history.length === 0) {
            historyDiv.innerHTML = '<p class="placeholder-text">No previous analyses</p>';
            return;
        }
        
        historyDiv.innerHTML = history.map((item, index) => `
            <div class="history-card" onclick='displayNutritionResult(${JSON.stringify(item).replace(/'/g, "&#39;")})'>
                <div class="history-card-header">
                    <h4>${item.food_name}</h4>
                    <span class="history-date">${new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="history-card-body">
                    <div class="history-stat">
                        <span class="stat-value">${item.calories_kcal}</span>
                        <span class="stat-label">kcal</span>
                    </div>
                    <div class="history-stat">
                        <span class="stat-value">${item.macros?.protein_g || 0}g</span>
                        <span class="stat-label">Protein</span>
                    </div>
                    <div class="history-stat">
                        <span class="stat-value">${item.macros?.carbs_total_g || 0}g</span>
                        <span class="stat-label">Carbs</span>
                    </div>
                    <div class="history-stat">
                        <span class="stat-value">${item.macros?.fats_total_g || 0}g</span>
                        <span class="stat-label">Fats</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all analysis history?')) {
        localStorage.removeItem('nutritionHistory');
        loadHistory();
    }
}

// Event listeners
document.getElementById('analyzeFood')?.addEventListener('click', analyzeFood);
document.getElementById('clearHistory')?.addEventListener('click', clearHistory);

// Initialize on page load
if (checkAuth()) {
    loadHistory();
    loadNutritionLogs();
}