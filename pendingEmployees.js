class PendingEmployeeDatabase {
    constructor() {
        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem('pendingEmployees')) {
            localStorage.setItem('pendingEmployees', JSON.stringify([]));
        }
    }

    addPendingEmployee(employeeData) {
        const pendingEmployees = this.getPendingEmployees();
        const pendingEmployee = {
            ...employeeData,
            pendingId: 'PENDING_' + Date.now(),
            submissionDate: new Date().toISOString(),
            status: 'pending'
        };
        pendingEmployees.push(pendingEmployee);
        localStorage.setItem('pendingEmployees', JSON.stringify(pendingEmployees));
        return pendingEmployee.pendingId;
    }

    getPendingEmployees() {
        return JSON.parse(localStorage.getItem('pendingEmployees') || '[]');
    }

    removePendingEmployee(pendingId) {
        const pendingEmployees = this.getPendingEmployees();
        const filteredEmployees = pendingEmployees.filter(emp => emp.pendingId !== pendingId);
        localStorage.setItem('pendingEmployees', JSON.stringify(filteredEmployees));
    }

    getPendingCount() {
        return this.getPendingEmployees().length;
    }
}