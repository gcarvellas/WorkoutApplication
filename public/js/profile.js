function editProfile() {
    document.getElementById("fnLabel").hidden = true;
    document.getElementById("fnText").hidden = true;
    document.getElementById("editFn").hidden = false;
    document.getElementById("editLn").hidden = false;
    document.getElementById("emailLabel").hidden = true;
    document.getElementById("emailText").hidden = true;
    document.getElementById("inputEmail").hidden = false;
    document.getElementById("editEmailLabel").hidden = false;
    document.getElementById("editPassword").hidden = false;
    document.getElementById("dateLabel").hidden = true;
    document.getElementById("dateText").hidden = true;
    document.getElementById("editDateLabel").hidden = false;
    document.getElementById("inputBirthDate").hidden = false;
    document.getElementById("weightLabel").hidden = true;
    document.getElementById("weightText").hidden = true;
    document.getElementById("editWeightLabel").hidden = false;
    document.getElementById("inputWeight").hidden = false;
    document.getElementById("heightLabel").hidden = true;
    document.getElementById("heightText").hidden = true;
    document.getElementById("editHeightLabel").hidden = false;
    document.getElementById("inputHeight").hidden = false;
    document.getElementById("fLabel").hidden = true;
    document.getElementById("fText").hidden = true;
    document.getElementById("editFLabel").hidden = false;
    document.getElementById("inputFrequency").hidden = false;
    document.getElementById("bioLabel").hidden = true;
    document.getElementById("bioText").hidden = true;
    document.getElementById("editBioLabel").hidden = false;
    document.getElementById("inputBio").hidden = false;
    document.getElementById("hr").hidden = false;
    document.getElementById("editProfile").hidden = true;
    document.getElementById("saveProfile").hidden = false;
}

const myForm = document.getElementById("profile_edit-form");
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
        let initialBirthDate = document.getElementById("dateText").value;

      if (birthDateInput.value.trim().length === 0) {
        birthDateInput.setCustomValidity('Birthdate must be provided');
        birthDateInput.checkValidity();
      } else {
        let today = new Date();
        let years = today.getFullYear() - birthDateInput.value.getFullYear();
        let months = today.getMonth() - birthDateInput.value.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < birthDateInput.value.getDate())) {
            years--;
        }
        if (years < 13) {
            birthDateInput.setCustomValidity('user\'s birthdate is below 13 years of age');        }
            birthDateInput = initialBirthDate;
        if (years > 120) {
            birthDateInput.setCustomValidity('user\'s birthdate is above 120 years of age');
            birthDateInput = initialBirthDate;
        }
        birthDateInput.setCustomValidity('');
      }
    } else {
      birthDateInput.setCustomValidity('');
    }
  });

if (myForm) {
myForm.addEventListener('submit', (event) => {
    //make sure all fields still have required property
    emailInput.required = 'true';
    passwordInput.required = 'true';
    firstNameInput.required = 'true';
    lastNameInput.required = 'true';
    birthDateInput.required = 'true';

    if (myForm.checkValidity() === false) {
    event.preventDefault();
    event.stopPropagation();
    }

    myForm.classList.add('was-validated');
});
} 