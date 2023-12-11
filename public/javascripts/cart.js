document.addEventListener("DOMContentLoaded", function () {
    const incBtns = document.querySelectorAll(".incrementBtn");
    const decBtns = document.querySelectorAll(".decrementBtn");
    const inputBoxes = document.querySelectorAll(".quantityBtn");

    incBtns.forEach((incBtn, index) => {
        incBtn.addEventListener("click", function () {
            const currentQuantity = parseInt(inputBoxes[index].value);
            const newQuantity = currentQuantity + 1;
            inputBoxes[index].value = newQuantity;
            updatefn(incBtn.getAttribute("data-product-id"), newQuantity);
        });
    });

    decBtns.forEach((decBtn, index) => {
        decBtn.addEventListener("click", function () {
            alert('-')
            const currentQuantity = parseInt(inputBoxes[index].value);
            if (currentQuantity > 1) {
                const newQuantity = currentQuantity - 1;
                inputBoxes[index].value = newQuantity;
                updatefn(decBtn.getAttribute("data-product-id"), newQuantity);
            }
        });
    });

    function updatefn(productId, quantity) {
        alert(productId)
        alert(quantity)
        fetch('/updateqn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity })
        })
        .then((response) => {
            if (response.ok) {
                location.reload();
                console.log('Quantity updated successfully');
            } else {
                console.error('Error updating quantity');
            }
        })
        .catch((error) => {
            console.error('Fetch error', error);
        });
    }
});


async function tickbox(id) {
    //   alert('called')
    try {
      const response = await fetch('/selectproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
  
      if(response.status) {
console.log('product selected');
     }
    } 
    catch (error) {
      console.error('An error occurred:', error);
    }
  };
  