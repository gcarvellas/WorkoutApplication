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
    .route('/workout/create')
    .get(async (req, res) => {
        if (!req.session.user) return res.redirect('/signin');
        return res.status(200).render('workouts/createWorkout', {loggedIn: (req.session.user ? true : false)});
    })
    .post(async (req, res) => {
        if (!req.session.user) return res.status(403).redirect('/signin');
        try{
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
                    return res.status(400).render('workouts/createWorkout', {error: "Bad Request", loggedIn: (req.session.user ? true : false)});
                }
            }
            let user = await users.getUser(req.session.user);
            user = await users.checkUser(user.email, req.session.password);
            let workout = await workouts.createWorkout(user, req.session.password, workoutName, intensity, length, exercises);
            return res.status(200).redirect(`${workout._id}`);
        } catch (e) {
            return res.status(400).render('workouts/createWorkout', {error: e, loggedIn: (req.session.user ? true : false)});
        }
        //TODO everything's a string. need to validate and convert.
    });

router
    .route('/workout/:id')
    .get(async (req, res) => {
        let errors = [];
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
            let user = undefined;
            let isAuthor = undefined;
            let workoutLog;
            try{
                if (req.session.user){
                    user = await users.getUser(req.session.user);
                    isAuthor = (user._id === workout.author);
    
                    let userWorkoutLogs = await users.getWorkoutLogs(user._id);
                    for (const logId of userWorkoutLogs){
                        const currentLog = await workoutLogs.getWorkoutLog(user, logId);
                        const currentWorkout = await workouts.getWorkout(currentLog.workout);
                        if (currentWorkout.author === workout.author){
                            workoutLog = logId;
                            break;
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
                res.status(400).render('workouts/workout', {workout: workout, exercises: exerciseResults, comments: commentResults, user: user, isAuthor: isAuthor, workoutLog: workoutLog, errors: errors, loggedIn: (req.session.user ? true : false)});
            }
            else{
                res.status(200).render('workouts/workout', {workout: workout, exercises: exerciseResults, comments: commentResults, user: user, isAuthor: isAuthor, workoutLog: workoutLog, loggedIn: (req.session.user ? true : false)});
            }
        } catch (e) {
            res.status(400).render('workouts/workout', {errors: [e], loggedIn: (req.session.user ? true : false)});
        }
    });

router
    .route('/workout/:id/delete')
    .post(async (req, res) => {
        const workoutId = validation.verifyUUID(req.body.workoutId, "Workout id");
        if (!req.session.user) return res.status(403).render('workouts/deleteWorkout', {error: "Forbidden", loggedIn: (req.session.user ? true : false)});
        try{
            let user = await users.getUser(req.session.user);
            user = await users.checkUser(user.email, req.session.password);
            await workouts.deleteWorkout(user, req.session.password, workoutId);
            return res.status(200).render('workouts/deleteWorkout', {loggedIn: (req.session.user ? true : false)});
        } catch (e) {
            return res.status(400).render('workouts/deleteWorkout', {error: e, loggedIn: (req.session.user ? true : false)});
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

module.exports = router;