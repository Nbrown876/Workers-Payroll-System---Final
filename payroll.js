function generatePayrollNumber() {
    const prefix = 'PAY';
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
}

function calculateOvertimePay(totalHours, hourlyRate) {
    const regularHours = Math.min(totalHours, 40);
    const overtimeHours = Math.max(0, totalHours - 40);
    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * (hourlyRate * 1.5);
    return { regularPay, overtimePay, regularHours, overtimeHours };
}

function calculateIncomeTax(grossPay) {
    let tax = 0;
    if (grossPay <= 25000) {
        tax = grossPay * 0.15;
    } else if (grossPay <= 50000) {
        tax = 25000 * 0.15 + (grossPay - 25000) * 0.20;
    } else {
        tax = 25000 * 0.15 + 25000 * 0.20 + (grossPay - 50000) * 0.25;
    }
    return tax;
}

function updatePayrollSummary(employee, totalHours, overtimeHours) {
    const hourlyRate = parseFloat(employee.salary) / 160;
    const { regularPay, overtimePay, regularHours } = calculateOvertimePay(totalHours, hourlyRate);
    const grossPay = regularPay + overtimePay;
    const incomeTax = calculateIncomeTax(grossPay);

    const tbody = document.getElementById('payrollBody');
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="checkbox" class="payroll-checkbox"></td>
        <td>${employee.firstName} ${employee.lastName}</td>
        <td>${regularPay.toFixed(2)}</td>
        <td>${regularHours}</td>
        <td>${overtimePay.toFixed(2)}</td>
        <td>${overtimeHours}</td>
        <td>${grossPay.toFixed(2)}</td>
        <td>${incomeTax.toFixed(2)}</td>
    `;
    tbody.appendChild(row);

    document.getElementById('amount').value = `${grossPay.toFixed(2)}`;
}

function deleteSelectedPayrolls() {
    const checkboxes = document.querySelectorAll('.payroll-checkbox:checked');
    checkboxes.forEach(checkbox => {
        checkbox.closest('tr').remove();
    });
}

function initializeForm() {
    const db = new EmployeeDatabase();
    const employees = db.getAllEmployees();
    const select = document.getElementById('employeeSelect');
    
    select.innerHTML = '<option value="">Select Employee</option>';
    
    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = `${emp.firstName} ${emp.lastName}`;
        select.appendChild(option);
    });

    document.getElementById('payrollDate').valueAsDate = new Date();
    document.getElementById('payrollNo').value = generatePayrollNumber();
}

function createPayroll() {
    const employeeId = document.getElementById('employeeSelect').value;
    const totalHours = parseFloat(document.getElementById('totalHours').value) || 0;
    const overtimeHours = parseFloat(document.getElementById('overtimeHours').value) || 0;

    if (!employeeId || !totalHours) {
        alert('Please fill in all required fields');
        return;
    }

    const employees = JSON.parse(localStorage.getItem('employeeData') || '[]');
    const employee = employees.find(emp => emp.id === employeeId);
    
    if (!employee) {
        alert('Employee not found');
        return;
    }

    updatePayrollSummary(employee, totalHours, overtimeHours);
    clearForm();
}

function updatePayroll() {
    const employeeId = document.getElementById('employeeSelect').value;
    const totalHours = parseFloat(document.getElementById('totalHours').value) || 0;
    const overtimeHours = parseFloat(document.getElementById('overtimeHours').value) || 0;

    if (!employeeId || !totalHours) {
        alert('Please fill in all required fields');
        return;
    }

    const employees = JSON.parse(localStorage.getItem('employeeData') || '[]');
    const employee = employees.find(emp => emp.id === employeeId);
    
    if (!employee) {
        alert('Employee not found');
        return;
    }

    // Clear the existing payroll summary for the selected employee
    const tbody = document.getElementById('payrollBody');
    const existingRows = Array.from(tbody.querySelectorAll('tr'));
    existingRows.forEach(row => {
        if (row.cells[1].textContent.includes(`${employee.firstName} ${employee.lastName}`)) {
            tbody.removeChild(row);
        }
    });

    // Add the updated payroll summary
    updatePayrollSummary(employee, totalHours, overtimeHours);
    clearForm();
}

function clearForm() {
    document.getElementById('employeeSelect').value = '';
    document.getElementById('payrollDate').valueAsDate = new Date();
    document.getElementById('amount').value = '';
    document.getElementById('bankAccount').value = '';
    document.getElementById('payrollNo').value = generatePayrollNumber();
    document.getElementById('totalHours').value = '';
    document.getElementById('overtimeHours').value = '0';
}

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();

    document.getElementById('selectAll').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.payroll-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });

    document.getElementById('employeeSelect').addEventListener('change', function() {
        const employeeId = this.value;
        if (employeeId) {
            document.getElementById('totalHours').value = '';
            document.getElementById('overtimeHours').value = '0';
            document.getElementById('amount').value = '';
        }
    });

    document.getElementById('totalHours').addEventListener('input', function() {
        const employeeId = document.getElementById('employeeSelect').value;
        if (employeeId) {
            const employees = JSON.parse(localStorage.getItem('employeeData') || '[]');
            const employee = employees.find(emp => emp.id === employeeId);
            if (employee) {
                const totalHours = parseFloat(this.value) || 0;
                const overtimeHours = parseFloat(document.getElementById('overtimeHours').value) || 0;
                document.getElementById('payrollBody').innerHTML = '';
                updatePayrollSummary(employee, totalHours, overtimeHours);
            }
        }
    });

    document.getElementById('overtimeHours').addEventListener('input', function() {
        const employeeId = document.getElementById('employeeSelect').value;
        if (employeeId) {
            const employees = JSON.parse(localStorage.getItem('employeeData') || '[]');
            const employee = employees.find(emp => emp.id === employeeId);
            if (employee) {
                const totalHours = parseFloat(document.getElementById('totalHours').value) || 0;
                const overtimeHours = parseFloat(this.value) || 0;
                document.getElementById('payrollBody').innerHTML = '';
                updatePayrollSummary(employee, totalHours, overtimeHours);
            }
        }
    });
});