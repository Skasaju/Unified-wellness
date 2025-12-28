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

async function loadUserProfile() {
    try {
        const response = await fetchWithAuth(`${API_URL}/api/user/me`);
        if (!response) return;
        
        const user = await response.json();
        document.getElementById('profileAge').textContent = user.age || '--';
        document.getElementById('profileGoals').textContent = user.goals || '--';
        
        // Calculate and display BMI
        const bmiResponse = await fetchWithAuth(`${API_URL}/api/bmi`);
        if (bmiResponse) {
            const bmiData = await bmiResponse.json();
            document.getElementById('profileBMI').textContent = bmiData.bmi || '--';
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

async function generateWorkoutPlan() {
    const loadingState = document.getElementById('loadingState');
    const generateBtn = document.getElementById('generatePlan');
    
    try {
        loadingState.style.display = 'block';
        generateBtn.disabled = true;
        
        const response = await fetchWithAuth(`${API_URL}/api/ai/workout-plan`, {
            method: 'POST'
        });
        
        if (!response) {
            throw new Error('Failed to generate plan');
        }
        
        const plan = await response.json();
        displayWorkoutPlan(plan);
        saveWorkoutPlan(plan);
        
    } catch (error) {
        console.error('Error generating workout plan:', error);
        alert('Error generating workout plan. Please ensure your API is configured correctly.');
    } finally {
        loadingState.style.display = 'none';
        generateBtn.disabled = false;
    }
}

function displayWorkoutPlan(plan) {
    document.getElementById('workoutPlanSection').style.display = 'block';
    
    // Daily plans
    const dailyPlansContainer = document.getElementById('dailyPlansContainer');
    if (plan.daily_plan && plan.daily_plan.length > 0) {
        dailyPlansContainer.innerHTML = plan.daily_plan.map((day, index) => {
            // Check if it's a rest/recovery day
            const isRestDay = day.exercises.length === 0 || day.focus.toLowerCase().includes('rest');
            
            return `
            <div class="daily-plan-card ${isRestDay ? 'rest-day-card' : ''}">
                <div class="day-header">
                    <h3>${day.day}</h3>
                    <span class="day-focus">${day.focus}</span>
                </div>
                
                ${day.warm_up && day.warm_up.length > 0 ? `
                <div class="day-section">
                    <h4>🔥 Warm-up</h4>
                    <ul class="activity-list">
                        ${day.warm_up.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${day.exercises && day.exercises.length > 0 ? `
                <div class="day-section">
                    <h4>💪 Main Exercises</h4>
                    <div class="exercises-table">
                        ${day.exercises.map(ex => `
                            <div class="exercise-row">
                                <div class="exercise-main">
                                    <span class="exercise-name">${ex.name}</span>
                                    <span class="muscle-group">${ex.muscle_group}</span>
                                </div>
                                <div class="exercise-details">
                                    <span class="exercise-stat">📊 ${ex.sets} sets</span>
                                    <span class="exercise-stat">🔢 ${ex.reps}</span>
                                    <span class="exercise-stat">⏱️ ${ex.rest_seconds}s rest</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${day.cardio && day.cardio !== 'No structured cardio planned.' ? `
                <div class="day-section">
                    <h4>🏃 Cardio</h4>
                    <p class="cardio-text">${day.cardio}</p>
                </div>
                ` : ''}
                
                ${day.cool_down && day.cool_down.length > 0 ? `
                <div class="day-section">
                    <h4>🧘 Cool-down & Stretching</h4>
                    <ul class="activity-list">
                        ${day.cool_down.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${isRestDay && day.cardio === 'No structured cardio planned.' ? `
                <div class="rest-day-message">
                    <div class="rest-icon">😴</div>
                    <p>Complete rest day - Focus on recovery, sleep, and nutrition</p>
                </div>
                ` : ''}
            </div>
        `;
        }).join('');
    } else {
        dailyPlansContainer.innerHTML = '<p class="placeholder-text">No daily plans available</p>';
    }
    
    // Weekly and Monthly progression tabs
    document.getElementById('weeklyOverviewTab').textContent = plan.weekly_overview || 'No weekly overview available';
    document.getElementById('monthlyProgressionTab').textContent = plan.monthly_progression || 'No progression plan available';
    
    // Personalized tips as cards
    const tipsContainer = document.getElementById('personalizedTipsGrid');
    if (plan.personalized_tips && plan.personalized_tips.length > 0) {
        tipsContainer.innerHTML = plan.personalized_tips.map((tip, index) => {
            const icons = ['🎯', '💪', '💧', '👂', '😴', '📊'];
            const colors = ['#667eea', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
            const icon = icons[index % icons.length];
            const color = colors[index % colors.length];
            
            // Extract title from tip (text before first colon or period)
            const titleMatch = tip.match(/\*\*(.+?)\*\*/);
            const title = titleMatch ? titleMatch[1] : `Tip ${index + 1}`;
            const content = tip.replace(/\*\*(.+?)\*\*\s*/, '');
            
            return `
                <div class="tip-card" style="border-left-color: ${color}">
                    <div class="tip-card-icon" style="background: ${color}20; color: ${color}">
                        ${icon}
                    </div>
                    <div class="tip-card-content">
                        <h4>${title}</h4>
                        <p>${content}</p>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        tipsContainer.innerHTML = '<p class="placeholder-text">No personalized tips available</p>';
    }
    
    // Scroll to plan
    document.getElementById('workoutPlanSection').scrollIntoView({ behavior: 'smooth' });
}

function saveWorkoutPlan(plan) {
    try {
        let savedPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
        
        savedPlans.unshift({
            ...plan,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 5 plans
        if (savedPlans.length > 5) {
            savedPlans = savedPlans.slice(0, 5);
        }
        
        localStorage.setItem('workoutPlans', JSON.stringify(savedPlans));
        loadSavedPlans();
        
        showNotification('Workout plan saved!', 'success');
    } catch (error) {
        console.error('Error saving plan:', error);
    }
}

function loadSavedPlans() {
    try {
        const savedPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
        const container = document.getElementById('savedPlans');
        
        if (savedPlans.length === 0) {
            container.innerHTML = '<p class="placeholder-text">No saved plans yet</p>';
            return;
        }
        
        container.innerHTML = savedPlans.map(plan => `
            <div class="saved-plan-card">
                <div class="saved-plan-header">
                    <h4>Workout Plan</h4>
                    <span class="saved-date">${new Date(plan.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="saved-plan-info">
                    <p>${plan.weekly_overview?.substring(0, 100)}...</p>
                </div>
                <div class="saved-plan-actions">
                    <button onclick='displayWorkoutPlan(${JSON.stringify(plan).replace(/'/g, "\\'")})'  class="btn-secondary btn-sm">
                        View Plan
                    </button>
                    <button onclick="deletePlan(${plan.id})" class="btn-danger btn-sm">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading saved plans:', error);
    }
}

function deletePlan(planId) {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    try {
        let savedPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
        savedPlans = savedPlans.filter(plan => plan.id !== planId);
        localStorage.setItem('workoutPlans', JSON.stringify(savedPlans));
        loadSavedPlans();
        showNotification('Plan deleted', 'success');
    } catch (error) {
        console.error('Error deleting plan:', error);
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

document.getElementById('generatePlan')?.addEventListener('click', generateWorkoutPlan);

document.getElementById('savePlan')?.addEventListener('click', () => {
    // The plan is already saved when generated, just show confirmation
    showNotification('Plan is already saved!', 'info');
});

// Tab switching functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        btn.classList.add('active');
        document.getElementById(tabName + 'Tab').classList.add('active');
    });
});

if (checkAuth()) {
    loadUserProfile();
    loadSavedPlans();
}