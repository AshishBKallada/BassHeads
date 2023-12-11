 function changestatus(id)
{
    const option=document.getElementById('orderStatusSelect');
    const status=option.value;
    const orderId=id;
    try{
    Swal.fire({
        title: 'Do you want to save the changes?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Save',
        denyButtonText: `Don't save`,
      }).then(async (result) => {
        if (result.isConfirmed) {
            const response = await fetch('/admin/updateorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status,orderId }),
            });
                    if (response.ok) {

         await Swal.fire('Updated!', '', 'success')
        }
        else{
            console.error('Failed to update the order status. Status code:', response.status);
        } 
    }
        else if (result.isDenied) {
          Swal.fire('Changes are not saved', '', 'info')
        }
      })
}
catch (error) {
    console.error('An error occurred:', error);
}
}

async function requestStatus(selectedStatus, orderId) {
    alert(selectedStatus);
    alert(orderId);
try{
    const response = await fetch('/admin/cancelorder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: selectedStatus, id: orderId })
    })
    if (response.ok) {
        window.location.reload();
    } else {
        console.error(`Request failed with status: ${response.status}`);
    }
} catch (error) {
    console.error(`Request failed: ${error.message}`);
}
    
}
