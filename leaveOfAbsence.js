// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    checkUserRole();
    loadEmployeeDropdown();
    setupSidebarNavigation();
    showSection('new-request');
});

// Check user role and adjust UI accordingly
function checkUserRole() {
    const userRole = sessionStorage.getItem('userRole');
    const managerElements = document.querySelectorAll('.manager-only');
    const managerButtons = document.querySelector('.manager-buttons');
    
    if (userRole === 'manager' || userRole === 'admin') {
        managerElements.forEach(el => el.style.display = 'block');
        if (managerButtons) managerButtons.style.display = 'block';
    } else {
        managerElements.forEach(el => el.style.display = 'none');
        if (managerButtons) managerButtons.style.display = 'none';
    }
}

// Setup sidebar navigation
function setupSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const view = this.dataset.view;
            if (view) {
                showSection(view);
            }
        });
    });
}

// Show/hide sections based on navigation
function showSection(sectionId) {
    const sections = ['new-request', 'previous-requests', 'current-requests', 'grant-leave'];
    sections.forEach(section => {
        const element = document.getElementById(`${section}-section`);
        if (element) {
            element.style.display = section === sectionId ? 'block' : 'none';
        }
    });

    if (sectionId === 'current-requests') {
        loadCurrentRequests();
    } else if (sectionId === 'previous-requests') {
        loadPreviousRequests();
    }
}

// Load employee dropdown
function loadEmployeeDropdown() {
    const employeeData = JSON.parse(localStorage.getItem('employeeData') || '[]');
    const select = document.getElementById('employeeSelect');
    
    select.innerHTML = '<option value="">Select Employee</option>';
    employeeData.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = `${employee.firstName} ${employee.lastName} (${employee.id})`;
        select.appendChild(option);
    });
}

// Populate employee details when selected
function populateEmployeeDetails() {
    const employeeId = document.getElementById('employeeSelect').value;
    if (!employeeId) {
        clearForm();
        return;
    }

    const employeeData = JSON.parse(localStorage.getItem('employeeData') || '[]');
    const employee = employeeData.find(emp => emp.id === employeeId);

    if (employee) {
        document.getElementById('firstName').value = employee.firstName;
        document.getElementById('lastName').value = employee.lastName;
        document.getElementById('middleName').value = employee.middleName || '';
        document.getElementById('department').value = employee.department;
        document.getElementById('gender').value = employee.gender;
        document.getElementById('dob').value = employee.dob;
        document.getElementById('contact').value = employee.contact;
        document.getElementById('address').value = employee.address;
        document.getElementById('position').value = employee.position;
        document.getElementById('email').value = employee.email;

        // Set employee image if available
        const imageElement = document.getElementById('employeeImage');
        if (employee.image) {
            imageElement.style.backgroundImage = `url(${employee.image})`;
        } else {
            imageElement.style.backgroundImage = 'url(default-profile.png)';
        }
    }
}

// Submit leave request
function submitLeaveRequest() {
    const employeeId = document.getElementById('employeeSelect').value;
    if (!employeeId) {
        alert('Please select an employee');
        return;
    }

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const reason = document.getElementById('leaveReason').value;

    if (!startDate || !endDate || !reason) {
        alert('Please fill in all required fields');
        return;
    }

    const leaveRequest = {
        id: generateRequestId(),
        employeeId: employeeId,
        employeeName: document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value,
        department: document.getElementById('department').value,
        startDate: startDate,
        endDate: endDate,
        reason: reason,
        status: 'PENDING',
        submittedDate: new Date().toISOString(),
        email: document.getElementById('email').value
    };

    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    leaveRequests.push(leaveRequest);
    localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));

    alert('Leave request submitted successfully!');
    clearForm();
}

// Generate unique request ID
function generateRequestId() {
    return 'LR' + Date.now();
}

// Load current requests
function loadCurrentRequests() {
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    const currentRequests = leaveRequests.filter(request => request.status === 'PENDING');
    const container = document.getElementById('currentRequestsList');

    if (currentRequests.length === 0) {
        container.innerHTML = '<p>No current leave requests</p>';
        return;
    }

    container.innerHTML = currentRequests.map(request => `
        <div class="request-card">
            <h4>Request ID: ${request.id}</h4>
            <p>Employee: ${request.employeeName}</p>
            <p>Department: ${request.department}</p>
            <p>Start Date: ${request.startDate}</p>
            <p>End Date: ${request.endDate}</p>
            <p>Reason: ${request.reason}</p>
            <p>Status: ${request.status}</p>
            ${isManager() ? `
                <div class="action-buttons">
                    <button onclick="approveRequest('${request.id}')">Approve</button>
                    <button onclick="rejectRequest('${request.id}')">Reject</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Load previous requests
function loadPreviousRequests() {
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    const previousRequests = leaveRequests.filter(request => request.status !== 'PENDING');
    const container = document.getElementById('previousRequestsList');

    if (previousRequests.length === 0) {
        container.innerHTML = '<p>No previous leave requests</p>';
        return;
    }

    container.innerHTML = previousRequests.map(request => `
        <div class="request-card">
            <h4>Request ID: ${request.id}</h4>
            <p>Employee: ${request.employeeName}</p>
            <p>Department: ${request.department}</p>
            <p>Start Date: ${request.startDate}</p>
            <p>End Date: ${request.endDate}</p>
            <p>Reason: ${request.reason}</p>
            <p>Status: ${request.status}</p>
            <p>Decision Date: ${new Date(request.decisionDate).toLocaleDateString()}</p>
        </div>
    `).join('');
}

// Approve request
function approveRequest(requestId) {
    updateRequestStatus(requestId, 'APPROVED');
}

// Reject request
function rejectRequest(requestId) {
    updateRequestStatus(requestId, 'REJECTED');
}

// Update request status
function updateRequestStatus(requestId, status) {
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    const requestIndex = leaveRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex !== -1) {
        const request = leaveRequests[requestIndex];
        request.status = status;
        request.decisionDate = new Date().toISOString();
        request.decidedBy = sessionStorage.getItem('username');
        
        localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
        
        // Send email notification
        sendEmailNotification(request, status);
        
        loadCurrentRequests(); // Refresh the display
        alert(`Request ${status.toLowerCase()} successfully`);
    }
}

// Send email notification
function sendEmailNotification(request, status) {
    const subject = `Leave Request ${status}`;
    const body = `Your leave request from ${request.startDate} to ${request.endDate} has been ${status.toLowerCase()}.`;
    
    // Using mailto for demonstration
    // In a real application, you would use a proper email service
    window.location.href = `mailto:${request.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Check if current user is a manager
function isManager() {
    const userRole = sessionStorage.getItem('userRole');
    return userRole === 'manager' || userRole === 'admin';
}

// Clear form
function clearForm() {
    document.getElementById('employeeSelect').value = '';
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('middleName').value = '';
    document.getElementById('department').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('dob').value = '';
    document.getElementById('contact').value = '';
    document.getElementById('address').value = '';
    document.getElementById('position').value = '';
    document.getElementById('email').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('leaveReason').value = '';
    document.getElementById('employeeImage').style.backgroundImage = 'url(default-profile.png)';
}