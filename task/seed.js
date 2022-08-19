const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const validation = data.validation;
const users = data.users;
const workoutLogs = data.workoutLogs;
const workout = data.workouts;
const exercise = data.exercises;
const commentData = data.comments;
const DATE = new Date();

async function main() {
    const db = await dbConnection.dbConnection();
    await db.dropDatabase();

    const USER_EMAIL = "test1@test.com";
    const USER_PASSWORD = "test1234567";

    const SECOND_USER_EMAIL = "test2@test.com";
    const SECOND_USER_PASSWORD = "test1234567";

    const THIRD_USER_EMAIL = "test3@test.com";
    const THIRD_USER_PASSWORD = "test1234567";

    let user1 = await users.createUser(USER_EMAIL, USER_PASSWORD, "test", "test", new Date("December 17, 1995 03:24:00"), "test bio", 120, 70, 5);
    let user2 = await users.createUser(SECOND_USER_EMAIL, SECOND_USER_PASSWORD, "test", "test", new Date("December 17, 1995 03:24:00"), "test bio", 120, 70, 5);
    let user3 = await users.createUser(THIRD_USER_EMAIL, THIRD_USER_PASSWORD, "test", "test", new Date("December 17, 1995 03:24:00"), "test bio", 120, 70, 5);
    for (var i=0; i<3; i++) {
        await users.incrementTotalLikes(user1._id);
        await users.incrementTotalCommentsReceived(user1._id);
    }

    // let exercise1 = await exercise.createExercise(user1, USER_PASSWORD, "Test Exercise 1", ["chest", "back"], ["treadmill"], "Test Exercise #1");
    // let exercise2 = await exercise.createExercise(user1, USER_PASSWORD, "Test Exercise 2", ["legs", "shoulders"], ["bicycle"], "Test Exercise #2");
    // let exercise3 = await exercise.createExercise(user1, USER_PASSWORD, "Test Exercise 3", ["arms", "abs"], ["rack"], "Test Exercise #3");
    // let exercises = [exercise1, exercise2, exercise3];
    // let subExercises = [];
    // convertExerciseToSubExercise = (exerciseId) => {return {exerciseId: exerciseId, sets: 2, repetitions: 10, rest: 60, weight: 30, comment: "sanity test"}};
    // for (const myExercise of exercises){
    //     subExercises.push(convertExerciseToSubExercise(myExercise._id));
    // }
    // let workout = await workouts.createWorkout(user, USER_PASSWORD, "Test Workout", 3, 30, subExercises);
    // await workouts.addLikeToWorkout(user2, SECOND_USER_PASSWORD, workout._id);

    // let LOG_INFO = {
    //     date: new Date("December 17, 1995 03:24:00"),
    //     intensity: 3,
    //     length: 65,
    //     exercises: [{
    //         exerciseId: exerciseId,
    //         sets: 2,
    //         repetitions: 10,
    //         rest: 60,
    //         weight: 30,
    //         comment: "Felt weak"
    //     }],
    //     comment: "I like this!"
    // }

    // let workoutLog = await workoutLogs.createWorkoutLogFromWorkout(user1, USER_PASSWORD, workout, LOG_INFO);
    // let workoutLog2 = await workoutLogs.copyWorkoutLog(user, USER_PASSWORD, workoutLog._id);

    console.log('Done seeding database');
    await dbConnection.closeConnection();
}

main().catch((error) => {
    console.error(error);
    return dbConnection.dbConnection().then((db) => {
        return dbConnection.closeConnection();
    });
});
