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
            for (const exercise of workout.exercises){
                const exerciseResult = await exercises.getExercise(exercise.exerciseId);
                exercise.name = exerciseResult.name;
                exerciseResults.push(exercise);
            }

            /**
             * Render each comment
             * Each comment will contain: currentTime(), name, comment, author
             */
            let commentResults = [];
            for (const commentId of workout.comments){
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
            }

            let user = undefined;
            let isAuthor = undefined;
            if (req.session.user){
                user = await users.getUser(req.session.user);
                isAuthor = (user._id === workout.author);
            }

            res.status(200).render('workouts/workout', {workout: workout, exercises: exerciseResults, comments: commentResults, user: user, isAuthor: isAuthor});
        }
        catch (e) {
            console.log(e);
            res.status(400).render('workouts/workout', {error: e}); //TODO make error page
        }
    });

router
    .route('/workout/:id/delete')
    .post(async (req, res) => {
        const workoutId = validation.verifyUUID(req.body.workoutId, "Workout id");
        if (!req.session.user) return res.status(403).render('workouts/deleteWorkout', {error: "Forbidden"});
        try{
            const user = await users.checkUser(req.session.user, req.session.password);
            await workouts.deleteWorkout(user, req.session.password, workoutId);
            return res.status(200).render('workouts/deleteWorkout');
        } catch (e) {
            return res.status(400).render('workouts/deleteWorkout', {error: e});
        }
    });



module.exports = router;