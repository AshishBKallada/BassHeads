async function blockUser(id) {
    // let Btn = document.getElementById("userstatus" + id);
    // if (Btn.style.background === 'orangered') {
    //     Btn.style.background = 'green';
    // } else if (Btn.style.background === 'green') {
    //     Btn.style.background = 'orangered';
    // }

    try {
        Swal.fire({
            title: 'Do you want to save the changes?',
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
                    await Swal.fire('Saved!', '', 'success')
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
