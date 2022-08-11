const express = require('express');
const data = require('../data');

const router = express.Router();
const workouts = data.workouts;
const exercises = data.exercises;
const comments = data.comments;
const validation = data.validation;
const users = data.users;

router
    .route('/workout/:id')
    .get(async (req, res) => {
        try{
            const workoutId = validation.verifyUUID(req.params.id, "Workout id");
            const workout = await workouts.getWorkout(workoutId);
            
            /**
             * Render each exercise
             * Each exercise wil contain: exerciseId, name, sets, repetitions, rest, weight, comment
             */
            let exerciseResults = [];
            workout.exercises.forEach((exercise) => {
                const exerciseResult = await exercises.getExercise(exercise.exerciseId);
                exercise.name = exerciseResult.name;
                exerciseResults.push(exercise);
            });

            /**
             * Render each comment
             * Each comment will contain: currentTime(), name, comment, author
             */
            let commentResults = [];
            workout.comments.forEach((commentId) => {
                const commentResult = await comments.getComment(commentId);
                const userInfo = await users.getUser(commentResult.author);
                if (userInfo.userInfo.lastName){
                    commentResult.name = `${userInfo.userInfo.firstName} ${userInfo.userInfo.lastName}`;
                }
                else{
                    commentResult.name = `${userInfo.userInfo.firstName}`;
                }
                delete commentResult.workout;
                commentResults.push(commentResult);
            })

            res.status(200).render('workout', {workout: workout, exercises: exerciseResults, comments: commentResults});
        }
        catch (e) {
            console.log(e);
            res.status(400).json('workout', {error: e}); //TODO make error page
        }
    });

module.exports = router;