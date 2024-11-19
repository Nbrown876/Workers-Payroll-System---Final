// Initialize request counter and load saved requests
let requestCounter = 1000;
const requests = JSON.parse(localStorage.getItem('overtimeRequests') || '[]');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadEmployeeDropdown();
    setupSidebarNavigation();
    
    // Show new request section by default
    showSection('new-request');
});

function initializePage() {
    document.getElementById('requestDate').valueAsDate = new Date();
    document.getElementById('requestNo').value = generateRequestNumber();
}

function generateRequestNumber() {
    return `OT${++requestCounter}`;
}

function setupSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            // Show corresponding section
            showSection(this.dataset.view);
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.getElementById('new-request-section').style.display = 'none';
    document.getElementById('view-requests-section').style.display = 'none';

    // Show selected section
    if (sectionId === 'new-request') {
        document.getElementById('new-request-section').style.display = 'block';
    } else if (sectionId === 'view-requests') {
        document.getElementById('view-requests-section').style.display = 'block';
        loadOvertimeRequests();
    }
}

function loadEmployeeDropdown() {
    const employeeData = JSON.parse(localStorage.getItem('employeeData') || '[]');
    const select = document.getElementById('employeeSelect');
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">Select an Employee</option>';
    
    employeeData.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = `${employee.firstName} ${employee.lastName} (${employee.id})`;
        select.appendChild(option);
    });
}

function populateEmployeeDetails() {
    const select = document.getElementById('employeeSelect');
    const employeeId = select.value;
    
    if (!employeeId) {
        clearEmployeeDetails();
        return;
    }
    
    const employeeData = JSON.parse(localStorage.getItem('employeeData') || '[]');
    const employee = employeeData.find(emp => emp.id === employeeId);
    
    if (employee) {
        document.getElementById('fullName').value = `${employee.firstName} ${employee.lastName}`;
        document.getElementById('department').value = employee.department;
        document.getElementById('email').value = employee.email || '';
    }
}

function addNewRow() {
    const tbody = document.getElementById('overtimeBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="date" class="date-input"></td>
        <td><input type="date" class="date-input"></td>
        <td><input type="time" class="time-input"></td>
        <td><input type="time" class="time-input"></td>
    `;
    tbody.appendChild(newRow);
}

function clearEmployeeDetails() {
    document.getElementById('fullName').value = '';
    document.getElementById('department').value = '';
    document.getElementById('email').value = '';
}

function saveRequest() {
    const employeeId = document.getElementById('employeeSelect').value;
    if (!employeeId) {
        alert('Please select an employee');
        return;
    }

    const requestData = {
        requestNo: document.getElementById('requestNo').value,
        date: document.getElementById('requestDate').value,
        employeeId: employeeId,
        fullName: document.getElementById('fullName').value,
        department: document.getElementById('department').value,
        email: document.getElementById('email').value,
        supervisor: document.getElementById('supervisor').value,
        overtimeDetails: getOvertimeDetails(),
        status: 'PENDING',
        submittedDate: new Date().toISOString()
    };

    if (!validateRequestData(requestData)) {
        alert('Please fill in all required fields');
        return;
    }

    const requests = JSON.parse(localStorage.getItem('overtimeRequests') || '[]');
    requests.push(requestData);
    localStorage.setItem('overtimeRequests', JSON.stringify(requests));
    alert('Request saved successfully!');
}

function getOvertimeDetails() {
    const details = [];
    const rows = document.getElementById('overtimeBody').getElementsByTagName('tr');
    
    for (let row of rows) {
        const inputs = row.getElementsByTagName('input');
        if (inputs[0].value && inputs[1].value && inputs[2].value && inputs[3].value) {
            details.push({
                startDate: inputs[0].value,
                endDate: inputs[1].value,
                startTime: inputs[2].value,
                endTime: inputs[3].value
            });
        }
    }
    
    return details;
}

function validateRequestData(data) {
    return data.fullName && 
           data.department && 
           data.email && 
           data.supervisor && 
           data.overtimeDetails.length > 0;
}

function loadOvertimeRequests() {
    const requests = JSON.parse(localStorage.getItem('overtimeRequests') || '[]');
    const requestsContainer = document.getElementById('requestsContainer');

    if (requests.length === 0) {
        requestsContainer.innerHTML = '<p>No overtime requests found.</p>';
        return;
    }

    const requestsList = requests.map(request => `
        <div class="request-card">
            <p><strong>Request No:</strong> ${request.requestNo}</p>
            <p><strong>Employee:</strong> ${request.fullName}</p>
            <p><strong>Department:</strong> ${request.department}</p>
            <p><strong>Email:</strong> ${request.email}</p>
            <p><strong>Date:</strong> ${request.date}</p>
            <p><strong>Status:</strong> 
                <span class="request-status status-${request.status.toLowerCase()}">
                    ${request.status}
                </span>
            </p>
            <p><strong>Submitted Date:</strong> ${new Date(request.submittedDate).toLocaleDateString()}</p>
            <p><strong>Supervisor:</strong> ${request.supervisor}</p>
            <p><strong>Overtime Details:</strong></p>
            <ul>
                ${request.overtimeDetails.map(detail => `
                    <li>From ${detail.startDate} ${detail.startTime} to ${detail.endDate} ${detail.endTime}</li>
                `).join('')}
            </ul>
            ${isManager() ? `
                <div class="approval-buttons">
                    ${request.status === 'PENDING' ? `
                        <button onclick="updateRequestStatus('${request.requestNo}', 'APPROVED')" class="approve-btn">
                            Approve
                        </button>
                        <button onclick="updateRequestStatus('${request.requestNo}', 'REJECTED')" class="reject-btn">
                            Reject
                        </button>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `).join('');

    requestsContainer.innerHTML = requestsList;
}

function isManager() {
    // Get the user role from session storage
    const userRole = sessionStorage.getItem('userRole');
    return userRole === 'manager' || userRole === 'admin';
}

function updateRequestStatus(requestNo, newStatus) {
    if (!isManager()) {
        alert('Only managers can approve or reject requests');
        return;
    }

    const requests = JSON.parse(localStorage.getItem('overtimeRequests') || '[]');
    const requestIndex = requests.findIndex(r => r.requestNo === requestNo);
    
    if (requestIndex !== -1) {
        requests[requestIndex].status = newStatus;
        requests[requestIndex].approvedDate = new Date().toISOString();
        requests[requestIndex].approvedBy = sessionStorage.getItem('username');
        
        localStorage.setItem('overtimeRequests', JSON.stringify(requests));
        alert(`Request ${newStatus.toLowerCase()} successfully`);
        loadOvertimeRequests(); // Reload the requests view
    }
}

function submitRequest() {
    saveRequest();
    clearForm();
    alert('Request submitted successfully!');
    document.getElementById('requestNo').value = generateRequestNumber();
}

function saveAndClose() {
    saveRequest();
    window.location.href = 'dashboard.html';
}

function clearForm() {
    document.getElementById('employeeSelect').value = '';
    document.getElementById('fullName').value = '';
    document.getElementById('department').value = '';
    document.getElementById('email').value = '';
    document.getElementById('supervisor').value = '';
    
    const tbody = document.getElementById('overtimeBody');
    tbody.innerHTML = `
        <tr>
            <td><input type="date" class="date-input"></td>
            <td><input type="date" class="date-input"></td>
            <td><input type="time" class="time-input"></td>
            <td><input type="time" class="time-input"></td>
        </tr>
    `;
}

function printRequest() {
    window.print();
}