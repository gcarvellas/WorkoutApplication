const express = require('express');
const router = express.Router();

const data = require('../data');
const workoutLogsDB = data.workoutLogs;
const usersDB = data.users;

//TODO
router.use(express.json());
router.use(express.urlencoded({extended: true}));


//main page
router.get('/', (req, res) => {
  if (req.session.user) {
    res.render('layouts/landingPage', {loggedIn: true});
  } else {
    res.render('layouts/landingPage');
  }
  
});

//signup page
router.get('/signup', (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  } else {
    res.render('layouts/signup');
  }
});

router.post('/signup', (req, res) => {

});

//signin page
router.get('/signin', (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  } else {
    res.render('layouts/signin');
  }
});

router.post('/signin', async (req, res) => {
  errors = []
  if (!req.body.inputEmail) {
    errors.push({error: 'email is not provided.'});
  }
  if (!req.body.inputPassword) {
    errors.push({error: 'password is not provided'});
  }
  if (errors.length > 0) {
    res.status(400).render('layouts/signin', {hasError: true, errors: errors});
  } else {
    try {
      let loginUser = await usersDB.checkUser(req.body.inputEmail, req.body.inputPassword);
      req.session.user = loginUser._id;
      req.session.password = loginUser.hashedPassword;
      res.redirect('/');
    } catch (e) {
      res.status(400).render('layouts/signin', {hasError: true, errors: e});
    }
  }
});

//logout page
router.get('/logout', (req, res) => {
  if (req.session.user) {
    req.session.destroy();
    res.render('layouts/logout');
  } else {
    res.redirect('/');
  }
});

router.use('/profile', (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
});

//profile page
router.get('/profile', async (req, res) => {
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