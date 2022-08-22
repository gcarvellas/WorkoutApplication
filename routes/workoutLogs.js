const express = require('express');
const router = express.Router();
const workoutLogs = require('../data/workoutLogs');
const data = require('../data');
const users = data.users;
const validation = data.validation;
const workouts = data.workouts;
const exercises = data.exercises;
const xss = require('xss');

router.get('/workoutLogs/:id', (req, res) => {
  //given a user id, get all the workoutLogs and return them
  
})

router.get('/workout/:workoutId/log', async (req, res) => {
  //given a workout id, go to a workoutLog creation page
  if (req.session.user) {
    //user is logged in
    //verify that the provided workoutId is a valid one
    errors = []
    let workoutId = ""
    try {
      workoutId = validation.verifyWorkoutName(req.params.workoutId);
    } catch (e) {
      errors.push('The workout id specified can\'t be found.');
    }
    //verify that the provided workoutId exists in DB
    let workout = await workouts.getWorkout(workoutId);
    if (!workout) {
      res.status(400).render('layouts/notloggedin', {reason: 'The workout id specified can\'t be found.'});
    } else {
      if (errors.length > 0) {
        res.status(400).render('layouts/notloggedin', {reason: errors[0]});
      } else {
        res.render('layouts/createWorkoutLog', {workoutId: workoutId, workout: workout, loggedIn: true});
      }
    }
  } else {
    res.render('layouts/notloggedin', {reason: 'You must log in to create a workout log!'});
  }
});

router.post('/workout/:workoutId/log', async (req, res) => {
  if (req.session.user) {
    errors = []
    let workoutId = ""
    try {
      workoutId = validation.verifyWorkoutName(req.params.workoutId);
    } catch (e) {
      errors.push('The workout id specified can\'t be found.');
    }

    //verify that the provided workoutId exists in DB
    let workout = await workouts.getWorkout(workoutId);
    if (!workout) {
      res.status(400).render('layouts/notloggedin', {reason: 'The workout id specified can\'t be found.'});
    } else {
      //workout exists, verify all the inputs from the workoutlog
      let newSubExercise = {}
      let subExercises = []
      let workoutIntensity, workoutLength, workoutDate, workoutComment;
      for (let elem of req.body.requestElems) {
        try {
          if ('inputIntensity' in elem) {
            workoutIntensity = validation.verifyWorkoutIntensity(parseInt(elem.inputIntensity));
          }
          if ('inputLength' in elem) {
            workoutLength = validation.verifyWorkoutLength(parseInt(elem.inputLength));
          }
          if ('inputLength' in elem) {
            workoutLength = validation.verifyWorkoutLength(parseInt(elem.inputLength));
          }
          if ('inputDate' in elem) {
            workoutDate = new Date(elem.inputDate);
            validation.verifyDate(workoutDate);
          }
          if ('inputComment' in elem) {
            if (elem.inputComment !== '') {
              workoutComment = xss(validation.verifyString(elem.inputComment, 'workout comment'));
            }
          }

          if ('inputExerciseSet' in elem) {
            //clear the current subExercise
            newSubExercise = {}
            newSubExercise['exerciseId'] = elem.exerciseid;
            newSubExercise['sets'] = parseInt(elem.inputExerciseSet);
          }
          if ('inputExerciseReps' in elem) {
            newSubExercise['repetitions'] = parseInt(elem.inputExerciseReps);
          }
          if ('inputExerciseRest' in elem) {
            newSubExercise['rest'] = parseInt(elem.inputExerciseRest);
          }
          if ('inputExerciseWeight' in elem) {
            if (elem.inputExerciseWeight !== '') {
              newSubExercise['weight'] = parseInt(elem.inputExerciseWeight);
            } else {
              newSubExercise['weight'] = undefined;
            }
          }
          if ('inputExerciseNote' in elem) {
            if (elem.inputExerciseNote !== '') {
              newSubExercise['comment'] = xss(elem.inputExerciseNote);
            } else {
              newSubExercise['comment'] = undefined;
            }
          }
          //if we got a whole subexercise:
          if (Object.keys(newSubExercise).length === 5) {
            subExercises.push(newSubExercise);
          }
        } catch (e) {
          console.log('validation error', e);
          errors.push(e);
        }
      }

      if (errors.length > 0) {
        res.status(400).send({fail: true, errors: errors});
      } else {
        //verified all fields
        try {
          let user = await users.getUser(req.session.user, req.session.password);
          let workout = await workouts.getWorkout(workoutId);

          let logInfo = {
            date: workoutDate,
            intensity: workoutIntensity,
            length: workoutLength,
            exercises: subExercises,
            comment: workoutComment
          }

          let workoutLog = await workoutLogs.createWorkoutLogFromWorkout(user, req.session.password, workout, logInfo);
          if (workoutLog) {
            res.status(201).send({success: true});
          } else {
            res.status(400).send({fail: true, errors: ['Something went wrong, try again.']});
          }
        } catch (e) {
          console.log('creation error', e);
          res.status(400).send({fail: true, errors: [e]});
        }
      }
    }
  } else {
    res.render('layouts/notloggedin', {reason: 'You must log in to create a workout log!'});
  }
});

router.get('/workoutLog/:workoutLogId', async (req, res) => {
  if (req.session.user) {
    //user is logged in, verify that this is this user's workout log
    let user = await users.getUser(req.session.user);
    if (!user) {
      res.render('layouts/notloggedin', {reason: 'You must log in to view a workout log!'});  
    } else {
      //get workoutlogs for this user
      let userWorkoutLogs = await users.getWorkoutLogs(req.session.user);

      //make sure this workoutlog is in there
      let workoutLogId = validation.verifyUUID(req.params.workoutLogId);

      if (!(userWorkoutLogs.includes(workoutLogId))) {
        //workout log not in user's workoutlogs
        res.render('layouts/notloggedin', {reason: 'You can\'t view another user\'s workout logs!'});  
      } else {
        //in user's workoutlogs
        //get the workoutLog
        let workoutLog = await workoutLogs.getWorkoutLog(user, req.session.password, workoutLogId);
        //from this workout, get all the exercise names
        for (let exercise of workoutLog.logInfo.exercises) {
          //get exercise based on exerciseId
          let innerExercise = await exercises.getExercise(exercise.exerciseId);
          exercise['innerExercise'] = innerExercise;
        }

        //get workout that this workoutLog originated from
        let workout = await workouts.getWorkout(workoutLog.workout);

        res.render('layouts/viewWorkoutLog', {workoutLog: workoutLog, workout: workout, exercises: workoutLog.logInfo.exercises, loggedIn: true})
      }
    }

  } else {
    res.render('layouts/notloggedin', {reason: 'You must log in to view a workout log!'});
  }
});

router.delete('/workoutlog/:workoutLogId', async (req, res) => {
  if (req.session.user) {
    //make sure this is the user's workoutlog
    let user = await users.getUser(req.session.user);
    if (!user) {
      res.render('layouts/notloggedin', {reason: 'You must log in to delete a workout log!'});
    } else {
      //get workoutLogs for this user
      let userWorkoutLogs = await users.getWorkoutLogs(req.session.user);

      let workoutLogId = validation.verifyUUID(req.params.workoutLogId);
      
      if (!userWorkoutLogs.includes(workoutLogId)) {
        res.render('layouts/notloggedin', {reason: 'You can\'t delete another user\'s workout log!'});    
      } else {
        //try and delete the workout log
        let deleted = await workoutLogs.deleteWorkoutLog(user, req.session.password, workoutLogId);
        //successfully deleted
        res.status(200).send({success: true});
      }

    }

  } else {
    res.render('layouts/notloggedin', {reason: 'You must log in to delete a workout log!'});
  }
});




module.exports = router;