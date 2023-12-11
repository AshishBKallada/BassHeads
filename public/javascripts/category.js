
async function statusChange(id) {

  try {
    const response = await fetch('/admin/changestatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (response.status) {
      location.reload()
    }
  }
  catch (error) {
    console.error('An error occurred:', error);
  }
}


document.addEventListener("DOMContentLoaded", function () {
  const editInfoButtons = document.querySelectorAll(".edit-info-button");
  const saveButtons = document.querySelectorAll(".save-button");
  const cancelButtons = document.querySelectorAll(".cancel-button");

  editInfoButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const row = button.closest("tr");
      const viewModeElements = row.querySelectorAll(".view-mode");
      const editModeElements = row.querySelectorAll(".edit-mode");
      const saveButton = row.querySelector(".save-button");
      const cancelButton = row.querySelector(".cancel-button");

      viewModeElements.forEach((element) => (element.style.display = "none"));
      editModeElements.forEach((element) => (element.style.display = "block"));
      saveButton.style.display = "block";
      cancelButton.style.display = "block";
    });
  });

  saveButtons.forEach((button) => {
    button.addEventListener("click", function () {

      const row = button.closest("tr");
      const viewModeElements = row.querySelectorAll(".view-mode");
      const editModeElements = row.querySelectorAll(".edit-mode");
      const saveButton = row.querySelector(".save-button");
      const cancelButton = row.querySelector(".cancel-button");

      viewModeElements.forEach((element) => (element.style.display = "block"));
      editModeElements.forEach((element) => (element.style.display = "none"));
      saveButton.style.display = "none";
      cancelButton.style.display = "none";

      const updatedData = {
        id: row.querySelector('#edit-id').value,
        name: row.querySelector("#edit-name").value,
        description: row.querySelector("#edit-description").value,
        status: row.querySelector("#edit-status").value
      };
      let missingFields = false;
      if (!updatedData.name && !updatedData.description) {
        alert('Name and description is required');
        return;
      }
      if (!updatedData.name) {
        alert('Name is required.');
        missingFields = true;
      }

      if (!updatedData.description) {
        alert('Description is required.');
        missingFields = true;
      }

      if (missingFields) {
        return;
      }
      console.log(updatedData);

      fetch("/admin/updatecat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
      })
        .then(response => response.json())
        .then(data => {
          location.reload();
        })
        .catch(error => {
          console.error("Error storing data:", error);
        });
    });
  });

  cancelButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const row = button.closest("tr");
      const viewModeElements = row.querySelectorAll(".view-mode");
      const editModeElements = row.querySelectorAll(".edit-mode");
      const saveButton = row.querySelector(".save-button");
      const cancelButton = row.querySelector(".cancel-button");

      viewModeElements.forEach((element) => (element.style.display = "block"));
      editModeElements.forEach((element) => (element.style.display = "none"));
      saveButton.style.display = "none";
      cancelButton.style.display = "none";
    });
  });
});


async function updateDiscount() {
  const categorySelect = document.getElementById("categorySelect");
  const selectedCategoryId = categorySelect.value;
  const discount=document.getElementById("myRange").value;

   const response=await fetch('/admin/catdiscount',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id:selectedCategoryId,
      discount:discount
    })
   })
   if(response.ok) {
    Swal.fire({
      position: "top",
      icon: "success",
      title: "Category discount updated",
      showConfirmButton: false,
      timer: 1500
    }).then(()=>{
      location.reload();
    })     
}
}