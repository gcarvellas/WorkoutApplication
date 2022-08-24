const data = require('../data');
const validation = data.validation;
const workoutLogs = data.workoutLogs;
const workout = data.workouts;
const exercise = data.exercises;
const users = data.users;
const commentData = data.comments;
const { v4 : uuidv4} = require('uuid');
const mongoCollections = require("../config/mongoCollections");
const workouts = data.workouts;
const { workoutSearch } = require('../data');
const { verifyUser } = require('../data/validation');
const assert = require('assert');
const { comments } = require('../config/mongoCollections');

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
    hashedPassword: "$2a$10$gSjufo8eFSCPkpV9QdkQQ.MMJp2ERAvQ.YrO4dznOZaNTANLtlYte",
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

function objectEquals(x, y) {
    'use strict';

    if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
    // after this just checking type of one would be enough
    if (x.constructor !== y.constructor) { return false; }
    // if they are functions, they should exactly refer to same one (because of closures)
    if (x instanceof Function) { return x === y; }
    // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
    if (x instanceof RegExp) { return x === y; }
    if (x === y || x.valueOf() === y.valueOf()) { return true; }
    if (Array.isArray(x) && x.length !== y.length) { return false; }

    // if they are dates, they must had equal valueOf
    if (x instanceof Date) { return false; }

    // if they are strictly equal, they both need to be object at least
    if (!(x instanceof Object)) { return false; }
    if (!(y instanceof Object)) { return false; }

    // recursive object equality check
    var p = Object.keys(x);
    return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) &&
        p.every(function (i) { return objectEquals(x[i], y[i]); });
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

//running validation tests
//testUserValidation();
//testVerifyNumber();

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
    let newUser = null;
    let newExercise = null;
    let newWorkout = null;

    const USER_EMAIL = "dbWorkoutSearch@test.com";
    const USER_PASSWORD = "Test123!";

    try {
        console.log("-----WORKOUT SEARCH TEST START-----");
        newUser = await users.createUser(USER_EMAIL, USER_PASSWORD, "firstName", "lastName", new Date("June 30, 1998"), "testbio", 120, 70, 5);
        console.log(`Added user to test workout search with _id of ${newUser._id}`);

        newExercise = await exercise.createExercise(newUser, USER_PASSWORD, EXERCISE_OBJECT.name, EXERCISE_OBJECT.muscles, undefined, undefined);
        console.log(`Added exercise to test workout search with _id of ${EXERCISE_OBJECT._id}`);

        let TEST_WORKOUT_OBJECT = WORKOUT_OBJECT;
        TEST_WORKOUT_OBJECT.exercises = [{
            exerciseId: newExercise._id,
            sets: WORKOUT_EXERCISES.sets,
            repetitions: WORKOUT_EXERCISES.repetitions,
            rest: WORKOUT_EXERCISES.rest
        }];
        
        newWorkout = await workout.createWorkout(newUser, USER_PASSWORD, TEST_WORKOUT_OBJECT.name, TEST_WORKOUT_OBJECT.intensity, TEST_WORKOUT_OBJECT.length, TEST_WORKOUT_OBJECT.exercises);
        console.log(`Added workout to test workout search with _id of ${TEST_WORKOUT_OBJECT._id}`);

        console.log(`Searching workouts by most popular:`);
        console.log(await workoutSearch.getMostPopularWorkouts(1));

        console.log(`Searching workouts by author where the author is "${TEST_WORKOUT_OBJECT.author}"`);
        console.log(await workoutSearch.getWorkoutsByAuthor(newUser._id, 1));

        console.log(`Searching workouts by name where the name is "${TEST_WORKOUT_OBJECT.name}"`);
        console.log(await workoutSearch.getWorkoutsByName(TEST_WORKOUT_OBJECT.name, 1));

        console.log(`Searching workouts by muscle group where the muscle group is "shoulders"`);
        console.log(await workoutSearch.getWorkoutsByMuscleGroup("shoulders", 1));

    } catch (e) {
        console.log('failure in testWorkoutSearch(), error:', e);
    } finally {
        if(newExercise !== null) {
            await exercise.deleteExercise(newExercise._id);
        }

        if(newWorkout !== null) {
            await workout.deleteWorkout(newUser, USER_PASSWORD, newWorkout._id);
        }

        if(newUser !== null) {
            await users.deleteUser(newUser, USER_PASSWORD, newUser._id);
        }
        
        console.log("-----WORKOUT SEARCH TEST END-----");
    }
}

async function dbSanityTest(){

    const USER_EMAIL = "dbSanityTest@test.com";
    const USER_PASSWORD = "test123456";

    const SECOND_USER_EMAIL = "dbSanityTest2@test.com";
    const SECOND_USER_PASSWORD = "test1234567";

    async function verifyUserFunctions(){
        let user = await users.createUser(USER_EMAIL, USER_PASSWORD, "test", "test", new Date("December 17, 1995 03:24:00"), "test bio", 120, 70, 5);
        console.log("Users: Verified createUser()");
        console.log("Users: Verified checkUser()");

        user = await users.editUser(user._id, user.email, USER_PASSWORD, user.email, USER_PASSWORD, user.userInfo.firstName, user.userInfo.lastName, user.userInfo.birthDate, user.userInfo.bio, 121, user.userInfo.height, user.userInfo.frequencyOfWorkingOut);
        assert(user.userInfo.weight === 121);
        console.log("Users: Verified editUser()");

        user2 = await users.getUser(user._id);
        assert(user2.hashedPassword === null);
        assert(user2.email === user.email);
        console.log("Users: Verified getUser()");

        let incResult = await users.incrementTotalLikes(user._id);
        assert(incResult === 1);
        user = await users.checkUser(user.email, USER_PASSWORD);
        assert(user.totalLikesReceived === 1);
        console.log("Users: Verified incrementTotalLikes()");

        let decResult = await users.decrementTotalLikes(user._id);
        assert(decResult === 0);
        user = await users.checkUser(user.email, USER_PASSWORD);
        assert(user.totalLikesReceived === 0);
        console.log("Users: Verified decrementTotalLikes()");

        incResult = await users.incrementTotalCommentsReceived(user._id);
        assert(incResult === 1);
        user = await users.checkUser(user.email, USER_PASSWORD);
        assert(user.totalCommentsReceived === 1);
        console.log("Users: Verified incrementTotalCommentsReceived()");

        decResult = await users.decrementTotalCommentsReceived(user._id);
        assert(decResult === 0);
        user = await users.checkUser(user.email, USER_PASSWORD);
        assert(user.totalCommentsReceived === 0);
        console.log("Users: Verified decrementTotalCommentsReceived()");

        let workoutLogs = await users.getWorkoutLogs(user._id);
        assert (user.workoutLogs.length === 0 && workoutLogs.length === 0);
        console.log("Users: Verified getWorkoutLogs()");

        return user;
    }
    async function verifyExerciseFunctions(user){
        let exercise1 = await exercise.createExercise(user, USER_PASSWORD, "Test Exercise 1", ["chest", "back"], ["treadmill"], "Sanity Test Exercise #1");
        let exercise2 = await exercise.createExercise(user, USER_PASSWORD, "Test Exercise 2", ["legs", "shoulders"], ["bicycle"], "Sanity Test Exercise #2");
        let exercise3 = await exercise.createExercise(user, USER_PASSWORD, "Test Exercise 3", ["arms", "abs"], ["rack"], "Sanity Test Exercise #3");
        console.log("Exercise: Verified createExercise()");
        console.log("Exercise: Verified getExercise()");
        
        let exercises = await exercise.getAllExercise();
        assert(exercises.length === 3);
        console.log("Exercise: Verified getAllExercise()");

        exercise3 = await exercise.editExercise(user, USER_PASSWORD, exercise3._id, "Test Exercise 3", ["legs"], ["rack"], "Sanity Test Exercise #3");
        assert(exercise3.muscles[0] === "legs");
        console.log("Exercise: Verified editExercise()");

        return [exercise1, exercise2, exercise3];

    }
    async function verifyWorkoutFunctions(user, exercises){
        let subExercises = [];
        convertExerciseToSubExercise = (exerciseId) => {return {exerciseId: exerciseId, sets: 2, repetitions: 10, rest: 60, weight: 30, comment: "sanity test"}};
        for (const myExercise of exercises){
            subExercises.push(convertExerciseToSubExercise(myExercise._id));
        }
        let workout = await workouts.createWorkout(user, USER_PASSWORD, "Test Workout", 3, 30, subExercises);
        user = await users.getUser(user._id);
        assert(user.userMadeWorkouts.length === 1);
        console.log("Workout: Verified createWorkout()");
        console.log("Workout: Verified getWorkout()");

        workout = await workouts.editWorkout(workout._id, user, USER_PASSWORD, "Test Workout Sanity", workout.intensity, workout.length, workout.exercises);
        assert(workout.name === "Test Workout Sanity");
        console.log("Workout: Verified editWorkout()");

        let secondUser = await users.createUser(SECOND_USER_EMAIL, SECOND_USER_PASSWORD, "test", "test", new Date("December 17, 1995 03:24:00"), "test bio", 120, 70, 5);

        let comment = await workouts.addCommentToWorkout(secondUser, SECOND_USER_PASSWORD, workout._id, "Test comment"); //TODO this doesn't work
        user = await users.getUser(user._id);
        workout = await workouts.getWorkout(workout._id);
        assert(workout.comments.length === 1);
        assert(user.totalCommentsReceived === 1);
        console.log("Workout: Verified addCommentToWorkout()");
        console.log("Comments: Verified getComment()");

        await workouts.removeCommentFromWorkout(secondUser, SECOND_USER_PASSWORD, workout._id, comment._id);
        user = await users.getUser(user._id);
        workout = await workouts.getWorkout(workout._id);
        assert(workout.comments.length === 0);
        assert(user.totalCommentsReceived === 0);
        console.log("Workout: Verified removeCommentFromWorkout()");

        let result = await workouts.checkIfUserLikedWorkout(secondUser, workout._id);
        assert(result === false);
        console.log("Workout: Verified checkIfUserLikedWorkout()");

        await workouts.addLikeToWorkout(secondUser, SECOND_USER_PASSWORD, workout._id);
        user = await users.getUser(user._id);
        assert(user.totalLikesReceived === 1);
        secondUser = await users.getUser(secondUser._id);
        assert(secondUser.userLikedWorkouts[0] === workout._id);
        console.log("Workout: Verified addLikeToWorkout()");

        await workouts.removeLikeFromWorkout(secondUser, SECOND_USER_PASSWORD, workout._id);
        user = await users.getUser(user._id);
        assert(user.totalLikesReceived === 0);
        secondUser = await users.getUser(secondUser._id);
        assert(secondUser.userLikedWorkouts.length === 0);
        console.log("Workout: Verified removeLikeFromWorkout()");

        let secondWorkout = await workouts.copyWorkout(user, USER_PASSWORD, workout._id);
        console.log("Workout: Verified copyWorkout()");

        workout = await workouts.getWorkout(workout._id);
        return [workout, secondWorkout];
    }
    async function verifyWorkoutSearchFunctions(workout1, workout2, user){
        let result = await workoutSearch.getWorkoutsByAuthor(user._id);
        assert(result.data.length === 2);
        console.log("Workout Search: Verified getWorkoutsByAuthor()");

        result = await workoutSearch.getWorkoutsByMuscleGroup("legs");
        assert(result.data.length === 1);
        console.log("Workout Search: Verified getWorkoutsByMuscleGroup()")

        result = await workoutSearch.getWorkoutsByName("Test Workout Sanity");
        assert(result.data.length === 2);
        result = await workoutSearch.getWorkoutsByName("Test Workout Sanity_Copy");
        assert(result.data.length === 1);
        console.log("Workout Search: Verified getWorkoutsByName()");

        await workouts.addLikeToWorkout(user, USER_PASSWORD, workout2._id);
        result = await workoutSearch.getMostPopularWorkouts();
        assert(result.data[0]._id === workout2._id);
        assert(result.data[1]._id === workout1._id);
        console.log("Workout Search: Verified getMostPopularWorkouts()");
        await workouts.removeLikeFromWorkout(user, USER_PASSWORD, workout2._id);

    }
    async function verifyComments(comment, workout, user){
        let result = await commentData.getCommentsByWorkoutId(workout._id);
        assert (result.length === 1);
        console.log("Comments: Verified getCommentsByWorkoutId()");

        comment = await commentData.editComment(user, USER_PASSWORD, comment._id, "new test message!");
        comment = await commentData.getComment(comment._id);
        assert(comment.comment === "new test message!");
        console.log("Comments: Verified editComment()");
    }
    async function verifyWorkoutLogs(user, workout, exerciseId){
        let LOG_INFO = {
            date: new Date("December 17, 1995 03:24:00"),
            intensity: 3,
            length: 65,
            exercises: [{
                exerciseId: exerciseId,
                sets: 2,
                repetitions: 10,
                rest: 60,
                weight: 30,
                comment: "Felt weak"
            }],
            comment: "I like this!"
        }

        let workoutLog = await workoutLogs.createWorkoutLogFromWorkout(user, USER_PASSWORD, workout, LOG_INFO);
        console.log("Workout Log: Verified createWorkoutLogFromWorkout()");
        console.log("Workout Log: Verified getWorkoutLog()");

        LOG_INFO.intensity = 4;
        
        workoutLog = await workoutLogs.editWorkoutLog(user, USER_PASSWORD, workoutLog._id, LOG_INFO);
        assert(workoutLog.logInfo.intensity === 4);
        console.log("Workout Log: Verified editWorkoutLog()");

        let workoutLog2 = await workoutLogs.copyWorkoutLog(user, USER_PASSWORD, workoutLog._id);
        user = await users.getUser(user._id);
        assert(user.workoutLogs.length === 2);
        console.log("Workout Log: Verified copyWorkoutLog()");

        return [workoutLog, workoutLog2];
    }

    let user = await verifyUserFunctions();
    let exercises = await verifyExerciseFunctions(user);
    let myWorkouts = await verifyWorkoutFunctions(user, exercises);
    let workout1 = myWorkouts[0];
    let workout2 = myWorkouts[1];
    workout1 = await workouts.editWorkout(workout1._id, user, USER_PASSWORD, "Test Workout Sanity", workout1.intensity, workout1.length, [workout1.exercises[0]]);
    workout2 = await workouts.editWorkout(workout2._id, user, USER_PASSWORD, "Test Workout Sanity_Copy", workout2.intensity, workout2.length, [workout2.exercises[1]]);
    await verifyWorkoutSearchFunctions(workout1, workout2, user);
    let comment = await workouts.addCommentToWorkout(user, USER_PASSWORD, workout1._id, "test comment");
    console.log("Comments: Verified addComment()");
    await verifyComments(comment, workout1, user);
    let myWorkoutLogs = await verifyWorkoutLogs(user, workout1, exercises[0]._id);
    let workoutLog = myWorkoutLogs[0];
    let workoutLog2 = myWorkoutLogs[1];

    //await workoutLogs.deleteWorkoutLog(user, USER_PASSWORD, workoutLog._id);
    //await workoutLogs.deleteWorkoutLog(user, USER_PASSWORD, workoutLog2._id);
    //console.log("Workout Logs: Verified deleteWorkoutLog()");

    await workouts.removeCommentFromWorkout(user, USER_PASSWORD, workout1._id, comment._id);
    console.log("Workouts: Verified removeCommentFromWorkout()");

    // for (const currentExercise of exercises){
    //     await exercise.deleteExercise(currentExercise._id);
    // }
    // console.log("Exercises: Verified deleteExercise()");

    workout1 = await workouts.getWorkout(workout1._id);
    // await workouts.deleteWorkout(user, USER_PASSWORD, workout1._id);
    // console.log("Workouts: Verified deleteWorkout()");

    // await users.deleteUser(user, USER_PASSWORD);
    // let copiedUser = await users.checkUser(SECOND_USER_EMAIL, SECOND_USER_PASSWORD);
    // await users.deleteUser(copiedUser, SECOND_USER_PASSWORD);
    // console.log("Users: Verified deleteUser()");

    console.log("SANITY TEST COMPLETE! SUCCESS!");
}

dbSanityTest();

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