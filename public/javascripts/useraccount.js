

async function removeAddress(id)
{
    const addressId=id;
    alert(addressId)
    try{
    Swal.fire({
        title: "Do you want to remove this address?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Remove",
        denyButtonText: `Don't Remove`
      }).then(async (result) => {
        if (result.isConfirmed) { 
            const response = await fetch('/removeAddress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ addressId }),
        });

        if (response.ok) {
            await Swal.fire('Removed!', '', 'danger')
            location.reload();
        } else {
            console.error('Failed to remove the address. Status code:', response.status);
            }
            
        } else if (result.isDenied) {
            Swal.fire('Changes are not saved', '', 'info')
        }
    })
} catch (error) {
console.error('An error occurred:', error);
}
}

async function updateProfile() {
    const name = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    Swal.fire({
        position: "center",
        icon: "success",
        title: "Your profile has been updated",
        showConfirmButton: false,
        timer: 10000
    });
    try {
        const response = await fetch('/updateprofile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email }),
        });

        if (response.ok) {
           location.reload();
        } else {
            console.log('failed to save profile');
        }
    } catch (error) {
        console.log('Internal server error'+error);
    }
}

async function changePass() {
    alert('hey');
    Swal.fire({
        title: "Change Password",
        html: `
            <input type="text" id="input1" class="swal2-input" placeholder="Old password">
            <input type="text" id="input2" class="swal2-input" placeholder="New Password">
            <input type="text" id="input3" class="swal2-input" placeholder="Confirm password">
        `,
        showCancelButton: true,
        confirmButtonText: "Submit",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            const oldpass = document.getElementById('input1').value;
            const newpass = document.getElementById('input2').value;
            const conpass = document.getElementById('input3').value;

            try {
                const response = await fetch("/changepass", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ oldpass, newpass, conpass }),
                });
                const responseData = await response.json();
               
                if (responseData.status===false) {
                    throw new Error(`Request failed: ${responseData.message}`);
                }

              
                
                if (responseData.error) {
                    throw new Error(responseData.error);
                }

                return responseData;

            } catch (error) {
                Swal.showValidationMessage(`Request failed: ${error.message}`);
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "New Password set",
                text: "Your password has been updated.",
                icon: "success",
            });
        }
    }).catch ((error)=> {
        Swal.showValidationMessage(`Request failed: ${error.message}`);
    })
}


function forgotPass()
{
    alert('first call')
    try{
    Swal.fire({
        title: "Sent a link to rest your password?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Sent",
        denyButtonText: `Don't sent`
      }).then(async (result) => {
        if (result.isConfirmed) {
            const response=await fetch('/forgotpass',{
                method:'POST',
                header:{
                    'Content-Type':'application/json'
                    },
                    body:JSON.stringify({})
        });
        if(response.ok)
        {
          await Swal.fire("Link Sent to your Email!", "", "success");
        } 
        else{
            console.error('failed to sent the link')
        } 
    }  
      else if (result.isDenied) {
          Swal.fire("Changes are not saved", "", "info");
        }
      })
    }
      catch(error)
      {
        console.error('An error occured:',error);
      }
}

function shareLink() {

  $.get('/getreferal',(data)=>{
   const referalcode=data.referalCode;
  const linkToShare = `http://127.0.0.1:8000/signup?code=${referalcode}`;

  const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(linkToShare)}`;

  window.open(whatsappUrl, '_blank');

  })
  .fail(error)
  {
    alert('failed getting the referal code')
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
                }).then(() =>{
                  location.reload();
                })
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

