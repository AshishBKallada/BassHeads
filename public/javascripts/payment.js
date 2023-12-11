
let addressId = '';
let payment = '';

function selectAddress(id) {
  addressId = id;
  document.getElementById('addressIdInput').value = id;


}

function selectPaymentMethod(paymethod) {

  payment = paymethod;
}



function confirmorder() {
  try {
    const sessionTotal = sessionStorage.getItem('updatedValue');
    Swal.fire({
      title: 'Confirm your order?',
      text: "You can cancel later !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Place Order!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await fetch('/shipping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ addressId, payment, sessionTotal}),
        });

     
        if (response.status === 201) {
          response.json().then((res) => {
            if (res.order) {

              var options = {
                key: 'rzp_test_V3DZwSKhBI59P9',  
                amount: res.order.amount,
                currency: res.order.currency,
                name: 'BassHeads',
                description: ' blah blah descripton',
                order_id: res.order.id,
                handler: async function (razorpayResponse) {
                      await fetch('/order/updatestatus',{
                        method:'POST',
                        headers:{
                          'Content-Type':'application/json'
                        },
                        body:JSON.stringify({payment_details:razorpayResponse,addressId,payment,sessionTotal,total:res.order.amount})
                      
                       }).then(()=>{
                        window.location.href = '/orderconfirm';
                      })
                },
              };
              var rzp=new Razorpay(options);
              rzp.open();
            }
          })

        }
        else if (response.status === 501) {
          await Swal.fire(
            'Couldnt place order!',
            'Insufficient Balance.',
            'warning'
          )
          sessionStorage.removeItem('updatedValue');

        }  else if (response.status === 200) {
          await Swal.fire({
            title:'Order Confirmed!',
            text:'Your order has been placed.',
            icon:'success'
          }).then(()=>{
            alert("after ")
            sessionStorage.removeItem('updatedValue');
            location.href = '/orderconfirm'
          })
          

        } else {
          console.error('Failed to complete the order. Status code:', response.status);
        }
      }
      else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info')

      }
    })
  } catch (error) {
    console.error('An error occurred:', error);
  }


}




async function applyCoupon(total) {
  const cartTotal = total;
  const selectTotal = document.getElementById("selectedTotal")
  const Total = document.getElementById("Total")

  const couponCode = document.getElementById("coupon").value;
  const response = await fetch(`/coupon?code=${couponCode}`);

  if (response.ok) {
    const discount = await response.json();
    const discountValue = Number(discount);

    if (!isNaN(discountValue)) {
      const updatedValue = cartTotal - (cartTotal * discountValue / 100);
      selectTotal.textContent = '₹' + updatedValue.toFixed(2);
      Total.textContent = '₹' + (updatedValue + 450);
      const sessionValue = updatedValue + 450;
      sessionStorage.setItem('updatedValue', sessionValue);  //sessionilekk ketti
      Swal.fire({
        position: "top",
        icon: "success",
        title: "Coupon applied",
        showConfirmButton: false,
        timer: 1500
      });
    } else {
      alert('Invalid discount value received.');
    }
  } else {
    alert('Coupon validation failed.');
  }
}


function addWallet()
{
  Swal.fire({
    title: "Enter amount to add to Wallet",
    input: "text",
    inputAttributes: {
      autocapitalize: "off"
    },
    showCancelButton: true,
    confirmButtonText: "Add",
    showLoaderOnConfirm: true,
    preConfirm: async (amount) => {
     try
     {
      const response= await fetch('/addwallet',{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({amount})
      })
      if(response.status===200)
      {
       response.json().then((res)=>{
        if(res.order)
        {
          var options={
            key:'rzp_test_V3DZwSKhBI59P9',
            amount:res.order.amount,
            currency:res.order.currency,
            name:'BassHeads',
            description:'bhjgv ghb ',
            order_id:res.order.id,
            handler:async function(razorpayResponse)
            {
             const response=await fetch('/updatewallet',{
                method:'POST',
                headers:{
                  'Content-Type':'application/json'
                },
                body:JSON.stringify({amount:res.order.amount})
              })
              if(response.ok)
              {
                Swal.fire({
                  position: "top",
                  icon: "success",
                  title: "Wallet Updated",
                  showConfirmButton: false,
                  timer: 1500
                });
              }
            },
          };
          var rzp=new Razorpay(options);
          rzp.open();
        }
       })
      }
        else{
          Swal.fire({
            position:"top",
            icon:'warning',
            title:"Failed to update Wallet !",
            showConfirmButton:false,
            timer:1500
  
          })
        }
      
     }
     catch(error)
     {
     console.log('An error occured:',error);
     }
    },
  });
  
}