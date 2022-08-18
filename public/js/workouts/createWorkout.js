const ADD_EXERCISE_BUTTON_CLICKED = false; //TODO add error handling for all of these functions
const exerciseSearchResults = document.getElementById("exerciseSearchResults");
const exerciseList = document.getElementById("exerciseList");
const SUB_EXERCISE_DATA = ["sets", "repetitions", "rest", "weight", "note"];

function createExerciseListElement(exerciseId, parent){
    var insertElement = document.createElement("li");
    insertElement.classList.add('exercise');
    insertElement.id = exerciseId;

    var a = document.createElement("a");
    a.textContent = exerciseId;
    a.href = `exercise/${exerciseId}`;

    for (const subExercise of SUB_EXERCISE_DATA){
        var section = document.createElement("section"); //TODO need to work on this
        var input = document.createElement("input");
        var label = document.createElement("label");
        var subExerciseId = `${exerciseId}_${subExercise}`;
        label.for = subExerciseId;
        label.name = subExerciseId;
        label.id = subExerciseId;
        label.textContent = subExercise;

        section.appendChild(input);
        section.appendChild(label);
    }
    

    insertElement.appendChild(a);
    exerciseList.appendElement(insertElement);
}

function searchResultListener(event){
    event.preventDefault();
    var curElement = event.target;
    document.removeChild(curElement);

    createExerciseListElement(curElement.textContent, exerciseList);
}

function searchListener(){
    requestConfig = {
        method: "GET",
        url: "/exercise/exercisesByName",
        input: exerciseSearchBar.textContent,
        limit: 5
    };
    $.ajax(requestConfig).then(function (result) {
        for(const exercise in result.exercises){
            let exerciseElement = document.createElement("li");
            let exerciseAElement = document.createElement("a");
            exerciseAElement.href = `${exercise._id}`
            exerciseAElement.textContent = exercise.name;
            exerciseAElement.addEventListener('click', searchResultListener);
            exerciseElement.appendChild(exerciseAElement);
            exerciseSearchResults.appendChild(exerciseElement);
        }
    });
}

(function ($) {
    function addExerciseListener(){
        let addExerciseButton = document.getElementById("addExercise");
        let exerciseSearchBar = document.getElementById("exerciseSearchBar");
        addExerciseButton.addEventListener('click', async function() {
            if (ADD_EXERCISE_BUTTON_CLICKED) return;
            exerciseSearchBar.classList.remove('hidden');
            exerciseSearchBar.addEventListener('keyup', searchListener);
            ADD_EXERCISE_BUTTON_CLICKED = true;
        });
    }
    addExerciseListener();
})(window.jQuery);