function logout() {
    // Clear session storage
    sessionStorage.clear();
    // Redirect to login page
    window.location.href = 'index.html';
}