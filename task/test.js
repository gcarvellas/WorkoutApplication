const data = require('../data');
const validation = data.validation;
const workoutLogs = data.workoutLogs;
const { v4 : uuidv4} = require('uuid');

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
        console.log(validation.verifyNumber(4), 'third test', 'int', 5);
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
        console.log(validation.verifyNumber(16.4, 'fifth test', 'undefined', 5, 23));
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
function testCreateWorkoutLogFromWorkout() {
    //valid userObject, parentWorkout, and logInfo test
    try {
        console.log(workoutLogs.createWorkoutLogFromWorkout(USER_OBJECT, WORKOUT_OBJECT, LOG_INFO))
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

//running validation tests
testUserValidation();

//running workoutLogDB tests
// testCreateWorkoutLogFromWorkout();
// testEditWorkoutLog();
// testCopyWorkoutLog();
// testDeleteWorkoutLog();
// testGetWorkoutLog();