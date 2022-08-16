const express = require('express');
const router = express.Router();

const data = require('../data');
const workoutLogsDB = data.workoutLogs;
const usersDB = data.users;

//TODO

router.get('/signup', (req, res) => {
  res.render('layouts/signup');
});

router.get('/signin', (req, res) => {
  res.render('layouts/signin');
});

router.get('/profile', async (req, res) => {
  //see if user is logged in
  //if (!req.session.user) {
    //res.redirect('/');
  //} else {
    //get user information TODO
    let userId = '2878d548-e6e6-405d-ac0a-f1e497cf776b'; //will be gotten from req.session.user
    let user = await usersDB.getUser(userId);
    let userPassword = 'test123456'; //will be gotten from req.session.user
    //get user workouts TODO

    //get user workout logs from user
    let userWorkoutoutLogs = []; 
    let workoutLogs = await usersDB.getWorkoutLogs(userId);
    //get the actual workoutLog from each workoutLogId
    for (let workoutLogId of workoutLogs) {
      let workoutLog = await workoutLogsDB.getWorkoutLog(user, userPassword, workoutLogId);
      userWorkoutoutLogs.push(workoutLog);
    }
    //get 
    res.render('layouts/profile', {user: user, workoutLogs: userWorkoutoutLogs});
  //}
});

module.exports = router;