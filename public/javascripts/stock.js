let productId='';
function setProductId(id)
{
    productId=id;
}

async function addStock()
{
    const stock=document.getElementById('stock').value;
   
    const response=await fetch('/admin/addstock',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({productId,stock})
    })
    if(response.ok)
    {
        $('#exampleModal').modal('hide');

        Swal.fire({
            position: "top-center",
            icon: "success",
            title: "Stock Updated",
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            location.reload();
          })
    }
}