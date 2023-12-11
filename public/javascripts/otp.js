document.addEventListener("DOMContentLoaded", function () {
  const signupButton = document.getElementById("signupButton");
  const resendButton = document.getElementById("resendBtn");
  const submitButton = document.getElementById("submitBtn");

  signupButton.addEventListener("click", function () {
    const name = document.getElementById("register-fname").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    if (email && name && password) {
      let overlay = document.getElementById("overlay");
      overlay.style.display = "block";
    }
  });

  submitButton.addEventListener("click", function () {
    const otpInputs = document.querySelectorAll('.form-control');
    const allInputsFilled = Array.from(otpInputs).every(input => input.value.trim() !== '');

    if (allInputsFilled) {
      // Trigger form submission
      document.getElementById("otp-form").submit();
    } else {
      // Optionally, show an alert or handle incomplete form
      alert('Please fill in all OTP fields.');
    }
  });

  let timerOn = true;

  function timer(remaining) {
    var m = Math.floor(remaining / 60);
    var s = remaining % 60;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;
    document.getElementById("countdown").innerHTML = `Time left: ${m} : ${s}`;
    remaining -= 1;
    if (remaining >= 0 && timerOn) {
      setTimeout(function () {
        timer(remaining);
      }, 1000);
      document.getElementById("resend").innerHTML = ``;
      return;
    }
    if (!timerOn) {
      return;
    }
    document.getElementById("resend").innerHTML = `Don't receive the code? 
    <span class="font-weight-bold text-color cursor" onclick="resendotp()">Resend
    </span>`;
  }

  timer(60);
});

const resendotp = async function () {
  try {
    const response = await fetch("/resendotp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: document.getElementById("register-email").value,
      }),
    });

    if (response.ok) {
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "OTP resent successfully!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        timer(60);
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to resend OTP. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error during OTP resend:", error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Something went wrong. Please try again.",
    });
  }
};