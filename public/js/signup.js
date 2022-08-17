const myForm = document.getElementById('signup-form');
const emailInput = document.getElementById('inputEmail');
const passwordInput = document.getElementById('inputPassword');
const firstNameInput = document.getElementById('inputFirstName');
const lastNameInput = document.getElementById('inputLastName');
const weightInput = document.getElementById('inputWeight');
const heightInput = document.getElementById('inputHeight');
const birthDateInput = document.getElementById('inputBirthDate');
const frequencyInput = document.getElementById('inputFrequency');
const bioInput = document.getElementById('inputBio');

//validate weight input
weightInput.addEventListener('input', () => {
  if (weightInput.value) {
    if (parseInt(weightInput.value) < 0 || parseInt(weightInput.value) > 1400) {
      weightInput.setCustomValidity('weight out of range');
      weightInput.checkValidity();
    } else {
      weightInput.setCustomValidity('');
    }
  } else {
    weightInput.setCustomValidity('');
  }
});

//validate height input
heightInput.addEventListener('input', () => {
  if (heightInput.value) {
    if (parseInt(heightInput.value) < 0 || parseInt(heightInput.value) > 108) {
      heightInput.setCustomValidity('height out of range');
      heightInput.checkValidity();
    } else {
      heightInput.setCustomValidity('');
    }
  } else {
    heightInput.setCustomValidity('');
  }
});

//validate frequency
frequencyInput.addEventListener('input', () => {
  if (frequencyInput.value) {
    if (parseInt(frequencyInput.value) < 0 || parseInt(frequencyInput.value) > 7) {
      frequencyInput.setCustomValidity('frequency out of range');
      frequencyInput.checkValidity();
    } else {
      frequencyInput.setCustomValidity('');
    }
  } else {
    frequencyInput.setCustomValidity('');
  }
});

//validate bio
bioInput.addEventListener('input', () => {
  if (bioInput.value) {
    if (bioInput.value.trim().length === 0) {
      bioInput.setCustomValidity('bio can\'t just be spaces');
      bioInput.checkValidity();
    } else {
      bioInput.setCustomValidity('');
    }
  } else {
    bioInput.setCustomValidity('');
  }
});

//validate birthDate
birthDateInput.addEventListener('input', () => {
  if (birthDateInput.value) {
    if (birthDateInput.value.trim().length === 0) {
      birthDateInput.setCustomValidity('Birthdate must be provided');
      birthDateInput.checkValidity();
    } else {
      birthDateInput.setCustomValidity('');
    }
  } else {
    birthDateInput.setCustomValidity('');
  }
});

//check form validity on submission
if (myForm) {
  myForm.addEventListener('submit', (event) => {
    //make sure all fields still have required property
    emailInput.required = 'true';
    passwordInput.required = 'true';
    firstNameInput.required = 'true';
    birthDateInput.requierd = 'true';

    if (myForm.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    myForm.classList.add('was-validated');
  });
}
