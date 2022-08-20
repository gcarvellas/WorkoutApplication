const workoutDates = document.getElementsByClassName('workoutDate');

function renderWorkoutDates(){
    for (const workoutDate of workoutDates){
        workoutDate.textContent = new Date(parseInt(workoutDate.textContent)).toLocaleString();
    }
}

renderWorkoutDates();