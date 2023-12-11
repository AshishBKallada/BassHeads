async function removeProduct(productId,index)
{

   const response = await fetch('/admin/editremoveproduct',{
       method:'POST',
       headers:{
           'Content-Type':'application/json'
       },
       body:JSON.stringify({productId,index})
   })
   if(response.ok)
   {
    Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Product has been removed !",
        showConfirmButton: false,
        timer: 1500
      })
      .then(() => {
        location.reload();
      })
      
   }
}
function previewImages() {
    const input = document.getElementById('images-input');
    const container = document.getElementById('images-container');

    // Clear existing images in the container
    container.innerHTML = '';

    // Loop through each selected file
    for (const file of input.files) {
        const reader = new FileReader();
        const image = document.createElement('img');

        reader.onload = function () {
            image.src = reader.result;
        };

        // Read the file as a data URL
        reader.readAsDataURL(file);

        // Append the new image element to the container
        container.appendChild(image);
    }
}

