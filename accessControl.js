document.addEventListener('DOMContentLoaded', function() {
    // Display user info
    const username = sessionStorage.getItem('username');
    const userRole = sessionStorage.getItem('userRole');
    if (username && userRole) {
        document.getElementById('userInfo').textContent = `${username} (${userRole})`;
    }

    // Check if user is logged in
    if (!userRole) {
        alert('Please log in to access the dashboard');
        window.location.href = 'index.html';
        return;
    }

    // Get all restricted links
    const restrictedLinks = document.querySelectorAll('[data-restricted]');
    
    restrictedLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (userRole === 'employee') {
                e.preventDefault();
                alert('Access Denied: This feature is only available to administrators.');
            }
        });
    });
});

// Function to check access for direct URL navigation
function checkAccess(allowedRoles) {
    const userRole = sessionStorage.getItem('userRole');
    if (!userRole) {
        alert('Please log in to access this page');
        window.location.href = 'index.html';
        return;
    }
    
    if (!allowedRoles.includes(userRole)) {
        alert('Access Denied: This page is only available to administrators.');
        window.location.href = 'dashboard.html';
    }
}