slider.oninput = function() {
  output.innerHTML = this.value;
}

var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;


async function productstatus(id) {
   
    
    try {
        console.log(id);
        const response = await fetch('/admin/productstatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        });

        if (response.ok) {
            location.reload();
        } else {
            console.error('Failed to change the status. Status code:', response.status);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
  

}

async function removeProduct(id) {
    try {
        const response = await fetch('/admin/removeproduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });

        if (response.status === 200) {
            location.reload();
        } else {
            alert('Error removing product');
        }
    } catch (error) {
        console.error('An error occurred:', error);
        alert('An error occurred while removing the product');
    }
}



document.addEventListener("DOMContentLoaded",function(){

    const editBtns=document.querySelectorAll(".edit-info-button");
    const saveBtns=document.querySelectorAll(".save-button");
    const cancelBtns=document.querySelectorAll(".cancel-button");

    editBtns.forEach((button)=>{
          button.addEventListener("click",function(){
            alert('1')
            const row = button.closest("tr");
            const viewModeElements = row.querySelectorAll(".view-mode");
            const editModeElements = row.querySelectorAll(".edit-mode");
            const saveButton = row.querySelector(".save-button");
            const cancelButton = row.querySelector(".cancel-button");

            viewModeElements.forEach((element)=>(element.style.display="none"));
            editModeElements.forEach((element)=>(element.style.display="block"));
            saveButton.style.display = "block";
            cancelButton.style.display = "block";
          });
    })

    saveBtns.forEach((button)=>{
        button.addEventListener("click",function(){
        const row = button.closest("tr");
        const viewModeElements = row.querySelectorAll(".view-mode");
        const editModeElements = row.querySelectorAll(".edit-mode");
        const saveButton = row.querySelector(".save-button");
        const cancelButton = row.querySelector(".cancel-button");

        viewModeElements.forEach((element) => (element.style.display = "block"));
        editModeElements.forEach((element) => (element.style.display = "none"));
        saveButton.style.display = "none";
        cancelButton.style.display = "none";

        const updatedData={
            id:row.querySelector('#edit-id').value,
            name:row.querySelector('#edit-name').value,
            category:row.querySelector('#edit-category').value,
            price:row.querySelector('#edit-price').value,
            stock:row.querySelector('#edit-stock').value,
            discount:row.querySelector('#edit-discount').value,
        };

        fetch("/admin/updateproduct", {
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



    cancelBtns.forEach((button) => {
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
