const express = require('express');
const { users } = require('../data');
const router = express.Router();
const data = require('../data');
const exercises = data.exercises;
const userInfo = data.users;
const validation = data.validation;
const util = require("./utilities");

//TODO
router
    .route('/exercise/:id')
    .get(async (req, res) => {
        let exerciseId = null;
        let exerciseFound = null;
        let authorInfo = null;
        let user, password;
        let canEditOrDelete = false;
        
        try {
            exerciseId = validation.verifyUUID(req.params.id, 'exercise id');
            exerciseFound = await exercises.getExercise(exerciseId);
        } catch (e) {
            if (req.session.user) {
                res.status(400).render('exercises/exercise', {loggedIn: true, error: {title: 'Unable to fetch exercise details', message: e}});
            } else {
                res.status(400).render('exercises/exercise', {error: {title: 'Unable to fetch exercise details', message: e}});
            }
            return;
        }
        
        try {
            authorInfo = await users.getUser(exerciseFound.user);    
        } catch (e) {
            if (req.session.user) {
                res.status(400).render('exercises/exercise', {loggedIn: true, error: {title: 'Unable to fetch exercise author full name', message: e}});
            } else {
                res.status(400).render('exercises/exercise', {error: {title: 'Unable to fetch exercise author full name', message: e}});
            }
            return;
        }

        if(req.session.user) {
            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);

            if(user._id == exerciseFound.user){
                canEditOrDelete = true;
            }
        }
        
        const authorName = authorInfo.userInfo.firstName + " " + authorInfo.userInfo.lastName;

        if(exerciseFound.equipment !== undefined) {
            exerciseFound.equipment = exerciseFound.equipment.join(', ');
        }

        if (req.session.user) {
            res.render('exercises/exercise', {loggedIn: true, exercise: exerciseFound, authorName: authorName, canModify: canEditOrDelete});
        } else {
            res.render('exercises/exercise', {exercise: exerciseFound, authorName: authorName, canModify: canEditOrDelete});
        }
    })
    .post(async (req, res) => {
        let exerciseId = null;
        let exercise = null;
        let user, password, name, note;
        let muscles = [];
        let equipment = [];
        let canEditOrDelete = false;
        let authorName;
        

        try {
            if (!req.session.user) {
                return res.status(403).redirect('/signin');
            } 
                
            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);
            exerciseId = validation.verifyUUID(req.params.id, 'exercise id');
            exercise = await exercises.getExercise(exerciseId);
            const authorInfo = await users.getUser(exercise.user); 
            authorName = authorInfo.userInfo.firstName + " " + authorInfo.userInfo.lastName;

            if(user._id == exercise.user){
                canEditOrDelete = true;
            }
            
            [name, muscles, note, equipment] = await util.parseExerciseForm(req);

            exercise = await exercises.editExercise(user, password, exerciseId, name, muscles, equipment, note);

            if(exercise.equipment !== undefined) {
                exercise.equipment = exercise.equipment.join(', ');
            }

            if (req.session.user) {
                res.render('exercises/exercise', {loggedIn: true, exercise: exercise, authorName: authorName, canModify: canEditOrDelete});
            } 
        } catch (e) {
            if (req.session.user) {
                res.status(400).render('exercises/exerciseForm', {loggedIn: true, exercise: exercise, errorAfter: e, muscleGroups: validation.MUSCLE_GROUPS, pageTitle: "Edit Exercise"});
            } else {
                res.status(400).render('exercises/exerciseForm', {errorAfter: e});
            }
            return;
        }
    });

router
    .route('/exercise/exercisesByName')
    .get(async (req, res) => {
        try{
            let searchValue = req.query.input;
            searchValue = validation.verifyMessage(searchValue, 'Provided value of exercise name');
            let results = await exercises.getExercisesByName(searchValue, 5);
            return res.status(200).json({"exercises": results});
        }
        catch (e) {
            res.status(400).json({"error": e});
        }
    });

router 
    .route('/exercise/:id/edit')
    .get(async (req, res) => {
        let exerciseId = req.params.id;
        let user, password;

        if (!req.session.user) {
            return res.status(403).redirect('/signin');
        } 

        try {
            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);
            exerciseId = validation.verifyUUID(req.params.id, 'exercise id');
            exerciseFound = await exercises.getExercise(exerciseId);

            if(user._id !== exerciseFound.user) {
                return res.status(403).redirect('/signin');
            }
        } catch (e) {
            if (req.session.user) {
                res.status(400).render('exercises/exerciseForm', {loggedIn: true, error: {title: 'Unable to fetch exercise details', message: e}, pageTitle: "Edit Exercise"});
            } else {
                res.status(400).render('exercises/exerciseForm', {error: {title: 'Unable to fetch exercise details', message: e}, pageTitle: "Edit Exercise"});
            }
            return;
        }
        
        res.status(200).render('exercises/exerciseForm', {loggedIn: (user ? true : false), exercise: exerciseFound, muscleGroups: validation.MUSCLE_GROUPS, pageTitle: "Edit Exercise",  urlAfter: `/exercise/${exerciseId}`});
    });

router
    .route('/exercises/new')
    .get(async (req, res) => {
        let user, password;

        if(!req.session.user) {
            return res.status(403).redirect('/signin');
        }

        try {
            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);
            res.status(200).render('exercises/exerciseForm', {loggedIn: (user ? true : false), muscleGroups: validation.MUSCLE_GROUPS, pageTitle: "Create Exercise", urlAfter: `/exercises/new`});
        } catch (e) {
            if (req.session.user) {
                res.status(400).render('exercises/exerciseForm', {loggedIn: (user ? true: false), error: {title: 'Unable to fetch user deatils', message: e}, pageTitle: "Create Exercise"});
            } else {
                res.status(400).render('exercises/exerciseForm', {error: {title: 'Unable to fetch user details', message: e}, pageTitle: "Create Exercise"});
            }
        }
    })
    .post(async (req, res) => {
        let user, password, name, note, exercise;
        let muscles = [];
        let equipment = [];

        if(!req.session.user) {
            return res.status(403).redirect('/signin');
        }

        try{
            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);
        } catch (e) {
            if (req.session.user) {
                res.status(400).render('exercises/exerciseForm', {loggedIn: (user ? true: false), error: {title: 'Unable to fetch user deatils', message: e}, pageTitle: "Create Exercise"});
            } else {
                res.status(400).render('exercises/exerciseForm', {error: {title: 'Unable to fetch user details', message: e}, pageTitle: "Create Exercise"});
            }
        }

        try{
            [name, muscles, note, equipment] = await util.parseExerciseForm(req);
            exercise = await exercises.createExercise(user, password, name, muscles, equipment, note);

            if (req.session.user) {
                res.render('layouts/landingPage', {loggedIn: true, muscleGroup : validation.MUSCLE_GROUPS});
              } else {
                res.render('layouts/landingPage', {muscleGroup : validation.MUSCLE_GROUPS});
              }
        } catch (e) {
            if (req.session.user) {
                res.status(400).render('exercises/exerciseForm', {loggedIn: (user ? true: false), errorAfter: e, pageTitle: "Create Exercise", muscleGroups: validation.MUSCLE_GROUPS});
            } else {
                res.status(400).render('exercises/exerciseForm', {errorAfter: e, pageTitle: "Create Exercise", muscleGroups: validation.MUSCLE_GROUPS});
            }
        }
    });

module.exports = router;