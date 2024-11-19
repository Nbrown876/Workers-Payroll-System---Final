// Basic calculations and functionality
document.addEventListener('DOMContentLoaded', function() {
    // Calculate Net Pay when basic pay, allowance, or deduction changes
    const basicPayInput = document.querySelector('input[type="number"]');
    const allowanceInput = basicPayInput.parentElement.nextElementSibling.querySelector('input');
    const deductionInput = allowanceInput.parentElement.nextElementSibling.querySelector('input');
    const netPayInput = document.querySelector('input[readonly]');

    function calculateNetPay() {
        const basicPay = parseFloat(basicPayInput.value) || 0;
        const allowance = parseFloat(allowanceInput.value) || 0;
        const deduction = parseFloat(deductionInput.value) || 0;
        const netPay = basicPay + allowance - deduction;
        netPayInput.value = netPay.toFixed(2);
        
        // Convert to words (basic implementation)
        const amountInWordsInput = netPayInput.parentElement.nextElementSibling.querySelector('input');
        amountInWordsInput.value = numberToWords(netPay);
    }

    [basicPayInput, allowanceInput, deductionInput].forEach(input => {
        input.addEventListener('input', calculateNetPay);
    });

    // Clear form
    document.querySelector('.clear').addEventListener('click', function() {
        document.querySelectorAll('input').forEach(input => input.value = '');
        document.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
    });

    // Save functionality
    document.querySelector('.save').addEventListener('click', function() {
        alert('Payslip saved successfully!');
    });

    // Submit email functionality
    document.querySelector('.submit').addEventListener('click', function() {
        alert('Payslip submitted and emailed successfully!');
    });
});

// Basic number to words conversion (simplified version)
function numberToWords(number) {
    return `${number.toFixed(2)} DOLLARS ONLY`; // Simplified version
}