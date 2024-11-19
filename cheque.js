// Initialize cheque counter and load saved cheques
let chequeCounter = 1000;
const cheques = JSON.parse(localStorage.getItem('cheques') || '[]');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadBankAccounts();
    loadPayees();
    updateAccountSummary();
});

function initializePage() {
    document.getElementById('chequeDate').valueAsDate = new Date();
    document.getElementById('chequeNo').value = generateChequeNumber();
}

function generateChequeNumber() {
    const lastCheque = cheques[cheques.length - 1];
    if (lastCheque) {
        const lastNumber = parseInt(lastCheque.chequeNo.replace('CHQ', ''));
        chequeCounter = lastNumber;
    }
    return `CHQ${++chequeCounter}`;
}

function loadBankAccounts() {
    const bankAccounts = [
        { id: 1, name: "Main Account - 1234" },
        { id: 2, name: "Payroll Account - 5678" }
    ];

    const select = document.getElementById('bankAccount');
    select.innerHTML = '<option value="">Select Bank Account</option>'; // Add default option
    bankAccounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = account.name;
        select.appendChild(option);
    });
}

function loadPayees() {
    const employees = JSON.parse(localStorage.getItem('employeeData') || '[]');
    const select = document.getElementById('payeeSelect');
    
    select.innerHTML = '<option value="">Select Payee</option>'; // Add default option
    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = `${emp.firstName} ${emp.lastName}`;
        select.appendChild(option);
    });

    select.addEventListener('change', function() {
        updateEmployeeDetails(this.value);
        updateAccountSummary();
    });
}

function updateEmployeeDetails(employeeId) {
    const employees = JSON.parse(localStorage.getItem('employeeData') || '[]');
    const employee = employees.find(emp => emp.id === employeeId);
    const summaryDiv = document.getElementById('accountSummary');
    
    if (employee) {
        document.getElementById('amount').value = employee.salary || '';
        document.getElementById('amount').readOnly = true;
        document.getElementById('bankAccount').value = "2";
        document.getElementById('bankAccount').disabled = true;

        if (summaryDiv) {
            summaryDiv.innerHTML = `
                <h3>Account Summary</h3>
                <table>
                    <tr>
                        <td><strong>Cheque No:</strong></td>
                        <td>${document.getElementById('chequeNo').value}</td>
                    </tr>
                    <tr>
                        <td><strong>Account Number:</strong></td>
                        <td>${employee.accountNumber || 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td><strong>Amount:</strong></td>
                        <td>$${parseFloat(employee.salary || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Comments:</strong></td>
                        <td><textarea id="chequeComments" placeholder="Optional comments..."></textarea></td>
                    </tr>
                </table>
            `;
        }
    } else {
        document.getElementById('amount').value = '';
        document.getElementById('amount').readOnly = false;
        document.getElementById('bankAccount').value = '';
        document.getElementById('bankAccount').disabled = false;
        if (summaryDiv) {
            summaryDiv.innerHTML = '<p>Select a payee to view account summary</p>';
        }
    }
}

function updateAccountSummary() {
    const tbody = document.getElementById('accountBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const sortedCheques = [...cheques].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sortedCheques.forEach(cheque => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cheque.bankAccountName}</td>
            <td>${cheque.payee}</td>
            <td>${cheque.chequeNo}</td>
            <td>${cheque.comments || ''}</td>
            <td>$${parseFloat(cheque.amount).toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function clearForm() {
    // Reset form fields
    document.getElementById('payeeSelect').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('bankAccount').value = '';
    document.getElementById('chequeDate').valueAsDate = new Date();
    document.getElementById('amount').readOnly = false;
    document.getElementById('bankAccount').disabled = false;
    
    // Clear comments if exists
    const commentsElement = document.getElementById('chequeComments');
    if (commentsElement) {
        commentsElement.value = '';
    }

    // Clear account summary
    const summaryDiv = document.getElementById('accountSummary');
    if (summaryDiv) {
        summaryDiv.innerHTML = '<p>Select a payee to view account summary</p>';
    }

    // Clear account summary table
    const accountBody = document.getElementById('accountBody');
    if (accountBody) {
        accountBody.innerHTML = '';
    }

    // Reset cheque number
    document.getElementById('chequeNo').value = generateChequeNumber();
}

function saveCheque() {
    const payeeSelect = document.getElementById('payeeSelect');
    const selectedPayee = payeeSelect.options[payeeSelect.selectedIndex];
    const bankAccountSelect = document.getElementById('bankAccount');
    const selectedBank = bankAccountSelect.options[bankAccountSelect.selectedIndex];
    const comments = document.getElementById('chequeComments')?.value || '';

    if (!selectedPayee.value || !bankAccountSelect.value) {
        alert('Please select both payee and bank account');
        return false;
    }

    const chequeData = {
        chequeNo: document.getElementById('chequeNo').value,
        date: document.getElementById('chequeDate').value,
        amount: document.getElementById('amount').value,
        payee: selectedPayee.textContent,
        payeeId: selectedPayee.value,
        bankAccount: bankAccountSelect.value,
        bankAccountName: selectedBank.textContent,
        status: 'PENDING',
        comments: comments,
        createdAt: new Date().toISOString(),
        createdBy: sessionStorage.getItem('username') || 'Unknown'
    };

    if (!validateChequeData(chequeData)) {
        alert('Please fill in all required fields');
        return false;
    }

    cheques.push(chequeData);
    localStorage.setItem('cheques', JSON.stringify(cheques));
    updateAccountSummary();
    alert('Cheque saved successfully!');
    return true;
}

function validateChequeData(data) {
    return data.payee && 
           data.amount > 0 && 
           data.bankAccount && 
           data.date;
}

function saveAndClose() {
    if (saveCheque()) {
        clearForm();
        document.getElementById('chequeNo').value = generateChequeNumber();
    }
}

function deleteCheque(chequeNo) {
    if (confirm('Are you sure you want to delete this cheque?')) {
        const index = cheques.findIndex(c => c.chequeNo === chequeNo);
        if (index > -1) {
            cheques.splice(index, 1);
            localStorage.setItem('cheques', JSON.stringify(cheques));
            viewAllCheques();
            alert('Cheque deleted successfully');
        }
    }
}

function viewAllCheques() {
    const mainContent = document.querySelector('.main-content');
    const userRole = sessionStorage.getItem('userRole');
    const sortedCheques = [...cheques].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    let chequeListHTML = `
        <div class="cheques-list">
            <h2>All Cheques</h2>
            <table>
                <thead>
                    <tr>
                        <th>Cheque No.</th>
                        <th>Date</th>
                        <th>Payee</th>
                        <th>Amount</th>
                        <th>Bank Account</th>
                        <th>Comments</th>
                        <th>Status</th>
                        <th>Created By</th>
                        ${userRole === 'accountant' ? '<th>Actions</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${sortedCheques.map(cheque => `
                        <tr>
                            <td>${cheque.chequeNo}</td>
                            <td>${new Date(cheque.date).toLocaleDateString()}</td>
                            <td>${cheque.payee}</td>
                            <td>$${parseFloat(cheque.amount).toFixed(2)}</td>
                            <td>${cheque.bankAccountName}</td>
                            <td>${cheque.comments || ''}</td>
                            <td>${cheque.status}</td>
                            <td>${cheque.createdBy || 'N/A'}</td>
                            ${userRole === 'accountant' ? `
                                <td>
                                    <button onclick="printSingleCheque('${cheque.chequeNo}')" class="print-btn">
                                        <i class="fas fa-print"></i>
                                    </button>
                                    <button onclick="deleteCheque('${cheque.chequeNo}')" class="delete-btn">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            ` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    mainContent.innerHTML = chequeListHTML;
}

function printCheque() {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'accountant') {
        alert('Only accountants can print cheques');
        return;
    }
    window.print();
}

function printSingleCheque(chequeNo) {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'accountant') {
        alert('Only accountants can print cheques');
        return;
    }
    
    const cheque = cheques.find(c => c.chequeNo === chequeNo);
    if (cheque) {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Cheque ${cheque.chequeNo}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px; 
                        }
                        .cheque { 
                            border: 2px solid #000; 
                            padding: 20px; 
                            margin: 20px;
                            position: relative;
                            min-height: 200px;
                            background: #fff;
                        }
                        .amount { 
                            font-size: 24px; 
                            font-weight: bold;
                            margin: 20px 0;
                        }
                        .header {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 20px;
                        }
                        .watermark {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%) rotate(-45deg);
                            font-size: 72px;
                            opacity: 0.1;
                            pointer-events: none;
                        }
                        .footer {
                            margin-top: 40px;
                            border-top: 1px solid #000;
                            padding-top: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="cheque">
                        <div class="watermark">PAYROLL CHEQUE</div>
                        <div class="header">
                            <h2>WORKERS' PAYROLL SYSTEM</h2>
                            <div>
                                <p>Cheque No: ${cheque.chequeNo}</p>
                                <p>Date: ${new Date(cheque.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <p><strong>Pay to the order of:</strong> ${cheque.payee}</p>
                        <p class="amount">Amount: $${parseFloat(cheque.amount).toFixed(2)}</p>
                        <p><strong>Bank Account:</strong> ${cheque.bankAccountName}</p>
                        ${cheque.comments ? `<p><strong>Comments:</strong> ${cheque.comments}</p>` : ''}
                        <div class="footer">
                            <p>Authorized Signature: _____________________</p>
                            <p>Created By: ${cheque.createdBy}</p>
                            <p>Created At: ${new Date(cheque.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    }
}

// Add event listeners for sidebar navigation
document.addEventListener('DOMContentLoaded', function() {
    const createChequeBtn = document.getElementById('create-cheque-btn');
    const viewChequesBtn = document.getElementById('view-cheques-btn');

    if (createChequeBtn) {
        createChequeBtn.addEventListener('click', function() {
            location.reload();
        });
    }

    if (viewChequesBtn) {
        viewChequesBtn.addEventListener('click', viewAllCheques);
    }
});
