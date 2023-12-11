function showReturnModal(orderId, productId) {
    $('#exampleModalCenter').data('orderId', orderId);
    $('#exampleModalCenter').data('productId', productId);
    $('#exampleModalCenter').modal('show');
}

async function processReturn() {
    const returnOptions = $("input[name='returnOption']:checked").val();
    const orderId = $('#exampleModalCenter').data('orderId');
    const productId = $('#exampleModalCenter').data('productId');
    const reason=$("#reason").val();
    if (returnOptions) {
        const response = await fetch('/returnrequest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ returnOptions, orderId, productId,reason })
        });

        if (response.ok) {
            $('#exampleModalCenter').modal('hide');

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Return request sent",
                showConfirmButton: false,
                timer: 1500,
               
                
            }).then(() =>{
              location.reload();
            })
        } else {
          $('#exampleModalCenter').modal('hide');

          Swal.fire({
              position: "center",
              icon: "danger",
              title: "Failed to sent request ",
              showConfirmButton: false,
              timer: 1500,
             
              
          }).then(() =>{
            location.reload();
          })        }
    } else {
        alert('Please select a return option');
    }
}


async function cancelRequest(productId,orderId)
{

    Swal.fire({
        title: "Submit your reason for cancellation",
        input: "text",
        inputAttributes: {
          autocapitalize: "off"
        },
        showCancelButton: true,
        confirmButtonText: "Submit",
        showLoaderOnConfirm: true,
        preConfirm: async (reason) => {
          try {
            const response = await fetch("/cancelorder", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ productId:productId, orderId: orderId, reason: reason }),
              });

            if (!response.ok) {
             throw new Error(`Request failed: ${response.status}`);
            }

            const responseData = await response.json();
            return responseData;

          } catch (error) {
            Swal.showValidationMessage(`
              Request failed: ${error}
            `);
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Order Cancelled",
            text: "Products order has been cancelled.",
            icon: "success",
          }).then(() => {
            location.reload();
          })
        }
      });
}
