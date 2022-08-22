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
    //get all exercises in the workout
    for (let exercise of workout.exercises) {
      //get name of exercise from id
      let exerciseName = await exercises.getExercise(exercise.exerciseId);
      exercise['name'] = exerciseName.name;
    }

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

router.get('/workout/:workoutId/logcopy/:workoutLogId', async (req, res) => {
  //given a workout id and a workoutlogId, go to a workoutLog creation page
  if (req.session.user) {
    //user is logged in
    //verify that the provided workoutId is a valid one
    errors = []
    let workoutId, workoutLogId
    try {
      workoutId = validation.verifyWorkoutName(req.params.workoutId);
      workoutLogId = validation.verifyString(req.params.workoutLogId);
    } catch (e) {
      errors.push(e);
    }
    //verify that the provided workoutId exists in DB
    let workout = await workouts.getWorkout(workoutId);
    let user = await users.getUser(req.session.user, req.session.password);
    let workoutLog = await workoutLogs.getWorkoutLog(user, req.session.password, workoutLogId);

    if (!workout) {
      res.status(400).render('layouts/notloggedin', {reason: 'The workout id specified can\'t be found.'});
    } else {
      if (errors.length > 0) {
        res.status(400).render('layouts/notloggedin', {reason: errors[0]});
      } else {
        workout = {
          name: workout.name,
          intensity: workoutLog.logInfo.intensity,
          length: workoutLog.logInfo.length,
          exercises: workoutLog.logInfo.exercises
        }
        res.render('layouts/createWorkoutLog', {workoutId: workoutId, workout: workout, loggedIn: true, copy: true});
      }
    }
  } else {
    res.render('layouts/notloggedin', {reason: 'You must log in to copy a workout log!'});
  }
});

router.get('/workout/:workoutId/logedit/:workoutLogId', async (req, res) => {
  //given a workout id and a workoutlogId, go to a workoutLog edit page
  if (req.session.user) {
    //user is logged in
    //verify that the provided workoutId is a valid one
    errors = []
    let workoutId, workoutLogId, workout, user, workoutLog
    try {
      workoutId = validation.verifyWorkoutName(req.params.workoutId);
      workoutLogId = validation.verifyString(req.params.workoutLogId);

      //verify that the provided workoutId exists in DB
      workout = await workouts.getWorkout(workoutId);
      user = await users.getUser(req.session.user, req.session.password);
      workoutLog = await workoutLogs.getWorkoutLog(user, req.session.password, workoutLogId);
    } catch (e) {
      errors.push(e);
    }

    if (!workout) {
      res.status(400).render('layouts/notloggedin', {reason: 'The workout id specified can\'t be found.'});
    } else {
      if (errors.length > 0) {
        res.status(400).render('layouts/notloggedin', {reason: errors[0]});
      } else {
        workout = {
          name: workout.name,
          intensity: workoutLog.logInfo.intensity,
          length: workoutLog.logInfo.length,
          date: workoutLog.logInfo.date.toISOString().slice(0, 16),
          comment: workoutLog.logInfo.comment,
          exercises: workoutLog.logInfo.exercises
        }
        res.render('layouts/editWorkoutLog', {workoutId: workoutId, workout: workout, loggedIn: true});
      }
    }
  } else {
    res.render('layouts/notloggedin', {reason: 'You must log in to edit a workout log!'});
  }
});

router.put('/workout/:workoutId/logedit/:workoutLogId', async (req, res) => {
  if (req.session.user) {
    errors = []
    let workoutId = ""
    let workoutLogId = ""
    try {
      workoutId = validation.verifyWorkoutName(req.params.workoutId);
      workoutLogId = validation.verifyUUID(req.params.workoutLogId);
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

          if (Object.keys(elem)[0].startsWith('inputExerciseSet')) {
            //clear the current subExercise
            newSubExercise = {}
            let exerciseSetElemName = Object.keys(elem)[0];
            newSubExercise['exerciseId'] = elem.exerciseid;
            newSubExercise['sets'] = parseInt(elem[exerciseSetElemName]);
          }
          if (Object.keys(elem)[0].startsWith('inputExerciseReps')) {
            newSubExercise['repetitions'] = parseInt(elem[Object.keys(elem)[0]]);
          }
          if (Object.keys(elem)[0].startsWith('inputExerciseRest')) {
            newSubExercise['rest'] = parseInt(elem[Object.keys(elem)[0]]);
          }
          if (Object.keys(elem)[0].startsWith('inputExerciseWeight')) {
            if (elem[Object.keys(elem)[0]] !== '') {
              newSubExercise['weight'] = parseInt(elem[Object.keys(elem)[0]]);
            } else {
              newSubExercise['weight'] = undefined;
            }
          }
          if (Object.keys(elem)[0].startsWith('inputExerciseNote')) {
            if (elem[Object.keys(elem)[0]] !== '') {
              newSubExercise['comment'] = xss(elem[Object.keys(elem)[0]]);
            } else {
              newSubExercise['comment'] = undefined;
            }
          }
          //if we got a whole subexercise:
          if (Object.keys(newSubExercise).length === 5) {
            subExercises.push(newSubExercise);
          }
        } catch (e) {
          console.log('validation error on editing', e);
          errors.push(e);
        }
      }

      if (errors.length > 0) {
        res.status(400).send({fail: true, errors: errors});
      } else {
        //verified all fields

        //make sure at least one exercise is included
        if (subExercises.length === 0) {
          res.status(400).send({fail: true, errors: ['You need to include at least one exercise']});
        } else {
          try {
            let user = await users.getUser(req.session.user, req.session.password);
            // let workout = await workouts.getWorkout(workoutId);
            // let existingWorkoutLog = await workoutLogs.getWorkoutLog(user, req.session.password, workoutLogId);
  
            let logInfo = {
              date: workoutDate,
              intensity: workoutIntensity,
              length: workoutLength,
              exercises: subExercises,
              comment: workoutComment
            }
  
            let workoutLog = await workoutLogs.editWorkoutLog(user, req.session.password, workoutLogId, logInfo);
            if (workoutLog) {
              res.status(201).send({success: true});
            } else {
              res.status(400).send({fail: true, errors: ['Something went wrong, try again.']});
            }
          } catch (e) {
            console.log('editing error', e);
            res.status(400).send({fail: true, errors: [e]});
          }
        }
      }
    }
  } else {
    res.render('layouts/notloggedin', {reason: 'You must log in to edit a workout log!'});
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

          if (Object.keys(elem)[0].startsWith('inputExerciseSet')) {
            //clear the current subExercise
            newSubExercise = {}
            let exerciseSetElemName = Object.keys(elem)[0];
            newSubExercise['exerciseId'] = elem.exerciseid;
            newSubExercise['sets'] = parseInt(elem[exerciseSetElemName]);
          }
          if (Object.keys(elem)[0].startsWith('inputExerciseReps')) {
            newSubExercise['repetitions'] = parseInt(elem[Object.keys(elem)[0]]);
          }
          if (Object.keys(elem)[0].startsWith('inputExerciseRest')) {
            newSubExercise['rest'] = parseInt(elem[Object.keys(elem)[0]]);
          }
          if (Object.keys(elem)[0].startsWith('inputExerciseWeight')) {
            if (elem[Object.keys(elem)[0]] !== '') {
              newSubExercise['weight'] = parseInt(elem[Object.keys(elem)[0]]);
            } else {
              newSubExercise['weight'] = undefined;
            }
          }
          if (Object.keys(elem)[0].startsWith('inputExerciseNote')) {
            if (elem[Object.keys(elem)[0]] !== '') {
              newSubExercise['comment'] = xss(elem[Object.keys(elem)[0]]);
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

        //make sure at least one exercise is included
        if (subExercises.length === 0) {
          res.status(400).send({fail: true, errors: ['You need to include at least one exercise']});
        } else {
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