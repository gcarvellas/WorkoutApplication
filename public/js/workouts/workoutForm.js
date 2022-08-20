let ADD_EXERCISE_BUTTON_CLICKED = false; //TODO add error handling for all of these functions
const exerciseSearchResults = document.getElementById("exerciseSearchResults");
const exerciseList = document.getElementById("exerciseList");
const SUB_EXERCISE_DATA = ["sets", "repetitions", "rest", "weight", "comment"];
const exerciseSearchBar = document.getElementById("exerciseSearchBar");
const exercisesHiddenInput = document.getElementById("exercises");
const deleteExerciseButtons = document.getElementsByClassName("deleteExercise");

function getExerciseIdFromURL(url){
    const REGEX = `\/exercise\/(.*)`;
    return url.match(REGEX)[1];
}

function setError(message){
    let errorElement = document.getElementById("error");
    errorElement.classList.remove("hidden");
    errorElement.classList.add('error');
    errorElement.textContent = message;
}

function deleteExerciseEvent(event){
    let exerciseId = getExerciseIdFromURL(event.target.parentNode.querySelector(".exerciseName").href);
    let test = event.target.parentNode;
    event.target.parentNode.remove();
    exercisesHiddenInput.classList.remove(exerciseId);
}

function createExerciseListElement(exerciseName, exerciseId, toRemoveElement){
    exerciseId = getExerciseIdFromURL(exerciseId);
    var insertElement = document.createElement("li");
    insertElement.classList.add('exercise');

    var h2 = document.createElement("h2");
    var a = document.createElement("a");
    a.classList.add("exerciseName");
    a.textContent = exerciseName;
    a.href = `/exercise/${exerciseId}`;

    var deleteButton = document.createElement('button');
    deleteButton.type = 'click';
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add("deleteExercise");
    deleteButton.addEventListener('click', deleteExerciseEvent);

    exerciseList.appendChild(insertElement);
    insertElement.appendChild(h2);
    insertElement.appendChild(deleteButton);
    h2.appendChild(a);

    for (const subExercise of SUB_EXERCISE_DATA){
        var exerciseSection = document.createElement("section"); 
        insertElement.appendChild(exerciseSection);
        var exerciseInput = document.createElement("input");
        var exerciseLabel = document.createElement("label");
        var subExerciseId = `${exerciseId}_${subExercise}`;
        exerciseLabel.for = subExercise;
        exerciseLabel.name = subExercise;
        let labelName = subExercise.charAt(0).toUpperCase() + subExercise.substring(1) + ": ";
        exerciseLabel.textContent = labelName;
        
        exerciseInput.id = subExerciseId;
        exerciseInput.name = subExerciseId;

        exerciseSection.appendChild(exerciseLabel);
        exerciseSection.appendChild(exerciseInput);
        
        exerciseInput.classList.add('form-control');
        exerciseInput.classList.add('md-2');
    }
    
    exercisesHiddenInput.classList.add(exerciseId);
    toRemoveElement.remove();

    insertElement.classList.add("card");
    insertElement.classList.add("pb-0");
    insertElement.classList.add("pb-0");
    insertElement.classList.add("px-3");

    deleteButton.style = "width: 200px";
    deleteButton.classList.add("btn");
    deleteButton.classList.add("btn-danger");
}

function searchResultListener(event){
    try{
        event.preventDefault();
        var curElement = event.target;
    
        createExerciseListElement(curElement.textContent, curElement.href, curElement.parentElement);
    } catch (e) {
        setError(e);
    }
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

(function ($) {
    function searchListener(){
        try{
            let requestConfig = {
                method: "GET",
                url: "/exercise/exercisesByName",
                dataType: "json",
                data: {input: exerciseSearchBar.value, limit: 5},
                error: function(xhr, ajaxOptions, thrownError) {setError(xhr.responseJSON['error'])}
            }
            $.ajax(requestConfig).then(function (result) {
                if ("error" in result) {
                    setError(result.error);
                    return;
                }
                removeAllChildNodes(exerciseSearchResults);
                for(const exercise of result.exercises){
                    if (!exercisesHiddenInput.classList.contains(exercise._id)){
                        let exerciseElement = document.createElement("li");
                        let exerciseAElement = document.createElement("a");
                        exerciseAElement.href = `/exercise/${exercise._id}`
                        exerciseAElement.textContent = exercise.name;
                        exerciseAElement.addEventListener('click', searchResultListener);
                        exerciseElement.appendChild(exerciseAElement);
                        exerciseSearchResults.appendChild(exerciseElement);
                        exerciseElement.classList.add("row");
                    }
                }
            });
        }
        catch (e) {
            setError(e);
        }
    }
    function addExerciseListener(){
        try{
            let addExerciseButton = document.getElementById("addExercise");
            addExerciseButton.addEventListener('click', async function() {
                try{
                    if (ADD_EXERCISE_BUTTON_CLICKED) return;
                    exerciseSearchBar.classList.remove('hidden');
                    exerciseSearchBar.classList.add("form-control");
                    exerciseSearchBar.addEventListener('keyup', searchListener);
                    ADD_EXERCISE_BUTTON_CLICKED = true;
                } catch (e) {
                    setError(e);
                }
            });
        } catch (e) {
            setError(e);
        }
    }
    addExerciseListener();
    for(const button of deleteExerciseButtons){
        button.addEventListener('click', deleteExerciseEvent);
    }
})(window.jQuery);