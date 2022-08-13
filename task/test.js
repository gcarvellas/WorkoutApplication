const data = require('../data');
const validation = data.validation;
const workoutLogs = data.workoutLogs;
const workout = data.workouts;
const exercise = data.exercises;
const { v4 : uuidv4} = require('uuid');
const { workoutSearch } = require('../data');

const UUID = uuidv4();

const DATE = new Date();

const USER_INFO_OBJECT = {
    firstName: "    Bob",
    lastName: "     Smith",
    birthDate: new Date('1995-12-17T03:24:00'),
    bio: "      this is a test bio",
    weight: 160,
    height: 72,
    frequencyOfWorkingOut: 3
};

const USER_OBJECT = {
    _id: UUID,
    userInfo: USER_INFO_OBJECT,
    email: "   test123@gmail.com",
    hashedPassword: "     TESTHASH$@!)SHF)AH*SHA)*",
    userMadeWorkouts: [UUID, UUID],
    userLikedWorkouts: [UUID, UUID],
    totalLikesReceived: 0,
    totalCommentsReceived: 0,
    workoutLogs: [UUID, UUID]
};

const WORKOUT_EXERCISES = {
    exerciseId: UUID,
    sets: 2,
    repetitions: 10,
    rest: 60,
    weight: 24.5,
    comment: UUID
}

const WORKOUT_OBJECT = {
    _id: UUID,
    name: "  Test Name  ",
    author: UUID,
    intensity: 4,
    length: 34,
    exercises: [WORKOUT_EXERCISES],
    comments: [UUID, UUID],
    usersLiked: [UUID, UUID]
};

const LOG_INFO = {
    date: DATE,
    intensity: 3,
    length: 54,
    exercises: [WORKOUT_EXERCISES],
    comment: " Test comment"
}

const EXERCISE_OBJECT = {
    _id: UUID,
    user: UUID,
    name: " Test exercise name",
    muscles: ["chest"],
    equipment: ["kettlebells"],
    note: "Test note"
};



//validation tests
function testUserValidation() {
    //valid userObject test
    try {
        console.log(validation.verifyUser(USER_OBJECT));
        console.log("Verified user!");
    } catch (e) {
        console.log('failed to verify user object, error:', e);
    } 
};

function testVerifyNumber() {
    //should fail
    try {
        console.log(validation.verifyNumber('apple'))
        console.log('failed to verifyNumber, error:', e);
    } catch (e) {
        console.log('test 1 passed on verifyNumber');
    }
    //should fail
    try {
        console.log(validation.verifyNumber(34.5, 'second test', 'int'));
        console.log('failed to verifyNumber, error:', e);
    } catch (e) {
        console.log('test 2 passed on verifyNumber');
    }
    //should fail
    try {
        console.log(validation.verifyNumber(4, 'third test', 'int', 5));
        console.log('failed to verifyNumber, error:', e);
    } catch (e) {
        console.log('test 3 passed on verifyNumber');
    }
    //should fail
    try {
        console.log(validation.verifyNumber(24, 'fourth test', 'int', 5, 23));
        console.log('failed to verifyNumber, error:', e);
    } catch (e) {
        console.log('test 4 passed on verifyNumber');
    }

    //should pass
    try {
        console.log(validation.verifyNumber(16.4, 'fifth test', undefined, 5, 23));
        console.log('test 5 passed on verifyNumber');
    } catch (e) {
        console.log('failed to verifyNumber, error:', e);
    }
    //should pass
    try {
        console.log(validation.verifyNumber(5, 'sixth test', 'int', 5, 23));
        console.log('test 6 passed on verifyNumber');
    } catch (e) {
        console.log('failed to verifyNumber, error:', e);
    }
    //should pass
    try {
        console.log(validation.verifyNumber(23, 'seventh test', 'int', 5, 23));
        console.log('test 7 passed on verifyNumber');
    } catch (e) {
        console.log('failed to verifyNumber, error:', e);
    }
}

//workoutLogsDB tests
async function testCreateWorkoutLogFromWorkout() {
    //valid userObject, parentWorkout, and logInfo test
    try {
        console.log(await workoutLogs.createWorkoutLogFromWorkout(USER_OBJECT, WORKOUT_OBJECT, LOG_INFO))
    } catch (e) {
        console.log('failed to createWorkoutLogFromWorkout, error:', e);
    }
};

function testEditWorkoutLog() {
    //valid userObject, workoutLogId, and logInfo test
    try {
        console.log(workoutLogs.editWorkoutLog(USER_OBJECT, UUID, LOG_INFO));
    } catch (e) {
        console.log('failed to editEditWorkoutLog, error:', e);
    }
}

function testCopyWorkoutLog() {
    //valid userObject, workoutLogId test
    try {
        console.log(workoutLogs.copyWorkoutLog(USER_OBJECT, UUID));
    } catch (e) {
        console.log('failed to copyWorkoutLog, error:', e);
    }
}

function testDeleteWorkoutLog() {
    //valid userObject, workoutLogId test
    try {
        console.log(workoutLogs.deleteWorkoutLog(USER_OBJECT, UUID));
    } catch (e) {
        console.log('failed to deleteWorkoutLog, error:', e);
    }
}

function testGetWorkoutLog() {
    //valid userObject, workoutLogId test
    try {
        console.log(workoutLogs.getWorkoutLog(USER_OBJECT, UUID));
    } catch (e) {
        console.log('failed to getWorkoutLog, error:', e);
    }
}

async function testExercise() {
    // valid _id, name, muscles
    try {
        console.log("-----EXERCISE TEST START-----");
        console.log(validation.verifyExercise(EXERCISE_OBJECT));
        console.log('Verified Exercise Object!');

        let newExercise = await exercise.createExercise(EXERCISE_OBJECT.user, EXERCISE_OBJECT.name, EXERCISE_OBJECT.muscles, undefined, undefined);
        console.log("Created new exercise:");
        console.log(newExercise);

        console.log("Get all exercises:");
        console.log(await exercise.getAllExercise());

        let exerciseFound = await exercise.getExercise(newExercise._id);
        console.log("Obtained exercise by _id:");
        console.log(exerciseFound);

        console.log(`Updating exercise with _id: ${exerciseFound._id}`);
        console.log(await exercise.editExercise(exerciseFound._id, "Test updated exercise name", EXERCISE_OBJECT.muscles, undefined, undefined));

        await exercise.deleteExercise(exerciseFound._id);
        console.log(`Deleted exercise with _id: ${exerciseFound._id}`);
    } catch (e) {
        console.log('failure in testExercise(), error:', e);
    } finally {
        console.log("-----EXERCISE TEST END-----");
    }
}

async function testWorkoutSearch() {
    try {
        console.log("-----WORKOUT SEARCH TEST START-----");

        let newExercise = await exercise.createExercise(EXERCISE_OBJECT.user, EXERCISE_OBJECT.name, EXERCISE_OBJECT.muscles, undefined, undefined);
        console.log(`Added exercise to test workout search with _id of ${EXERCISE_OBJECT._id}`);

        let TEST_WORKOUT_OBJECT = WORKOUT_OBJECT;
        TEST_WORKOUT_OBJECT.exercises = [{
            exerciseId: newExercise._id,
            sets: WORKOUT_EXERCISES.sets,
            repetitions: WORKOUT_EXERCISES.repetitions,
            rest: WORKOUT_EXERCISES.rest
        }];
        
        await workout.createWorkout(USER_OBJECT, TEST_WORKOUT_OBJECT.name, TEST_WORKOUT_OBJECT.intensity, TEST_WORKOUT_OBJECT.length, TEST_WORKOUT_OBJECT.exercises);
        console.log(`Added workout to test workout search with _id of ${TEST_WORKOUT_OBJECT._id}`);

        console.log(`Searching workouts by most popular:`);
        console.log(await workoutSearch.getMostPopularWorkouts(2));

        console.log(`Searching workouts by author where the author is "${TEST_WORKOUT_OBJECT.author}"`);
        console.log(await workoutSearch.getWorkoutsByAuthor(TEST_WORKOUT_OBJECT.author, 2));

        console.log(`Searching workouts by name where the name is "${TEST_WORKOUT_OBJECT.name}"`);
        console.log(await workoutSearch.getWorkoutsByName(TEST_WORKOUT_OBJECT.name, 2));

        console.log(`Searching workouts by muscle group where the muscle group is "chest"`);
        console.log(await workoutSearch.getWorkoutsByMuscleGroup("chest", 2));

        await exercise.deleteExercise(newExercise._id);
        await workout.deleteWorkout(USER_OBJECT, TEST_WORKOUT_OBJECT._id);
    } catch (e) {
        console.log('failure in testWorkoutSearch(), error:', e);
    } finally {
        console.log("-----WORKOUT SEARCH TEST END-----");
    }
}

//running validation tests
//testUserValidation();
//testVerifyNumber();

//running workoutLogDB tests
// testCreateWorkoutLogFromWorkout();
// testEditWorkoutLog();
// testCopyWorkoutLog();
// testDeleteWorkoutLog();
// testGetWorkoutLog();

//running exercise test
// testExercise();

//running workoutSearch test
// testWorkoutSearch();