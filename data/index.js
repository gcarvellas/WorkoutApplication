const exerciseData = require('./exercises');
const userData = require('./users');
const workoutData = require('./workouts');
const workoutSearchData = require('./workoutSearch');
const workoutLogData = require('./workoutLogs');
const validation = require('./validation');
const commentData = require('./comments');

module.exports = {
    exercises: exerciseData,
    users: userData,
    workouts: workoutData,
    workoutSearch: workoutSearchData,
    workoutLogs: workoutLogData,
    validation: validation,
    comments: commentData
}