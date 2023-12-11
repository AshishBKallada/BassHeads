async function returnStatus(returnId,status)
{
    alert(status);
    const response=await fetch('/admin/return/returnstatus',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({returnId,status})

    })
    if(response.ok)
    {
        alert('aahda mwonu set');
        
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Return status Updated",
            showConfirmButton: false,
            timer: 1500,
            onClose: () => {
                Swal.close(); 
                location.reload();
            }
        });
    }
}