//log creation elements
const logButton = document.getElementById('logButton');
const deleteLogButton = document.getElementById('deleteLogButton');

//workout log input elements
const inputIntensity = document.getElementById('inputIntensity');
const inputLength = document.getElementById('inputLength');
const inputDate = document.getElementById('inputDate');
const inputComment = document.getElementById('inputComment');


//functions for validating all inputs of workout log
inputIntensity.addEventListener('input', () => {
  if (inputIntensity.value) {
    if (parseInt(inputIntensity.value) >= 0 && parseInt(inputIntensity.value) <= 5) {
      inputIntensity.setCustomValidity('');
    } else {
      inputIntensity.setCustomValidity('Intensity must be in range [0, 5]');
      inputIntensity.checkValidity();
    }
  } else {
    inputIntensity.setCustomValidity('');
  }
});

inputLength.addEventListener('input', () => {
  if (inputLength.value) {
    if (parseInt(inputLength.value) >= 0 && parseInt(inputLength.value) <= 240) {
      inputLength.setCustomValidity('');
    } else {
      inputLength.setCustomValidity('Length must be in range [0, 240]');
      inputLength.checkValidity();
    }
  } else {
    inputLength.setCustomValidity('');
  }
});

inputComment.addEventListener('input', () => {
  if (inputComment.value) {
    if (inputComment.value.trim().length !== 0) {
      inputComment.setCustomValidity('');
    } else {
      inputComment.setCustomValidity('If provided, comment must be non-empty string');
      inputComment.checkValidity();
    }
  } else {
    inputComment.setCustomValidity('');
  }
});


//functions for validating all inputs of exercises
function validateInputs(inputElems) {
  let elems = []
  
  for (let elem of inputElems) {
    // console.log(elem.id);
    let item = {}

    if (elem.id === 'inputIntensity') {
      elem.required = 'true';
      item[elem.id] = elem.value;
      elems.push(item)
    }
    if (elem.id === 'inputLength') {
      elem.required = 'true';
      item[elem.id] = elem.value;
      elems.push(item)
    }
    if (elem.id === 'inputDate') {
      elem.required = 'true';
      item[elem.id] = elem.value;
      elems.push(item)
    }
    if (elem.id === 'inputComment') {
      item[elem.id] = elem.value;
      elems.push(item)
    }

    if (elem.id === 'inputExerciseSet') {
      elem.required = 'true';
      item[elem.id] = elem.value;
      item["exerciseid"] = $(elem).data('exerciseid')
      console.log("set item:", item)
      elems.push(item)
    }
    if (elem.id === 'inputExerciseReps') {
      elem.required = 'true';
      item[elem.id] = elem.value;
      elems.push(item)
    }
    if (elem.id === 'inputExerciseRest') {
      elem.required = 'true';
      item[elem.id] = elem.value;
      elems.push(item)
    }
    if (elem.id === 'inputExerciseWeight') {
      item[elem.id] = elem.value;
      elems.push(item)
    }
    if (elem.id === 'inputExerciseNote') {
      item[elem.id] = elem.value;
      elems.push(item)
    }
  }
  return elems;
}

//function for setting the listeners and input validators for exercises in the workout log
function setExerciseListeners(exercise) {
  exercise.find('#removeExerciseButton').on('click', (event) => {
    //if someone wants to remove an exercise from a workout log
    exercise.remove();
  });

  //set verification
  exercise.find('[id^="inputExerciseSet"]').on('input', (event) => {
    //if someone is editing set, bounds [1, 500]
    let elem = event.target;
    if (elem.value) {
      if (parseInt(elem.value) >= 1 && parseInt(elem.value) <= 500) {
        elem.setCustomValidity('');
      } else {
        elem.setCustomValidity('Set must be in range [1, 500]');
        elem.checkValidity();
      }
    } else {
      elem.setCustomValidity('');
    }
  });
  
  //rep verification
  exercise.find('[id^="inputExerciseReps"]').on('input', (event) => {
    //if someone is editing rep, bounds [1, 500]
    let elem = event.target;
    if (elem.value) {
      if (parseInt(elem.value) >= 1 && parseInt(elem.value) <= 500) {
        elem.setCustomValidity('');
      } else {
        elem.setCustomValidity('Rep must be in range [1, 500]');
        elem.checkValidity();
      }
    } else {
      elem.setCustomValidity('');
    }
  });

  //rest verification
  exercise.find('[id^="inputExerciseRest"]').on('input', (event) => {
    //if someone is editing rest, bounds [0, 500]
    let elem = event.target;
    if (elem.value) {
      if (parseInt(elem.value) >= 0 && parseInt(elem.value) <= 500) {
        elem.setCustomValidity('');
      } else {
        elem.setCustomValidity('Rest must be in range [0, 500]');
        elem.checkValidity();
      }
    } else {
      elem.setCustomValidity('');
    }
  });

  //weight verification
  exercise.find('[id^="inputExerciseWeight"]').on('input', (event) => {
    //if someone is editing weight, bounds [0, 500]
    let elem = event.target;
    if (elem.value) {
      if (parseInt(elem.value) >= 0 && parseInt(elem.value) <= 500) {
        elem.setCustomValidity('');
      } else {
        elem.setCustomValidity('Weight must be in range [0, 500] if specified');
        elem.checkValidity();
      }
    } else {
      elem.setCustomValidity('');
    }
  });

  //note verification
  exercise.find('[id^="inputExerciseNote"]').on('input', (event) => {
    //if someone is editing note, if something, can't be empty string
    let elem = event.target;
    if (elem.value) {
      if (elem.value.trim().length !== 0) {
        elem.setCustomValidity('');
      } else {
        elem.setCustomValidity('Note must be non-empty string if specified');
        elem.checkValidity();
      }
    } else {
      elem.setCustomValidity('');
    }
  });
}

//function for setting the listeners for exercises in the exercise search
function searchResultListener(event) {
  try {
    event.preventDefault();
    let curElem = event.target;
    addToExerciseList(curElem);
  } catch (e) {
    console.log('dang', e);
  }
}

function addToExerciseList(exercise) {

  let exerciseHTML = `
  <div class="card mb-2" id="workoutlog-exerice-added">
  <div class="card-body">
    <div class="card-title d-flex flex-row justify-content-between">
      <h4 class="">${exercise.textContent}</h4>
      <button id="removeExerciseButton" class="btn btn-outline-danger">Remove Exercise</button>
    </div>

    <form id="form-workoutlog-exerice" class="form-workoutlog-exerice needs-validation" novalidate>
      <div class="form-group row">
        <label for="inputExerciseSet" class="col-sm-4 col-form-label">Sets</label>
        <div class="col-sm-8">
          <input id="inputExerciseSet" name="inputExerciseSet" type="number" class="form-control" id="inputExerciseSet" placeholder="Sets" required>
          <div class="invalid-feedback">
            Exercise set count must be provided and between 1 and 500
          </div>
        </div>

      </div>

      <div class="form-group row">
        <label for="inputExerciseReps" class="col-sm-4 col-form-label">Reps</label>
        <div class="col-sm-8">
          <input id="inputExerciseReps" name="inputExerciseReps" type="number" class="form-control" id="inputExerciseReps" placeholder="Repetitions" required>
          <div class="invalid-feedback">
            Exercise repetition count must be provided and between 1 and 500
          </div>
          </div>

      </div>

      <div class="form-group row">
        <label for="inputExerciseRest" class="col-sm-4 col-form-label">Rest</label>
        <div class="col-sm-8">
          <input id="inputExerciseRest" name="inputExerciseRest" type="number" class="form-control" id="inputExerciseRest" placeholder="Rest" required>
          <div class="invalid-feedback">
            Exercise rest must be provided and between 0 and 500
          </div>
          </div>

      </div>

      <div class="form-group row">
        <label for="inputExerciseWeight" class="col-sm-4 col-form-label">Weight</label>
        <div class="col-sm-8">
          <input id="inputExerciseWeight" name="inputExerciseWeight" type="number" class="form-control" id="inputExerciseWeight" placeholder="Weight">
          <div class="invalid-feedback">
            If provided, weight must be between 0 and 500
          </div>
          </div>
      </div>

      <div class="form-group row">
        <label for="inputExerciseNote" class="col-sm-4 col-form-label">Note</label>
        <div class="col-sm-8">
          <input id="inputExerciseNote" name="inputExerciseNote" type="text" class="form-control" id="inputExerciseNote" placeholder="Note">
          <div class="invalid-feedback">
            If provided, note cannot be empty or just spaces
          </div>
        </div>
      </div>
    </form>
  </div>
</div>
    `;

  exerciseNew = $.parseHTML(exerciseHTML);

  setExerciseListeners($(exerciseNew));

  let exerciseList = $('#loggedExercises');
  exerciseList.append(exerciseNew);
}

(function ($) {

  logButton.addEventListener('click', (event) => {

    inputElems = document.querySelectorAll(`[id^="input"]`);
    //make sure all inputs are valid
    let requestElems = validateInputs(inputElems);
    //make sure the workout fields are still required
    inputIntensity.required = 'true';
    inputLength.required = 'true';
    inputDate.required = 'true';

    //get all forms that need validation
    let formsToValidate = document.getElementsByClassName('needs-validation');
    //console.log(formsToValidate);
    let formsAreValid = true;
    $(formsToValidate).each((i, form) => {
      if (form.checkValidity() === false) {
        formsAreValid = false;
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    })

    if (formsAreValid) {
      //parse workoutId from url
      let url = window.location.pathname;
      let parsedUrl = url.split('/');
      //make a post request
      try {
        let requestConfig = {
          method: "POST",
          url: `/workout/${parsedUrl[2]}/log`,
          dataType: "json",
          data: {requestElems},
          success: function(msg) {
            window.location.href=`/workout/${parsedUrl[2]}`;
          },
          error: function(msg) {
            console.log("HERE:", msg);
            //msg.responseJSON is where the errors will go
            let errors = msg.responseJSON.errors;

            for (let error of errors) {
              let errorHTML = `
              <div class="container text-center errorContainer">
                <div class="alert alert-danger alert-dismissible row" role="alert">
                  <div>${error}</div>
                  <button type="button" class="close errorBtn" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
              </div>
              `;
              $("#errorPlaceholder").append(errorHTML);
            }
          }
        }
        $.ajax(requestConfig);
      } catch (e) {
        console.log("shit2", e);
      }
    }
  
    
  });



  //exercises in workout log elements
  let exerciseList = $('#loggedExercises');

  //look for exercise input
  let exerciseInput = $('#addExerciseInput');
  
  //look for exerciseList container
  let exerciseListContainer = $('#exerciseList-container');

  exerciseInput.on('input', async (event) => {
    //when someone types something in exercise input box
    try {
      let requestConfig = {
        method: "GET",
        url: "/exercise/exercisesByName",
        dataType: "json",
        data: {input: exerciseInput.val(), limit:5}
      }

      //get exercises for the exercise input 
      $.ajax(requestConfig).then((res) => {
        //empty the current link
        exerciseListContainer.empty();
        //loop over all the exercises returned from the input
        for (const exercise of res.exercises) {
          let exerciseElement = document.createElement("a");
          exerciseElement.classList.add('list-group-item');
          exerciseElement.href = `/exercise/${exercise._id}`;
          exerciseElement.textContent = exercise.name;
          exerciseElement.addEventListener('click', searchResultListener);
          exerciseListContainer.append(exerciseElement);
        }

      }).catch((err) => {
        //somehow silence error that is in console
      });

    } catch (e) {
      console.log("shit");
    }
  });

  //loop through all children of exerciseList (these are exercises in the logged workout)
  exerciseList.children().each(function (index, element) {
    setExerciseListeners($(element));
  })

})(window.jQuery);