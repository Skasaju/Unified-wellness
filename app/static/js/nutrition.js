const API_URL = '';
let selectedFile = null;

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
        
        if (history.length === 0) {
            historyDiv.innerHTML = '<p class="placeholder-text">No previous analyses</p>';
            return;
        }
        
        historyDiv.innerHTML = history.map((item, index) => `
            <div class="history-card" onclick="displayNutritionResult(${JSON.stringify(item).replace(/"/g, '&quot;')})">
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

document.getElementById('analyzeFood')?.addEventListener('click', analyzeFood);
document.getElementById('clearHistory')?.addEventListener('click', clearHistory);

if (checkAuth()) {
    loadHistory();
}