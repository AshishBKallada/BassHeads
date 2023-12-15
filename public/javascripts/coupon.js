const { wishlistModel } = require("../../config/model");

async function createCoupon() {
    const name = document.getElementById('product_name').value;
    const discountx = document.getElementById('discount').value;
    const expiry = document.getElementById('expiryDate').value;
    const mincartx= document.getElementById('mincart').value;
    const mincart=parseInt(mincartx);
    const discount = parseInt(discountx);

    document.getElementById('nameError').textContent = '';
    document.getElementById('dateError').textContent = '';

    let isValid = true;

    if (name.trim() === '') {
      document.getElementById('nameError').textContent = 'Please enter the coupon name.';
      isValid = false;
  } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      document.getElementById('nameError').textContent = 'Coupon name should only contain letters and spaces.';
      isValid = false;
  }
  

    

    if (expiry.trim() === '') {
        document.getElementById('dateError').textContent = 'Please enter expiry date.';
        isValid = false;
    }
    if (!/^\d+$/.test(discount) || isNaN(discount) || discount <= 0 || discount > 100) {
        document.getElementById('discountError').textContent = 'Please enter a valid discount.';
        isValid = false;
    }
    if (!/^[1-9]\d*$/.test(mincart) || isNaN(mincart) || mincart<= 0) {
      document.getElementById('minError').textContent = 'Please enter a valid minimum amount.';
      isValid = false;
  }

    if (!isValid) {
        return;
    }

 
    const response = await fetch('/admin/coupons', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, discount, expiry,mincart }),
    });
    if(response.status===201)
    {
      document.getElementById('nameError').innerHTML = "coupon already exists";
    }

    if (response.ok) {
        const responseData = await response.json();
        if (responseData.status) {
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'New coupon Added',
                showConfirmButton: false,
                timer: 1500,
            }).then(() => {
                location.reload();
            });

        } else {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Failed to add coupon',
                showConfirmButton: true,
            });
        }
    } else {
        Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Failed to add coupon',
            showConfirmButton: true,
        });
    }
}


  async function changeStatus(id) {
    
      const response = await fetch('/admin/couponstatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
  
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.status) {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Product status changed',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            location.reload();
          });
          
        } else {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Failed to change status',
            showConfirmButton: true,
          });
        }
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Failed to change status',
          showConfirmButton: true,
        });
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
  
    cancelButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const row = button.closest("tr");
        const viewModeElements = row.querySelectorAll(".view-mode");
        const editModeElements = row.querySelectorAll(".edit-mode");
        const saveButton = row.querySelector(".save-button");
        const cancelButton = row.querySelector(".cancel-button");
  
        viewModeElements.forEach((element) => (element.style.display = "none"));
        editModeElements.forEach((element) => (element.style.display = "block"));
        saveButton.style.display = "none";
        cancelButton.style.display = "none";
      });
    });
  
    saveButtons.forEach((button) => {
      button.addEventListener("click", async function () {
        try {
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
            discount: row.querySelector("#edit-discount").value,
          };
  
          let missingFields = false;
  
          if (!updatedData.name && !updatedData.discount) {
            alert('Name and discount are required');
            return;
          }
  
          if (!updatedData.name) {
            alert('Name is required.');
            missingFields = true;
          }
  
          if (!updatedData.discount) {
            alert('Discount is required.');
            missingFields = true;
          }
  
          if (missingFields) {
            return;
          }
  
          const response = await fetch("/admin/updatecoupon", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
          });
  
          if (response.ok) {
            const responseData = await response.json();
            if (responseData.status) {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Coupon Updated',
                showConfirmButton: false,
                timer: 1500,
              }).then(() => {
                location.reload();
              });
            } else {
              Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Failed to update coupon',
                showConfirmButton: true,
              });
            }
          } else {
            Swal.fire({
              position: 'center',
              icon: 'error',
              title: 'Failed to update coupon',
              showConfirmButton: true,
            });
          }
        } catch (error) {
          console.error('An error occurred:', error);
        }
      });
    });
  });
  

  async function removeCoupon(id) {
    try {
        const response = await fetch('/admin/removecoupon/' + id);

        if (response.ok) {
            Swal.fire({
                position: "top-center",
                icon: "success",
                title: "Coupon Removed",
                showConfirmButton: false,
                timer: 2000,
            }).then(() => {
                location.reload();
            });
        } else {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            Swal.fire({
                position: "top-center",
                icon: "error",
                title: "Failed to remove coupon",
                showConfirmButton: false,
                timer: 2000,
            });
        }
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        Swal.fire({
            position: "top-center",
            icon: "error",
            title: "An unexpected error occurred",
            showConfirmButton: false,
            timer: 2000,
        });
    }
}
