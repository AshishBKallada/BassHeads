async function blockUser(id) {
   

    try {
        Swal.fire({
            title: 'Change user block status ?',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Save',
            denyButtonText: `Don't save`,
        }).then( async (result) => {
            if (result.isConfirmed) {
                const response = await fetch('/admin/blockuser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id }),
                });

                if (response.ok) {
                    await Swal.fire('Block status changed !', '', 'success')
                    location.reload();
                } else {
                    console.error('Failed to block the user. Status code:', response.status);
                    }
                    
                } else if (result.isDenied) {
                    Swal.fire('Changes are not saved', '', 'info')
                }
            })
    } catch (error) {
        console.error('An error occurred:', error);
    }


}
