function updateTime() {
    const now = new Date();
    document.getElementById('current-time').innerText = now.toLocaleString();
}
setInterval(updateTime, 1000);

function calculateHours(clockIn, clockOut) {
    const timeIn = new Date(clockIn);
    const timeOut = new Date(clockOut);
    const diffMs = timeOut - timeIn;
    const diffHrs = diffMs / (1000 * 60 * 60);
    return diffHrs.toFixed(2);
}

function markAttendance(type) {
    const employeeId = document.getElementById('employee-id').value.trim();
    
    // Input validation
    if (!employeeId) {
        alert('Please enter your Employee ID.');
        return;
    }

    // Get employees from localStorage
    const employees = JSON.parse(localStorage.getItem('employeeData') || '[]');
    
    // Check if employee exists
    const employee = employees.find(emp => emp.id === employeeId);
    
    if (!employee) {
        alert('Employee ID not found. Please check your ID or contact HR.');
        return;
    }

    const now = new Date();
    const today = now.toLocaleDateString();
    let records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];

    // Check for existing attendance today
    const existingRecord = records.find(record => 
        record.id === employeeId && 
        record.date === today
    );

    if (type === 'in') {
        if (existingRecord && existingRecord.clockIn) {
            alert(`Already clocked in for ${employee.firstName} ${employee.lastName} today.`);
            return;
        }

        // Create new attendance record
        const attendance = {
            id: employeeId,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            date: today,
            clockIn: now.toLocaleString(),
            clockOut: null,
            hoursWorked: null,
            department: employee.department
        };

        if (existingRecord) {
            // Update existing record
            Object.assign(existingRecord, attendance);
        } else {
            // Add new record
            records.push(attendance);
        }

        alert(`Clock-in recorded successfully!\nEmployee: ${employee.firstName} ${employee.lastName}\nTime: ${now.toLocaleTimeString()}`);
    } else if (type === 'out') {
        if (!existingRecord || !existingRecord.clockIn) {
            alert('No clock-in record found for today. Please clock in first.');
            return;
        }

        if (existingRecord.clockOut) {
            alert('Already clocked out for today.');
            return;
        }

        existingRecord.clockOut = now.toLocaleString();
        existingRecord.hoursWorked = calculateHours(existingRecord.clockIn, existingRecord.clockOut);

        // Update total hours in separate storage
        let totalHours = JSON.parse(localStorage.getItem('employeeHours') || '{}');
        if (!totalHours[employeeId]) {
            totalHours[employeeId] = {
                totalHours: 0,
                name: `${employee.firstName} ${employee.lastName}`
            };
        }
        totalHours[employeeId].totalHours += parseFloat(existingRecord.hoursWorked);
        localStorage.setItem('employeeHours', JSON.stringify(totalHours));

        alert(`Clock-out recorded successfully!\nEmployee: ${employee.firstName} ${employee.lastName}\nHours Worked: ${existingRecord.hoursWorked}`);
    }

    localStorage.setItem('attendanceRecords', JSON.stringify(records));
    displayRecords();
}

function displayRecords() {
    const records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const tbody = document.getElementById('attendance-table').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    // Sort records by date and time (most recent first)
    records.sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn));

    records.forEach(record => {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = record.id;
        row.insertCell(1).innerText = record.employeeName || 'N/A';
        row.insertCell(2).innerText = record.date;
        row.insertCell(3).innerText = record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : 'N/A';
        row.insertCell(4).innerText = record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : 'Not clocked out';
        row.insertCell(5).innerText = record.hoursWorked ? `${record.hoursWorked} hrs` : 'N/A';
        row.insertCell(6).innerText = record.department || 'N/A';
    });
}

function toggleAttendanceHistory() {
    const historyDiv = document.getElementById('attendance-history');
    const button = document.querySelector('button[onclick="toggleAttendanceHistory()"]');
    
    if (historyDiv.style.display === 'none') {
        displayRecords();
        historyDiv.style.display = 'block';
        button.textContent = 'Hide Attendance History';
    } else {
        historyDiv.style.display = 'none';
        button.textContent = 'Show Attendance History';
    }
}

// Initialize when page loads
window.onload = function() {
    updateTime();
    displayRecords();
};