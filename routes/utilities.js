const data = require('../data');
const validation = data.validation;
const users = data.users;
const exercises = data.exercises;

async function getAuthUsernameAndPasswordFromSession(req){
    const userId = validation.verifyUUID(req.session.user, "User ID");
    let user = await users.getUser(userId);
    const password = validation.verifyPassword(req.session.password);
    user = await users.checkUser(user.email, password);
    return [user, password];
}

async function parseExerciseForm(req) {
    let name, note;
    let muscles = [];
    let equipment = [];

    for (const [key, val] of Object.entries(req.body)) {
        if (key === "exercise-title") {
            name = val;
        }

        if(key === "muscle-group"){
            if(val !== '') {
                if(typeof val === 'string'){
                    muscles.push(val);
                } else {
                    muscles = val;
                }
            }
        } else if(key === "exercise-equipment"){
            if(val !== '') {
                if(typeof val === 'string'){
                    equipment.push(val);
                } else {
                    equipment = val;
                }
            }
        } else if (key === "exercise-note") {
            if(val !== '') {
                note = val;
            }
        }
    }

    name = validation.verifyMessage(name, 'Provided value of name');
    muscles = validation.verifyMuscleGroups(muscles, 'Provided list of muscle groups');

    if(note){
        note = validation.verifyMessage(note, 'Provided value of note');
    }
    
    if(equipment.length !== 0){
        equipment = validation.verifyEquipment(equipment, 'Provided list of equipment');
    }
    
    return [name, muscles, note, equipment];
}

async function parseWorkoutForm(req){
    let intensity,length,workoutName;
    let exercises = [];
    const ID_REGEX = "(.*)_([a-z]*)";
    for (const [key, val] of Object.entries(req.body)){
        const result = key.match(ID_REGEX);
        if (key === "intensity") {
            intensity = parseInt(val);
        }
        else if (key === "length") { 
            length = parseInt(val);
        }
        else if (key === 'workoutName') {
            workoutName = val;
        }
        else if (key.match(ID_REGEX)){
            let exerciseId = result[1];
            let subExerciseKey = result[2];
            let exerciseFound = false;
            for (let i=0; i<exercises.length; i++){
                if (exercises[i].exerciseId === exerciseId){
                    exerciseFound = true;
                    if (subExerciseKey !== "comment"){
                        exercises[i][subExerciseKey] = parseInt(val);
                    } else{
                        exercises[i][subExerciseKey] = val;
                    }
                    break;
                }
            }
            if (!exerciseFound || exercises.length === 0){
                let temp = {};
                if (subExerciseKey !== "comment"){
                    temp[subExerciseKey] = parseInt(val);
                } else{
                    temp[subExerciseKey] = val;
                }
                temp["exerciseId"] = exerciseId;
                exercises.push(temp);
            }
        }
        else{
            throw "Bad request";
        }
    }
    workoutName = validation.verifyWorkoutName(workoutName);
    intensity = validation.verifyWorkoutIntensity(intensity);
    length = validation.verifyWorkoutLength(length);
    exercises = validation.verifySubExercise(exercises);
    return [workoutName, intensity, length, exercises];
}

async function getWorkoutEditData(workout){
    let formAction = `/workout/${workout._id}/edit`;
    let submitButtonText = "Edit Workout";

    let exerciseIds = [];

    for(let i=0; i<workout.exercises.length; i++){
        let exerciseData = await exercises.getExercise(workout.exercises[i].exerciseId);
        workout.exercises[i].name = exerciseData.name;
        exerciseIds.push(workout.exercises[i].exerciseId);
    }

    let exerciseIdString = exerciseIds.toString().replace(",", "").replace("[", "").replace("]", "").trim();

    return [formAction, submitButtonText, exerciseIdString];
}

function getWorkoutCreateData(){
    let formAction = "/workout/create";
    let submitButtonText = "Create Workout";
    let exerciseIdString = "";
    let emptyWorkout = {
        _id:  undefined,
        name:  undefined,
        author:  undefined,
        intensity: undefined,
        length: undefined,
        exercises: [],
        comments: [],
        usersLiked: []
    }
    return [formAction, submitButtonText, exerciseIdString, emptyWorkout];
}

module.exports = {getAuthUsernameAndPasswordFromSession, parseWorkoutForm, getWorkoutEditData, getWorkoutCreateData, parseExerciseForm};