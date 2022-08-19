const workoutLogs = document.getElementsByClassName('log');

function renderWorkoutLogDates(){
    for(const log of workoutLogs){
        log.textContent = `Log: ${new Date(log.textContent).toLocaleString()}`;
    }
}

renderWorkoutLogDates();