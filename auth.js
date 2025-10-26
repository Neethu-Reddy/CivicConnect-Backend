// Auth form handlers
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Admin login listener
    document.getElementById('adminLoginBtn')?.addEventListener('click', openAdminLoginModal);
});

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123',
    email: 'admin@civicconnect.com'
};

function openAdminLoginModal() {
    if (!document.getElementById('adminLoginModal')) {
        createAdminLoginModal();
    }
    
    document.getElementById('adminLoginModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function createAdminLoginModal() {
    const adminModal = document.createElement('div');
    adminModal.id = 'adminLoginModal';
    adminModal.className = 'modal';
    adminModal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="login-header">
                <h2><i class="fas fa-user-shield"></i> Admin Login</h2>
                <p>Access administrative controls</p>
            </div>
            <form id="adminLoginForm">
                <div class="form-group">
                    <label for="adminUsername">Username</label>
                    <input type="text" id="adminUsername" class="form-control" placeholder="Enter admin username" required>
                </div>
                <div class="form-group">
                    <label for="adminPassword">Password</label>
                    <input type="password" id="adminPassword" class="form-control" placeholder="Enter admin password" required>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary btn-large" style="width: 100%;">
                        <i class="fas fa-sign-in-alt"></i> Admin Login
                    </button>
                </div>
            </form>
            <div class="login-footer">
                <p><strong>Contact system administrator for credentials</strong></p>
            </div>
        </div>
    `;
    
    document.body.appendChild(adminModal);
    
    // Add event listeners
    adminModal.querySelector('.close').addEventListener('click', () => {
        adminModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    adminModal.querySelector('#adminLoginForm').addEventListener('submit', handleAdminLogin);
    
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (!username || !password) {
        showAlert('Please enter both username and password', 'error');
        return;
    }

    try {
        showAlert('Authenticating admin...', 'info');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            localStorage.setItem('adminToken', 'admin-token-' + Date.now());
            localStorage.setItem('adminUser', ADMIN_CREDENTIALS.username);
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('authToken', 'auth-token-' + Date.now());
            localStorage.setItem('userEmail', ADMIN_CREDENTIALS.email);
            localStorage.setItem('userName', 'Administrator');
            
            showAlert('Admin login successful!', 'success');
            document.getElementById('adminLoginModal').style.display = 'none';
            document.body.style.overflow = 'auto';
            
            updateAuthUI();
            
            // Load admin dashboard
            if (typeof loadAdminDashboard === 'function') {
                loadAdminDashboard();
            }
            
            e.target.reset();
        } else {
            showAlert('Invalid admin credentials', 'error');
        }
    } catch (error) {
        showAlert('Admin login failed. Please try again.', 'error');
    }
}

// Updated handleLogin function: Checks Sheets API, then localStorage fallback.
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    try {
        showAlert('Logging in...', 'info');
        
        // 1. Check if it's admin login first (Admin email/password)
        const isAdminLogin = email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
        
        if (isAdminLogin) {
            // Admin login with email
            const authToken = 'admin-token-' + Date.now();
            const userName = 'Administrator';
            const userRole = 'admin';
            const userData = ADMIN_CREDENTIALS;
            
            localStorage.setItem('adminToken', authToken);
            localStorage.setItem('adminUser', ADMIN_CREDENTIALS.username);
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userEmail', ADMIN_CREDENTIALS.email);
            localStorage.setItem('userName', userName);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            showAlert('Admin login successful!', 'success');
            document.getElementById('loginModal').style.display = 'none';
            document.body.style.overflow = 'auto';
            
            updateAuthUI();
            if (typeof loadAdminDashboard === 'function') loadAdminDashboard();
            e.target.reset();
            return;
        }
        
        // 2. Try to login from Google Sheets API
        let user;
        try {
            const userResult = await sheetsService.getUser(email, password);
            if (userResult.success && userResult.user) {
                user = userResult.user;
            }
        } catch (sheetsError) {
            console.warn('Sheets API login failed. Falling back to local storage.', sheetsError);
        }

        // 3. Fallback to localStorage for demo account or existing local users
        if (!user) {
            const users = JSON.parse(localStorage.getItem('civicconnect_users') || '[]');
            user = users.find(u => u.email === email && u.password === password);
            
            if (!user && (email === 'demo@civicconnect.com' && password === 'password')) {
                 // Demo login
                 user = {
                    id: 'demo',
                    fullName: 'Demo User',
                    email: 'demo@civicconnect.com',
                    createdAt: new Date().toISOString(),
                    role: 'user',
                    profile: {}
                };
            }
        }
        
        if (user) {
            // Successful login
            const authToken = 'auth-token-' + Date.now();
            const userName = user.fullName || 'User';
            const userRole = user.role || 'user';
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', userName);
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('userProfile', JSON.stringify(user)); // Stored for profile/dashboard use
            
            showAlert('Login successful! Welcome back, ' + userName + '!', 'success');
            document.getElementById('loginModal').style.display = 'none';
            document.body.style.overflow = 'auto';
            
            updateAuthUI();
            if (userRole === 'admin' && typeof loadAdminDashboard === 'function') {
                loadAdminDashboard();
            } else if (typeof loadDashboard === 'function') {
                loadDashboard();
            }
            
            loadUserData();
        } else {
            showAlert('Invalid email or password', 'error');
        }
        
        e.target.reset();
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Login failed. Please try again.', 'error');
    }
}

// Updated handleSignup function: Saves user to Sheets API, then localStorage fallback.
async function handleSignup(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
    }

    // Check if trying to register with admin email
    if (email === ADMIN_CREDENTIALS.email) {
        showAlert('This email is reserved for administrator use', 'error');
        return;
    }

    try {
        showAlert('Creating account...', 'info');
        
        // Check if user already exists in localStorage (pre-check or fallback)
        const users = JSON.parse(localStorage.getItem('civicconnect_users') || '[]');
        if (users.find(u => u.email === email)) {
            showAlert('User with this email already exists', 'error');
            return;
        }

        // Create new user with complete profile
        const newUser = {
            id: Date.now(),
            fullName,
            email,
            password, // NOTE: In a real app, this should be a hashed password.
            createdAt: new Date().toISOString(),
            role: 'user',
            profile: {
                joined: new Date().toISOString(),
                reportsCount: 0,
                lastActive: new Date().toISOString()
            }
        };
        
        // Save to Google Sheets
        const saveResult = await sheetsService.saveUser(newUser);
        
        if (!saveResult.success) {
            // Do not throw error here, just log and continue to localStorage fallback
            console.error('Sheets API save failed, saving to localStorage only.', saveResult.error);
            showAlert('Account created, but online database save failed. Reports may not persist.', 'warning');
        }
        
        // Also save to localStorage as a fallback/cache
        users.push(newUser);
        localStorage.setItem('civicconnect_users', JSON.stringify(users));
        
        // Auto-login after signup
        const authToken = 'auth-token-' + Date.now();
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', fullName);
        localStorage.setItem('userRole', 'user');
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('userProfile', JSON.stringify(newUser));
        
        showAlert('Account created successfully! Welcome to CivicConnect!', 'success');
        document.getElementById('signupModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        
        updateAuthUI();
        if (typeof loadDashboard === 'function') loadDashboard();
        loadUserData();
        
        e.target.reset();
    } catch (error) {
        console.error('Signup error:', error);
        showAlert('Signup failed. Please try again.', 'error');
    }
}

// Load user-specific data after login
function loadUserData() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    // NOTE: This currently only loads reports from localStorage.
    // For a fully persistent app, it should call sheetsService.getUserReports() 
    // and merge/update the local storage cache.
    try {
        const allReports = JSON.parse(localStorage.getItem('civicconnect_reports') || '[]');
        const userReports = allReports.filter(report => report.userId === userEmail);
        
        // Update user stats
        const users = JSON.parse(localStorage.getItem('civicconnect_users') || '[]');
        const userIndex = users.findIndex(u => u.email === userEmail);
        
        if (userIndex !== -1) {
            if (!users[userIndex].profile) {
                users[userIndex].profile = {};
            }
            users[userIndex].profile.reportsCount = userReports.length;
            users[userIndex].profile.lastActive = new Date().toISOString();
            
            localStorage.setItem('civicconnect_users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
            localStorage.setItem('userProfile', JSON.stringify(users[userIndex]));
        }
        
        console.log('User data loaded successfully:', {
            reports: userReports.length,
            profile: users[userIndex]
        });
        
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Enhanced logout function
function logout() {
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    // Save user activity before logout
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail && userRole !== 'admin') {
        const users = JSON.parse(localStorage.getItem('civicconnect_users') || '[]');
        const userIndex = users.findIndex(u => u.email === userEmail);
        if (userIndex !== -1) {
            users[userIndex].profile.lastActive = new Date().toISOString();
            localStorage.setItem('civicconnect_users', JSON.stringify(users));
        }
    }
    
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userProfile');
    
    // Preserve settings
    const theme = localStorage.getItem('civicconnect-theme');
    const push = localStorage.getItem('civicconnect-push');
    const email = localStorage.getItem('civicconnect-email');
    
    // Restore settings
    const settings = { theme, push, email };
    
    Object.keys(settings).forEach(key => {
        if (settings[key]) localStorage.setItem('civicconnect-' + key, settings[key]);
    });
    
    updateAuthUI();
    showAlert(`${userName} logged out successfully`, 'success');
    
    // Reload dashboard
    if (typeof loadDashboard === 'function') {
        loadDashboard();
    }
}

// Check login status
function checkLoginStatus() {
    return localStorage.getItem('authToken') !== null;
}

// Get current user data
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch (error) {
        return {};
    }
}

// Make functions globally available
window.openAdminLoginModal = openAdminLoginModal;
window.logout = logout;
window.isAdmin = isAdmin; 
window.getCurrentUser = getCurrentUser; 
window.checkLoginStatus = checkLoginStatus;