const express = require('express');
const { MongoUnexpectedServerResponseError } = require('mongodb');
const data = require('../data');

const router = express.Router();
const workouts = data.workouts;
const exercises = data.exercises;
const comments = data.comments;
const validation = data.validation;
const users = data.users;
const workoutLogs = data.workoutLogs;

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

                let userWorkoutLogs = await users.getWorkoutLogs(user._id);
                let workoutLog;
                for (const logId of userWorkoutLogs){
                    const currentLog = await workoutLogs.getWorkoutLog(user, logId);
                    const currentWorkout = await workouts.getWorkout(currentLog.workout);
                    if (currentWorkout.author === workout.author){
                        workoutLog = logId;
                        break;
                    }
                }
            }

            res.status(200).render('workouts/workout', {workout: workout, exercises: exerciseResults, comments: commentResults, user: user, isAuthor: isAuthor, workoutLog: workoutLog});
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
            let user = await users.getUser(req.session.user);
            user = await users.checkUser(user.email, req.session.password);
            await workouts.deleteWorkout(user, req.session.password, workoutId);
            return res.status(200).render('workouts/deleteWorkout');
        } catch (e) {
            return res.status(400).render('workouts/deleteWorkout', {error: e});
        }
    });

router
    .route('/workout/:id/isUserLiked')
    .get(async (req, res) => {
        if (!req.session.user) return res.status(403).json({"error": "Forbidden"});
        try{
            const workoutId = validation.verifyUUID(req.params.id, "Workout id");
            const user = await users.getUser(req.session.user);
            const result = await workouts.checkIfUserLikedWorkout(user, workoutId);
            return res.status(200).json({"hasLike": result});
        } catch (e) {
            res.status(400).json({"error": e});
        }
    });

router
    .route('/workout/:id/like')
    .put(async (req, res) => {
        if (!req.session.user) return res.status(403).json({"error": "Forbidden"});
        try{
            const workoutId = validation.verifyUUID(req.params.id, "Workout id");
            let user = await users.getUser(req.session.user);
            user = await users.checkUser(user.email, req.session.password);
            await workouts.addLikeToWorkout(user, req.session.password, workoutId);
            return res.status(200).json({"hasLike": true});
        } catch (e) {
            res.status(400).json({"error": e});
        }
    })
    .delete(async (req, res) => {
        if (!req.session.user) return res.status(403).json({"error": "Forbidden"});
        try{
            const workoutId = validation.verifyUUID(req.params.id, "Workout id");
            let user = await users.getUser(req.session.user);
            user = await users.checkUser(user.email, req.session.password);
            await workouts.removeLikeFromWorkout(user, req.session.password, workoutId);
            return res.status(200).json({"hasLike": false});
        } catch (e) {
            res.status(400).json({"error": e});
        }
    });

router
    .route('/workout/create')
    .get(async (req, res) => {
        if (!req.session.user) return res.redirect('/signin');
        return res.status(200).render('createWorkout');
    })


module.exports = router;