class EmployeeDatabase {
    constructor() {  
        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem('employeeData')) {
            localStorage.setItem('employeeData', JSON.stringify([]));
        }
        if (!localStorage.getItem('lastEmployeeId')) {
            localStorage.setItem('lastEmployeeId', '1000'); // Starting ID
        }
    }

    generateEmployeeId() {
        let lastId = parseInt(localStorage.getItem('lastEmployeeId'));
        lastId++;
        localStorage.setItem('lastEmployeeId', lastId.toString());
        return 'EMP' + lastId;
    }

    // Add new employee
    addEmployee(employeeData) {
        try {
            const employees = this.getAllEmployees();
            const newEmployee = {
                ...employeeData,
                id: this.generateEmployeeId(),
                dateCreated: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
            
            // Validate required fields
            if (!this.validateEmployee(newEmployee)) {
                throw new Error('Missing required fields');
            }

            employees.push(newEmployee);
            localStorage.setItem('employeeData', JSON.stringify(employees));
            return newEmployee.id;
        } catch (error) {
            console.error('Error adding employee:', error);
            throw error;
        }
    }

    // Validate employee data
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

    // Get employee by ID
    getEmployee(id) {
        const employees = this.getAllEmployees();
        return employees.find(emp => emp.id === id);
    }

    // Get all employees
    getAllEmployees() {
        return JSON.parse(localStorage.getItem('employeeData') || '[]');
    }

    // Update employee
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
                id: id, // Prevent ID modification
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

    // Delete employee
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

    // Search employees
    searchEmployees(criteria) {
        const employees = this.getAllEmployees();
        return employees.filter(emp => {
            return Object.entries(criteria).every(([key, value]) => {
                return emp[key] && emp[key].toString().toLowerCase().includes(value.toLowerCase());
            });
        });
    }

    // Export employees to CSV
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

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    const db = new EmployeeDatabase();

    // Add employee function
    window.addEmployee = function() {
        const employeeData = {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            middleName: document.getElementById('middle-name').value,
            department: document.getElementById('department').value,
            position: document.getElementById('position').value,
            jobTitle: document.getElementById('job-title').value,
            dateHired: document.getElementById('date-hired').value,
            gender: document.querySelector('input[name="gender"]:checked')?.value,
            dob: document.getElementById('dob').value,
            salary: document.getElementById('salary').value,
            email: document.getElementById('email').value,
            contact: document.getElementById('contact').value,
            address: document.getElementById('address').value,
            bankDetails: document.getElementById('bank-details').value,
            accountNumber: document.getElementById('account-number').value,
            trn: document.getElementById('trn').value,
            attendanceMode: document.getElementById('attendance-mode').value,
            photo: document.getElementById('employee-photo')?.src
        };

        try {
            const employeeId = db.addEmployee(employeeData);
            alert(`Employee added successfully! ID: ${employeeId}`);
            clearForm();
        } catch (error) {
            alert('Error adding employee: ' + error.message);
        }
    };

    // Update employee function
    window.updateEmployee = function() {
        const employeeId = document.getElementById('employee-id').value;
        if (!employeeId) {
            alert('Please enter an employee ID');
            return;
        }

        const employeeData = {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            middleName: document.getElementById('middle-name').value,
            department: document.getElementById('department').value,
            position: document.getElementById('position').value,
            jobTitle: document.getElementById('job-title').value,
            dateHired: document.getElementById('date-hired').value,
            gender: document.querySelector('input[name="gender"]:checked')?.value,
            dob: document.getElementById('dob').value,
            salary: document.getElementById('salary').value,
            email: document.getElementById('email').value,
            contact: document.getElementById('contact').value,
            address: document.getElementById('address').value,
            bankDetails: document.getElementById('bank-details').value,
            accountNumber: document.getElementById('account-number').value,
            trn: document.getElementById('trn').value,
            attendanceMode: document.getElementById('attendance-mode').value,
            photo: document.getElementById('employee-photo')?.src
        };

        try {
            db.updateEmployee(employeeId, employeeData);
            alert('Employee updated successfully!');
        } catch (error) {
            alert('Error updating employee: ' + error.message);
        }
    };

    // Delete employee function
    window.deleteEmployee = function() {
        const employeeId = document.getElementById('employee-id').value;
        if (!employeeId) {
            alert('Please enter an employee ID');
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
    };
});