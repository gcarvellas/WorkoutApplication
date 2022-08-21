const express = require('express');
const data = require('../data');
const router = express.Router();
const workouts = data.workouts;
const exercises = data.exercises;
const comments = data.comments;
const validation = data.validation;
const users = data.users;
const workoutLogs = data.workoutLogs;
const util = require("./utilities");

router
    .route('/workout/create')
    .get(async (req, res) => {
        let user;
        try{
            if (!req.session.user) return res.status(403).redirect('/signin');
            user = validation.verifyUser(req.session.user);
            let formAction, exerciseIdString, submitButtonText, workout;
            [formAction, submitButtonText, exerciseIdString, workout] = util.getWorkoutCreateData();
            return res.status(200).render('workouts/workoutForm', {loggedIn: (user ? true : false), formAction: formAction, submitButtonText: submitButtonText, exerciseIdString: exerciseIdString, workout: workout});
        } catch (e) {
            return res.status(400).render('workouts/workoutForm', {loggedIn: (user ? true : false), error: e})
        }
    })
    .post(async (req, res) => {
        let user, password;
        try{
            if (!req.session.user) return res.status(403).redirect('/signin');
            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);

            let intensity,length,workoutName;
            let exercises = [];
            [workoutName, intensity, length, exercises] = await util.parseWorkoutForm(req);

            let workout = await workouts.createWorkout(user, password, workoutName, intensity, length, exercises);
            return res.status(200).redirect(`/workout/${workout._id}`);
        } catch (e) {
            let formAction, exerciseIdString, submitButtonText, workout;
            [formAction, submitButtonText, exerciseIdString, workout] = util.getWorkoutCreateData();
            return res.status(400).render('workouts/workoutForm', {loggedIn: (user ? true : false), formAction: formAction, submitButtonText: submitButtonText, exerciseIdString: exerciseIdString, workout: workout, error: e});
        }
    });

router
    .route('/workout/:id/edit')
    .get(async(req, res) => {
        let user, password;
        try{
            if (!req.session.user) return res.status(403).redirect('/signin');
            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);
    
            const workoutId = validation.verifyUUID(req.params.id, "Workout id");
            const workout = await workouts.getWorkout(workoutId);

            let formAction, exerciseIdString, submitButtonText;
            [formAction, submitButtonText, exerciseIdString] = await util.getWorkoutEditData(workout);

            return res.status(200).render('workouts/workoutForm', {loggedIn: (user ? true : false), workout: workout, exerciseIdString: exerciseIdString, submitButtonText: submitButtonText, formAction: formAction});
        } catch (e) {
            return res.status(400).render('workouts/workoutForm', {error: e, loggedIn: (user ? true : false)});
        }
    })
    .post(async(req, res) => {
        if (!req.session.user) return res.status(403).redirect('/signin');
        let user, password;
        try{
            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);

            let workout = validation.verifyUUID(req.params.id, "Workout ID");
            workout = await workouts.getWorkout(workout);

            let intensity,length,workoutName;
            let exercises = [];
            [workoutName, intensity, length, exercises] = await util.parseWorkoutForm(req);

            workout = await workouts.editWorkout(workout._id, user, password, workoutName, intensity, length, exercises);
            return res.status(200).redirect(`/workout/${workout._id}`);
        } catch (e) {
            try{
                const workoutId = validation.verifyUUID(req.params.id, "Workout id");
                const workout = await workouts.getWorkout(workoutId);
    
                let formAction, exerciseIdString, submitButtonText;
                [formAction, submitButtonText, exerciseIdString] = await util.getWorkoutEditData(workout);

                return res.status(400).render('workouts/workoutForm', {loggedIn: (user ? true : false), workout: workout, exerciseIdString: exerciseIdString, submitButtonText: submitButtonText, formAction: formAction, error: e});
            } catch (er) {
                return res.status(400).render('workouts/workoutForm', {error: er, loggedIn: (req.session.user ? true : false)});
            }
        }
    });

router
    .route('/workout/:id/copy')
    .post(async (req, res) => {
        let user, password;
        try{
            if (!req.session.user) return res.status(403).redirect('/signin');
            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);

            let workout = validation.verifyUUID(req.params.id, "Workout ID");
            workout = await workouts.getWorkout(workout);

            workout = await workouts.copyWorkout(user, password, workout._id);
            return res.status(200).json({href: `/workout/${workout._id}`});
        } catch (e) {
            res.status(400).json({error: e});
        }
    });


router
    .route('/workout/:id')
    .get(async (req, res) => {
        let errors = [];
        let user, password;
        try{
            const workoutId = validation.verifyUUID(req.params.id, "Workout id");
            const workout = await workouts.getWorkout(workoutId);
            
            /**
             * Render each exercise
             * Each exercise wil contain: exerciseId, name, sets, repetitions, rest, weight, comment
             */
            let exerciseResults = [];
            try{
                for (const exercise of workout.exercises){
                    const exerciseResult = await exercises.getExercise(exercise.exerciseId);
                    exercise.name = exerciseResult.name;
                    exerciseResults.push(exercise);
                }
            } catch (e) {
                errors.push(`Error while loading exercises: ${e}`);
            }
    
            /**
             * Check for user auth and load workout logs
             */
            let isAuthor;
            let myWorkoutLogs = [];
            try{
                if (req.session.user){
                    [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);
                    isAuthor = (user._id === workout.author);
    
                    let userWorkoutLogs = await users.getWorkoutLogs(user._id);
                    for (const logId of userWorkoutLogs){
                        const currentLog = await workoutLogs.getWorkoutLog(user, password, logId);
                        const currentWorkout = await workouts.getWorkout(currentLog.workout);
                        if (currentWorkout.author === workout.author && workout._id === currentLog.workout){
                            myWorkoutLogs.push(currentLog);
                        }
                    }
                }
            } catch (e) {
                errors.push(`Error while loading user data and workout logs: ${e}`);
            }
    
            /**
             * Render each comment
             * Each comment will contain: currentTime(), name, comment, author
             */
            let commentResults = [];
            try{
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
                    if (user){
                        commentResult.isAuthor = commentResult.author === user._id;
                    } else{
                        commentResult.isAuthor = false;
                    }
                    commentResults.push(commentResult);
                }
            } catch (e) {
                errors.push(`Error while loading comments: ${e}`);
            }
            if (errors.length > 0){
                res.status(400).render('workouts/workout', {workout: workout, exercises: exerciseResults, comments: commentResults, user: user, isAuthor: isAuthor, workoutLogs: myWorkoutLogs, errors: errors, loggedIn: (user ? true : false)});
            }
            else{
                res.status(200).render('workouts/workout', {workout: workout, exercises: exerciseResults, comments: commentResults, user: user, isAuthor: isAuthor, workoutLogs: myWorkoutLogs, loggedIn: (user ? true : false)});
            }
        } catch (e) {
            res.status(400).render('workouts/workout', {errors: [e], loggedIn: (user ? true : false)});
        }
    });

router
    .route('/workout/:id/delete')
    .post(async (req, res) => {
        let user, password;
        try{
            const workoutId = validation.verifyUUID(req.body.workoutId, "Workout id");
            if (!req.session.user) return res.status(403).render('workouts/deleteWorkout', {error: "Forbidden", loggedIn: (req.session.user ? true : false)});
            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);
            await workouts.deleteWorkout(user, password, workoutId);
            return res.status(200).render('workouts/deleteWorkout', {loggedIn: (user ? true : false)});
        } catch (e) {
            return res.status(400).render('workouts/deleteWorkout', {error: e, loggedIn: (user ? true : false)});
        }
    });

router
    .route('/workout/:id/isUserLiked')
    .get(async (req, res) => {
        try{
            if (!req.session.user) return res.status(403).json({"error": "Forbidden"});
            const workoutId = validation.verifyUUID(req.params.id, "Workout id");
            let user = validation.verifyUUID(req.session.user, "User ID");
            user = await users.getUser(user);
            const result = await workouts.checkIfUserLikedWorkout(user, workoutId);
            return res.status(200).json({"hasLike": result});
        } catch (e) {
            res.status(400).json({"error": e});
        }
    });

router
    .route('/workout/:id/like')
    .put(async (req, res) => {
        let user, password;
        try{
            if (!req.session.user) return res.status(403).json({"error": "Forbidden"});
            const workoutId = validation.verifyUUID(req.params.id, "Workout id");
            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);
            await workouts.addLikeToWorkout(user, password, workoutId);
            return res.status(200).json({"hasLike": true});
        } catch (e) {
            res.status(400).json({"error": e});
        }
    })
    .delete(async (req, res) => {
        let user, password;
        try{
            if (!req.session.user) return res.status(403).json({"error": "Forbidden"});
            const workoutId = validation.verifyUUID(req.params.id, "Workout id");
            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);
            await workouts.removeLikeFromWorkout(user, password, workoutId);
            return res.status(200).json({"hasLike": false});
        } catch (e) {
            res.status(400).json({"error": e});
        }
    });

module.exports = router;