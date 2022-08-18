const myForm = document.getElementById('form-signup');
const inputEmail = document.getElementById('inputEmail');
const inputPassword = document.getElementById('inputPassword');

//validate email input
inputEmail.addEventListener('input', () => {
  if (inputEmail.value) {
    inputEmail.setCustomValidity('');
  } else {
    inputEmail.setCustomValidity('Email is not provided');
  }
});

//validate password input
inputPassword.addEventListener('input', () => {
  if (inputPassword.value) { 
    inputPassword.setCustomValidity('');
  } else {
    inputPassword.setCustomValidity('Password is not provided');
  }
});

//check form validity on submission
if (myForm) {
  myForm.addEventListener('submit', (event) => {
    if (myForm.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    myForm.classList.add('was-validated');
  });
}