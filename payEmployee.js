document.addEventListener('DOMContentLoaded', function() {
    let selectedEmployee = null;
    const employeeSelect = document.getElementById('employee-select');

    // Load employees into select dropdown
    function loadEmployees() {
        const employeeData = JSON.parse(localStorage.getItem('employeeData') || '[]');
        employeeSelect.innerHTML = '<option value="">-- Select Employee --</option>';
        
        employeeData.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = `${employee.firstName} ${employee.lastName} (${employee.id})`;
            employeeSelect.appendChild(option);
        });
    }

    // Handle employee selection
    employeeSelect.addEventListener('change', function() {
        const employeeData = JSON.parse(localStorage.getItem('employeeData') || '[]');
        selectedEmployee = employeeData.find(emp => emp.id === this.value);

        if (selectedEmployee) {
            document.getElementById('bank-branch').value = selectedEmployee.bankDetails || '';
            document.getElementById('account-number').value = selectedEmployee.accountNumber || '';
            document.getElementById('account-holder').value = 
                `${selectedEmployee.firstName} ${selectedEmployee.lastName}`;
        } else {
            document.getElementById('bank-branch').value = '';
            document.getElementById('account-number').value = '';
            document.getElementById('account-holder').value = '';
        }
    });

    // Submit payment functionality
    document.querySelector('.submit').addEventListener('click', function() {
        if (!selectedEmployee) {
            alert('Please select an employee first!');
            return;
        }

        const scopeOfWork = document.querySelector('.scope-input').value;
        const amount = document.querySelector('.amount-input').value;
        const description = document.querySelectorAll('.scope-input')[1].value;

        if (!scopeOfWork || !amount) {
            alert('Please fill in all required fields!');
            return;
        }

        // Prepare email content
        const emailSubject = 'Payment Notification';
        const emailBody = `
Dear ${selectedEmployee.firstName},

This email is to notify you that a payment has been processed:

Scope of Work: ${scopeOfWork}
Amount: JMD ${amount}
Description: ${description}

Payment has been sent to:
Bank Branch: ${selectedEmployee.bankDetails}
Account Number: ${selectedEmployee.accountNumber}

Best regards,
HR Department
        `;

        // Open default email client
        const mailtoLink = `mailto:${selectedEmployee.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoLink;

        // Save payment record
        const paymentRecord = {
            employeeId: selectedEmployee.id,
            date: new Date().toISOString(),
            amount: amount,
            scopeOfWork: scopeOfWork,
            description: description
        };

        // Store payment record in localStorage
        const payments = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
        payments.push(paymentRecord);
        localStorage.setItem('paymentRecords', JSON.stringify(payments));

        alert('Payment submitted successfully and email client opened!');
    });

    // Clear form functionality
    document.querySelector('.clear').addEventListener('click', function() {
        document.querySelectorAll('input, textarea').forEach(input => {
            input.value = '';
        });
        employeeSelect.value = '';
        selectedEmployee = null;
    });

    // Save functionality
    document.querySelector('.save').addEventListener('click', function() {
        if (!selectedEmployee) {
            alert('Please select an employee first!');
            return;
        }
        alert('Payment details saved successfully!');
    });

    // Edit functionality
    document.querySelector('.edit').addEventListener('click', function() {
        const inputs = document.querySelectorAll('.scope-input, .amount-input');
        inputs.forEach(input => {
            input.readOnly = !input.readOnly;
        });
    });

    // Load employees when page loads
    loadEmployees();
});