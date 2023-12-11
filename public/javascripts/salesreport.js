$('#exampleModal').on('click', '.btn-pdf, .btn-excel', function (event) {
    var modal = $(this).closest('.modal');

    var startDate = modal.find('#start-date').val();
    var endDate = modal.find('#end-date').val();
    var selectedOption = modal.find('#exampleSelect').val();
    var selectedFormat = $(this).data('format');

    if ((!startDate && !endDate) && !selectedOption) {
        alert('Please provide either Start Date and End Date or select an option.');
        event.preventDefault();
        return;
    }

    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);
    console.log('Selected Option:', selectedOption);
    console.log('Selected Format:', selectedFormat);

    fetch(`/admin/salesprint?startDate=${startDate}&endDate=${endDate}&filter=${selectedOption}&format=${selectedFormat}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.blob();
        })
        .then((data) => {
            const mimeType = selectedFormat === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf';

            const blob = new Blob([data], { type: mimeType });
            const fileExtension = selectedFormat === 'excel' ? 'xlsx' : 'pdf';

            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `sales_report.${fileExtension}`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            Swal.fire({
                position: "top-center",
                icon: "success",
                title: "Sales report is being downloaded",
                showConfirmButton: false,
                timer: 2000
              }).then(() => {            location.reload();
              });
        })
        .catch((error) => {
            console.error('Error:', error.message);
        });
});
