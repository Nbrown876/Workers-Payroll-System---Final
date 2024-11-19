// Initialize users storage if it doesn't exist
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify({}));
}

// Function to register a new user with role
function registerUser(username, password, role) {
    if (!username || !password || !role) {
        alert('Please fill in all fields');
        return false;
    }

    const users = JSON.parse(localStorage.getItem('users'));
    
    if (users[username]) {
        alert('Username already exists! Please choose another one.');
        return false;
    }
    
    users[username] = { password, role };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! You can now login.');
    return true;
}

// Function to validate login with role check
function validateLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!username || !password || !role) {
        alert('Please fill in all fields');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users'));
    
    if (!users[username]) {
        alert('Username not found. Please register first.');
        return;
    }
    
    if (users[username].password !== password || users[username].role !== role) {
        alert('Incorrect password or role. Please try again.');
        document.getElementById('password').value = '';
        return;
    }

    // Store user role in sessionStorage
    sessionStorage.setItem('userRole', role);
    sessionStorage.setItem('username', username);
    
    alert('Login successful!');
    window.location.href = 'dashboard.html';
}

// Function to toggle between login and registration forms
function toggleForm() {
    const loginForm = document.querySelector('.login-form');
    const isRegistering = loginForm.classList.toggle('registering');
    
    if (isRegistering) {
        loginForm.onsubmit = function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            if (registerUser(username, password, role)) {
                document.getElementById('username').value = '';
                document.getElementById('password').value = '';
                document.getElementById('role').selectedIndex = 0;
            }
        };
        document.querySelector('.login-button').textContent = 'REGISTER';
        document.querySelector('.toggle-form').textContent = 'Back to Login';
    } else {
        loginForm.onsubmit = function(event) {
            event.preventDefault();
            validateLogin();
        };
        document.querySelector('.login-button').textContent = 'LOGIN';
        document.querySelector('.toggle-form').textContent = 'Register New Account';
    }
}

// Function to clear stored credentials
function clearStoredCredentials() {
    localStorage.removeItem('users');
    localStorage.setItem('users', JSON.stringify({}));
    alert('All stored credentials have been cleared.');
}

// Set up initial form submission handler
document.getElementById('loginForm').onsubmit = function(event) {
    event.preventDefault();
    validateLogin();
};