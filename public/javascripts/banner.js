function addBanner() {
  const formData = new FormData($('#banner-form')[0]);
  $.ajax({
    url: '/admin/addbanner',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false,
    success: function (data) {
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "New Banner Added",
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        window.location.href = "/admin/banners";
      });
    },
    error: function (error) {
      console.error('Error adding banner:', error);
    }
  });
}




async function removeBanner(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then(async (result) => {
    if (result.isConfirmed) {
      const response = await fetch('/admin/removebanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        Swal.fire({
          position: "top-center",
          icon: "success",
          title: "Banner Removed",
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          location.reload();
        });
      }
    }
  });
}

function changeStatus(id)
{
  const response = fetch('/admin/bannerstatus',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id })
  });
  if(response.ok)
  { 
    Swal.fire({
      position: "top-center",
      icon: "success",
      title: "Banner Status Updated !",
      showConfirmButton: false,
      timer: 1500
    }).then(() => {
      location.reload();
    });  }
}

