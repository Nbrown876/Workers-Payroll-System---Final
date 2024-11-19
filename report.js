// Initialize report counter and load saved reports
let reportCounter = 1000;
const reports = JSON.parse(localStorage.getItem('reports') || '[]');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadEmployees();
    setupEventListeners();
});

function setupEventListeners() {
    // Add click event listeners to sidebar items
    document.getElementById('view-reports-btn').addEventListener('click', function() {
        viewPreviousReports();
        updateSidebarActive(this);
    });

    document.getElementById('generate-report-btn').addEventListener('click', function() {
        showGenerateReportForm();
        updateSidebarActive(this);
    });
}

function updateSidebarActive(clickedItem) {
    // Remove active class from all sidebar items
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    // Add active class to clicked item
    clickedItem.classList.add('active');
}

function initializePage() {
    showGenerateReportForm();
}

function showGenerateReportForm() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="toolbar">
        </div>

        <div class="report-form">
            <div class="form-header">
                <div class="form-group">
                    <label>NO.</label>
                    <input type="text" id="reportNo" readonly>
                </div>
                <div class="form-group">
                    <label>DATE</label>
                    <input type="date" id="reportDate">
                </div>
            </div>

            <div class="report-details">
                <h3>REPORT DETAILS</h3>
                <table id="reportTable">
                    <thead>
                        <tr>
                            <th>EMPLOYEE ID</th>
                            <th>EMPLOYEE</th>
                            <th>SALARY</th>
                            <th>DEPARTMENT</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody id="reportBody">
                    </tbody>
                </table>
                <button class="add-row-btn" onclick="addNewRow()">+ Add Row</button>
            </div>

            <div class="button-group">
                <button class="btn clear" onclick="clearForm()">CLEAR</button>
                <button class="btn save" onclick="saveReport()">SAVE</button>
                <button class="btn generate" onclick="generateReport()">GENERATE</button>
            </div>
        </div>
    `;

    document.getElementById('reportDate').valueAsDate = new Date();
    document.getElementById('reportNo').value = generateReportNumber();
    addNewRow(); // Add initial row
}

function generateReportNumber() {
    return `RPT${reportCounter++}`;
}

function loadEmployees() {
    const employees = JSON.parse(localStorage.getItem('employeeData') || '[]');
    const selects = document.querySelectorAll('.employee-select');
    selects.forEach(select => {
        updateEmployeeSelect(select, employees);
    });
    return employees;
}

function updateEmployeeSelect(select, employees) {
    select.innerHTML = '<option value="">Select Employee</option>';
    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = `${emp.id} - ${emp.firstName} ${emp.lastName}`;
        select.appendChild(option);
    });
}

function addNewRow() {
    const tbody = document.getElementById('reportBody');
    const employees = JSON.parse(localStorage.getItem('employeeData') || '[]');
    
    // Get currently selected employees
    const selectedEmployees = Array.from(document.querySelectorAll('.employee-select'))
        .map(select => select.value)
        .filter(value => value !== '');

    // Filter out already selected employees
    const availableEmployees = employees.filter(emp => 
        !selectedEmployees.includes(emp.id)
    );

    // If no more employees are available, show alert
    if (availableEmployees.length === 0) {
        alert('All employees have been added to the report.');
        return;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>
            <select class="employee-select" onchange="updateEmployeeDetails(this)">
                <option value="">Select Employee</option>
                ${availableEmployees.map(emp => `
                    <option value="${emp.id}">${emp.id} - ${emp.firstName} ${emp.lastName}</option>
                `).join('')}
            </select>
        </td>
        <td class="employee-name"></td>
        <td class="employee-salary"></td>
        <td class="employee-department"></td>
        <td>
            <button onclick="removeRow(this)" class="remove-row-btn">×</button>
        </td>
    `;
    tbody.appendChild(tr);
}

function removeRow(button) {
    const row = button.closest('tr');
    row.remove();
    updateAllDropdowns();
}

function updateAllDropdowns() {
    const employees = JSON.parse(localStorage.getItem('employeeData') || '[]');
    const selects = document.querySelectorAll('.employee-select');
    
    const selectedEmployees = Array.from(selects)
        .map(select => select.value)
        .filter(value => value !== '');

    selects.forEach(select => {
        const currentValue = select.value;
        const availableEmployees = employees.filter(emp => 
            emp.id === currentValue || !selectedEmployees.includes(emp.id)
        );

        const currentSelection = select.value;
        select.innerHTML = '<option value="">Select Employee</option>';
        availableEmployees.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.id;
            option.textContent = `${emp.id} - ${emp.firstName} ${emp.lastName}`;
            select.appendChild(option);
        });

        select.value = currentSelection;
    });
}

function updateEmployeeDetails(select) {
    const employees = JSON.parse(localStorage.getItem('employeeData') || '[]');
    const selectedEmployee = employees.find(emp => emp.id === select.value);
    const row = select.closest('tr');
    
    if (selectedEmployee) {
        row.querySelector('.employee-name').textContent = 
            `${selectedEmployee.firstName} ${selectedEmployee.lastName}`;
        row.querySelector('.employee-salary').textContent = selectedEmployee.salary || 'N/A';
        row.querySelector('.employee-department').textContent = selectedEmployee.department || 'N/A';
        updateAllDropdowns();
    } else {
        row.querySelector('.employee-name').textContent = '';
        row.querySelector('.employee-salary').textContent = '';
        row.querySelector('.employee-department').textContent = '';
    }
}

function calculateDepartmentTotals(details) {
    const departmentTotals = {};
    
    details.forEach(employee => {
        const department = employee.department;
        const salary = parseFloat(employee.salary) || 0;
        
        if (!departmentTotals[department]) {
            departmentTotals[department] = {
                totalSalary: 0,
                employeeCount: 0
            };
        }
        
        departmentTotals[department].totalSalary += salary;
        departmentTotals[department].employeeCount++;
    });
    
    return departmentTotals;
}

function generateReport() {
    const reportData = saveReport();
    if (!reportData) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    reportData.generatedBy = currentUser.username || 'Unknown User';
    reportData.generatedAt = new Date().toISOString();

    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    reports.push(reportData);
    localStorage.setItem('reports', JSON.stringify(reports));

    alert('Report generated and saved successfully!');
    viewPreviousReports();
}

function saveReport() {
    const details = getReportDetails();
    if (details.length === 0) {
        alert('Please add at least one employee to the report');
        return null;
    }

    const summary = generateReportSummary(details);
    
    return {
        reportNo: document.getElementById('reportNo').value,
        date: document.getElementById('reportDate').value,
        details: details,
        departmentTotals: summary.departmentTotals,
        totalSalary: summary.totalSalary
    };
}

function generateReportSummary(details) {
    const departmentTotals = calculateDepartmentTotals(details);
    let totalSalary = 0;
    
    for (const [, data] of Object.entries(departmentTotals)) {
        totalSalary += data.totalSalary;
    }
    
    return {
        departmentTotals: departmentTotals,
        totalSalary: totalSalary
    };
}

function getReportDetails() {
    const details = [];
    const rows = document.getElementById('reportBody').getElementsByTagName('tr');
    
    for (let row of rows) {
        const employeeId = row.querySelector('.employee-select')?.value;
        if (employeeId) {
            details.push({
                employeeId: employeeId,
                name: row.querySelector('.employee-name').textContent,
                salary: row.querySelector('.employee-salary').textContent,
                department: row.querySelector('.employee-department').textContent
            });
        }
    }
    
    return details;
}

function viewPreviousReports() {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const mainContent = document.querySelector('.main-content');
    
    if (reports.length === 0) {
        mainContent.innerHTML = `
            <div class="previous-reports">
                <h2>Previous Reports</h2>
                <p>No reports have been generated yet.</p>
                <button onclick="showGenerateReportForm()" class="btn generate">Generate New Report</button>
            </div>
        `;
        return;
    }

    let reportsHTML = `
        <div class="previous-reports">
            <h2>Previous Reports</h2>
            <div class="reports-grid">
                ${reports.map(report => `
                    <div class="report-card">
                        <h3>Report ${report.reportNo}</h3>
                        <p class="report-date">Date: ${new Date(report.date).toLocaleDateString()}</p>
                        <p class="report-generator">Generated by: ${report.generatedBy || 'Unknown'}</p>
                        <p class="report-timestamp">Generated on: ${report.generatedAt ? new Date(report.generatedAt).toLocaleString() : 'Unknown'}</p>
                        <div class="department-breakdown">
                            <h4>Department Breakdown:</h4>
                            ${Object.entries(report.departmentTotals || {}).map(([dept, data]) => `
                                <p>${dept}: ${data.totalSalary.toFixed(2)} (${data.employeeCount} employees)</p>
                            `).join('')}
                        </div>
                        <p class="total-salary">Total Salary: ${report.totalSalary ? report.totalSalary.toFixed(2) : '0.00'}</p>
                        <div class="report-actions">
                            <button onclick="viewReportDetails('${report.reportNo}')" class="view-details-btn">View Details</button>
                            <button onclick="deleteReport('${report.reportNo}')" class="delete-btn">Delete Report</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    mainContent.innerHTML = reportsHTML;
}

function viewReportDetails(reportNo) {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const report = reports.find(r => r.reportNo === reportNo);
    if (!report) return;
    
    const mainContent = document.querySelector('.main-content');
    
    mainContent.innerHTML = `
        <div class="report-display">
            <div class="report-header">
                <h2>Report ${report.reportNo}</h2>
                <p>Date: ${new Date(report.date).toLocaleDateString()}</p>
                <p>Generated by: ${report.generatedBy}</p>
                <p>Generated on: ${new Date(report.generatedAt).toLocaleString()}</p>
            </div>
            <div class="report-content">
                <h3>Employee Details</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Salary</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.details.map(emp => `
                            <tr>
                                <td>${emp.employeeId}</td>
                                <td>${emp.name}</td>
                                <td>${emp.department}</td>
                                <td>${parseFloat(emp.salary).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="report-summary">
                    <h3>Department Summary</h3>
                    ${Object.entries(report.departmentTotals).map(([dept, data]) => `
                        <div class="department-summary">
                            <h4>${dept}</h4>
                            <p>Total Employees: ${data.employeeCount}</p>
                            <p>Total Salary: ${data.totalSalary.toFixed(2)}</p>
                        </div>
                    `).join('')}
                    <div class="total-summary">
                        <h4>Overall Total</h4>
                        <p>Total Salary Across All Departments: ${report.totalSalary.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            <div class="button-group">
                <button onclick="viewPreviousReports()" class="back-btn">Back to Reports</button>
                <button onclick="printReport()" class="print-btn">Print Report</button>
                <button onclick="deleteReport('${report.reportNo}')" class="delete-btn">Delete Report</button>
            </div>
        </div>
    `;
}

function deleteReport(reportNo) {
    if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
        let reports = JSON.parse(localStorage.getItem('reports') || '[]');
        reports = reports.filter(report => report.reportNo !== reportNo);
        localStorage.setItem('reports', JSON.stringify(reports));
        
        alert('Report deleted successfully');
        viewPreviousReports();
    }
}

function clearForm() {
    document.getElementById('reportBody').innerHTML = '';
    addNewRow();
}

function printReport() {
    window.print();
}