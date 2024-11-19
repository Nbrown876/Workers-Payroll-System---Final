// EmployeeDatabase class with pending approval functionality
class EmployeeDatabase {
    constructor() {
        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem('employeeData')) {
            localStorage.setItem('employeeData', JSON.stringify([]));
        }
        if (!localStorage.getItem('lastEmployeeId')) {
            localStorage.setItem('lastEmployeeId', '1000');
        }
        if (!localStorage.getItem('pendingEmployees')) {
            localStorage.setItem('pendingEmployees', JSON.stringify([]));
        }
    }

    generateEmployeeId() {
        let lastId = parseInt(localStorage.getItem('lastEmployeeId'));
        lastId++;
        localStorage.setItem('lastEmployeeId', lastId.toString());
        return 'EMP' + lastId;
    }

    addEmployee(employeeData) {
        try {
            const newEmployee = {
                ...employeeData,
                id: this.generateEmployeeId(),
                dateCreated: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                status: employeeData.status || 'active'
            };

            if (!this.validateEmployee(newEmployee)) {
                throw new Error('Missing required fields');
            }

            if (employeeData.status === 'pending') {
                const pendingEmployees = this.getPendingEmployees();
                pendingEmployees.push(newEmployee);
                localStorage.setItem('pendingEmployees', JSON.stringify(pendingEmployees));
            } else {
                const employees = this.getAllEmployees();
                employees.push(newEmployee);
                localStorage.setItem('employeeData', JSON.stringify(employees));
            }
            
            updatePendingCount();
            return newEmployee.id;
        } catch (error) {
            console.error('Error adding employee:', error);
            throw error;
        }
    }

    validateEmployee(employee) {
        const requiredFields = [
            'firstName',
            'lastName',
            'department',
            'position',
            'dateHired',
            'salary'
        ];

        return requiredFields.every(field => employee[field] && employee[field].toString().trim() !== '');
    }

    getEmployee(id) {
        const employees = this.getAllEmployees();
        return employees.find(emp => emp.id === id);
    }

    getAllEmployees() {
        return JSON.parse(localStorage.getItem('employeeData') || '[]');
    }

    getPendingEmployees() {
        return JSON.parse(localStorage.getItem('pendingEmployees') || '[]');
    }

    updateEmployee(id, updatedData) {
        try {
            const employees = this.getAllEmployees();
            const index = employees.findIndex(emp => emp.id === id);
            
            if (index === -1) {
                throw new Error('Employee not found');
            }

            const updatedEmployee = {
                ...employees[index],
                ...updatedData,
                id: id,
                lastModified: new Date().toISOString()
            };

            if (!this.validateEmployee(updatedEmployee)) {
                throw new Error('Missing required fields');
            }

            employees[index] = updatedEmployee;
            localStorage.setItem('employeeData', JSON.stringify(employees));
            return true;
        } catch (error) {
            console.error('Error updating employee:', error);
            throw error;
        }
    }

    deleteEmployee(id) {
        try {
            const employees = this.getAllEmployees();
            const filteredEmployees = employees.filter(emp => emp.id !== id);
            
            if (filteredEmployees.length === employees.length) {
                throw new Error('Employee not found');
            }

            localStorage.setItem('employeeData', JSON.stringify(filteredEmployees));
            return true;
        } catch (error) {
            console.error('Error deleting employee:', error);
            throw error;
        }
    }

    approveEmployee(id, comments = '') {
        const pendingEmployees = this.getPendingEmployees();
        const employeeIndex = pendingEmployees.findIndex(emp => emp.id === id);

        if (employeeIndex === -1) {
            throw new Error('Pending employee not found');
        }

        const approvedEmployee = {
            ...pendingEmployees[employeeIndex],
            status: 'approved',
            approvalComments: comments,
            approvalDate: new Date().toISOString()
        };

        const employees = this.getAllEmployees();
        employees.push(approvedEmployee);
        pendingEmployees.splice(employeeIndex, 1);

        localStorage.setItem('employeeData', JSON.stringify(employees));
        localStorage.setItem('pendingEmployees', JSON.stringify(pendingEmployees));
        
        updatePendingCount();
        return true;
    }

    rejectEmployee(id, comments = '') {
        const pendingEmployees = this.getPendingEmployees();
        const employeeIndex = pendingEmployees.findIndex(emp => emp.id === id);

        if (employeeIndex === -1) {
            throw new Error('Pending employee not found');
        }

        pendingEmployees[employeeIndex] = {
            ...pendingEmployees[employeeIndex],
            status: 'rejected',
            approvalComments: comments,
            rejectionDate: new Date().toISOString()
        };

        localStorage.setItem('pendingEmployees', JSON.stringify(pendingEmployees));
        updatePendingCount();
        return true;
    }

    searchEmployees(criteria) {
        const employees = this.getAllEmployees();
        const pendingEmployees = this.getPendingEmployees();
        const allEmployees = [...employees, ...pendingEmployees];
        
        return allEmployees.filter(emp => {
            return Object.entries(criteria).some(([key, value]) => {
                if (!value) return false;
                const employeeValue = emp[key]?.toString().toLowerCase() || '';
                return employeeValue.includes(value.toLowerCase());
            });
        });
    }

    exportToCSV() {
        const employees = this.getAllEmployees();
        if (employees.length === 0) return '';

        const headers = Object.keys(employees[0]);
        const csvRows = [
            headers.join(','),
            ...employees.map(emp => headers.map(header => JSON.stringify(emp[header] || '')).join(','))
        ];

        return csvRows.join('\n');
    }
}

// UI Functions
function updatePendingCount() {
    const db = new EmployeeDatabase();
    const pendingCount = db.getPendingEmployees().filter(emp => emp.status === 'pending').length;
    const countElement = document.getElementById('pendingCount');
    if (countElement) {
        countElement.textContent = pendingCount;
        countElement.style.display = pendingCount > 0 ? 'inline' : 'none';
    }
}

function displayPendingEmployees() {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'manager') {
        alert('Access Denied: Only managers can view pending employees.');
        return;
    }

    const db = new EmployeeDatabase();
    const pendingEmployees = db.getPendingEmployees();
    const container = document.getElementById('pendingEmployeesList');
    
    if (!container) return;
    container.innerHTML = '';
    
    pendingEmployees.forEach(employee => {
        const card = document.createElement('div');
        card.className = `pending-employee-card ${employee.status}`;
        card.innerHTML = `
            <img src="${employee.photo || 'placeholder.png'}" class="pending-employee-photo" alt="Employee Photo">
            <div class="pending-employee-info">
                <h3>${employee.firstName} ${employee.lastName}</h3>
                <p>ID: ${employee.id}</p>
                <p>Department: ${employee.department}</p>
                <p>Position: ${employee.position}</p>
                <p>Status: <span class="status-${employee.status}">${employee.status.toUpperCase()}</span></p>
                ${employee.approvalComments ? `<p>Comments: ${employee.approvalComments}</p>` : ''}
            </div>
            ${employee.status === 'pending' ? `
                <div class="pending-actions">
                    <button onclick="reviewEmployee('${employee.id}')" class="action-btn review">Review</button>
                </div>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', function() {
    const db = new EmployeeDatabase();
    
    // Check user role and show/hide manager features
    const userRole = sessionStorage.getItem('userRole');
    const managerTabs = document.getElementById('managerTabs');
    
    if (userRole === 'manager') {
        managerTabs.style.display = 'flex';
        updatePendingCount();
    } else {
        managerTabs.style.display = 'none';
        document.getElementById('employeeForm').classList.add('active');
        document.getElementById('pendingEmployees').style.display = 'none';
    }

    // Photo upload handling
    document.getElementById('photo-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('employee-photo').src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    }
});

function showTab(tabId) {
    const userRole = sessionStorage.getItem('userRole');
    
    if (tabId === 'pendingEmployees' && userRole !== 'manager') {
        alert('Access Denied: Only managers can view pending employees.');
        return;
    }

    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');

    if (tabId === 'pendingEmployees') {
        displayPendingEmployees();
    }
}

function addEmployee() {
    const userRole = sessionStorage.getItem('userRole');
    const db = new EmployeeDatabase();
    const employeeData = getFormData();
    
    if (!validateForm(employeeData)) return;

    try {
        if (userRole === 'manager') {
            const employeeId = db.addEmployee(employeeData);
            alert(`Employee added successfully! ID: ${employeeId}`);
        } else {
            const pendingId = db.addEmployee({
                ...employeeData,
                status: 'pending'
            });
            alert('Employee information submitted for manager approval.');
        }
        clearForm();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function updateEmployee() {
    const userRole = sessionStorage.getItem('userRole');
    const db = new EmployeeDatabase();
    const employeeId = document.getElementById('employee-id').value;
    
    if (!employeeId) {
        alert('Please enter an employee ID');
        return;
    }

    const employeeData = getFormData();
    if (!validateForm(employeeData)) return;

    try {
        if (userRole === 'manager') {
            db.updateEmployee(employeeId, employeeData);
            alert('Employee updated successfully!');
        } else {
            db.addEmployee({
                ...employeeData,
                originalId: employeeId,
                status: 'pending',
                type: 'update'
            });
            alert('Update request submitted for manager approval.');
        }
    } catch (error) {
        alert('Error updating employee: ' + error.message);
    }
}

function deleteEmployee() {
    const userRole = sessionStorage.getItem('userRole');
    const db = new EmployeeDatabase();
    const employeeId = document.getElementById('employee-id').value;
    
    if (!employeeId) {
        alert('Please enter an employee ID');
        return;
    }

    if (userRole !== 'manager') {
        alert('Access Denied: Only managers can delete employees.');
        return;
    }

    if (confirm('Are you sure you want to delete this employee?')) {
        try {
            db.deleteEmployee(employeeId);
            alert('Employee deleted successfully!');
            clearForm();
        } catch (error) {
            alert('Error deleting employee: ' + error.message);
        }
    }
}

function reviewEmployee(id) {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'manager') {
        alert('Access Denied: Only managers can review employees.');
        return;
    }

    const db = new EmployeeDatabase();
    const employee = db.getPendingEmployees().find(emp => emp.id === id);
    
    if (!employee) return;

    const modal = document.getElementById('reviewModal');
    const content = document.getElementById('reviewContent');
    
    content.innerHTML = `
        <div class="review-details">
            <h3>${employee.firstName} ${employee.lastName}</h3>
            <p>Employee ID: ${employee.id}</p>
            <p>Department: ${employee.department}</p>
            <p>Position: ${employee.position}</p>
            <div class="review-field">
                <label>Comments:</label>
                <textarea id="approvalComments" rows="3"></textarea>
            </div>
        </div>
        <div class="review-buttons">
            <button onclick="approveEmployee('${employee.id}')" class="action-btn approve">Approve</button>
            <button onclick="rejectEmployee('${employee.id}')" class="action-btn reject">Reject</button>
        </div>
    `;
    
    modal.style.display = 'block';
}

function approveEmployee(id) {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'manager') {
        alert('Access Denied: Only managers can approve employees.');
        return;
    }

    const comments = document.getElementById('approvalComments').value;
    const db = new EmployeeDatabase();
    
    try {
        db.approveEmployee(id, comments);
        closeReviewModal();
        displayPendingEmployees();
        alert('Employee approved successfully!');
    } catch (error) {
        alert('Error approving employee: ' + error.message);
    }
}

function rejectEmployee(id) {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'manager') {
        alert('Access Denied: Only managers can reject employees.');
        return;
    }

    const comments = document.getElementById('approvalComments').value;
    const db = new EmployeeDatabase();
    
    try {
        db.rejectEmployee(id, comments);
        closeReviewModal();
        displayPendingEmployees();
        alert('Employee rejected.');
    } catch (error) {
        alert('Error rejecting employee: ' + error.message);
    }
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
}

function getFormData() {
    return {
        id: document.getElementById('employee-id').value.trim(),
        photo: document.getElementById('employee-photo').src,
        firstName: document.getElementById('first-name').value.trim(),
        lastName: document.getElementById('last-name').value.trim(),
        middleName: document.getElementById('middle-name').value.trim(),
        department: document.getElementById('department').value.trim(),
        position: document.getElementById('position').value.trim(),
        jobTitle: document.getElementById('job-title').value.trim(),
        dateHired: document.getElementById('date-hired').value,
        gender: document.querySelector('input[name="gender"]:checked')?.value || '',
        salary: document.getElementById('salary').value,
        dob: document.getElementById('dob').value,
        bankDetails: document.getElementById('bank-details').value.trim(),
        email: document.getElementById('email').value.trim(),
        accountNumber: document.getElementById('account-number').value.trim(),
        contact: document.getElementById('contact').value.trim(),
        trn: document.getElementById('trn').value.trim(),
        address: document.getElementById('address').value.trim(),
        attendanceMode: document.getElementById('attendance-mode').value
    };
}

function validateForm(data) {
    const requiredFields = ['firstName', 'lastName', 'department', 'position', 'dateHired', 'salary'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        return false;
    }

    if (data.email && !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert('Please enter a valid email address');
        return false;
    }

    return true;
}

function clearForm() {
    const form = document.querySelector('.employee-form');
    if (form) {
        form.reset();
        document.getElementById('employee-photo').src = 'placeholder.png';
    }
}

function exportEmployees() {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'manager') {
        alert('Access Denied: Only managers can export employee data.');
        return;
    }

    const db = new EmployeeDatabase();
    const csv = db.exportToCSV();
    if (!csv) {
        alert('No employees to export');
        return;
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function searchEmployees() {
    const db = new EmployeeDatabase();
    const searchTerm = document.getElementById('search-input').value.trim();
    if (!searchTerm) {
        alert('Please enter a search term');
        return;
    }
    
    const results = db.searchEmployees({ 
        id: searchTerm, 
        firstName: searchTerm, 
        lastName: searchTerm,
        department: searchTerm,
        position: searchTerm
    });
    displaySearchResults(results);
}

function displaySearchResults(results) {
    const modal = document.getElementById('searchModal');
    const resultsContainer = document.getElementById('searchResults');
    
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No employees found</div>';
    } else {
        results.forEach(employee => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            resultItem.innerHTML = `
                <div class="search-result-header">
                    <img src="${employee.photo || 'placeholder.png'}" alt="Employee Photo" class="employee-photo">
                    <div>
                        <h3>${employee.firstName} ${employee.lastName}</h3>
                        <p>Employee ID: ${employee.id}</p>
                    </div>
                </div>
                <div class="employee-details">
                    <p><strong>Department:</strong> ${employee.department}</p>
                    <p><strong>Position:</strong> ${employee.position}</p>
                    <p><strong>Email:</strong> ${employee.email || 'N/A'}</p>
                    <p><strong>Contact:</strong> ${employee.contact || 'N/A'}</p>
                    <p><strong>Attendance Mode:</strong> ${employee.attendanceMode}</p>
                    <p><strong>Date Hired:</strong> ${employee.dateHired || 'N/A'}</p>
                </div>
                <button onclick="loadEmployeeToForm('${employee.id}')" class="action-btn update">
                    Edit Employee
                </button>
            `;
            
            resultsContainer.appendChild(resultItem);
        });
    }
    
    modal.style.display = 'block';
}

function closeSearchModal() {
    document.getElementById('searchModal').style.display = 'none';
}

function loadEmployeeToForm(id) {
    const userRole = sessionStorage.getItem('userRole');
    const db = new EmployeeDatabase();
    const employee = db.getEmployee(id);
    
    if (employee) {
        Object.keys(employee).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (key === 'photo') {
                    document.getElementById('employee-photo').src = employee[key];
                } else if (element.type === 'radio') {
                    const radio = document.querySelector(`input[name="gender"][value="${employee[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    element.value = employee[key];
                }
            }
        });
        
        closeSearchModal();
        
        // Disable editing for non-managers
        if (userRole !== 'manager') {
            document.querySelectorAll('input, select, textarea').forEach(element => {
                element.disabled = true;
            });
            alert('View only mode: Only managers can edit employee information.');
        }
    }
}

// Event listeners for search functionality
document.getElementById('search-input')?.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        searchEmployees();
    }
});

// Window click event for modals
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};