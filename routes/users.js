const express = require('express');
const router = express.Router();
const xss = require('xss');

const data = require('../data');
const validation = data.validation;
const workoutLogsDB = data.workoutLogs;
const usersDB = data.users;

//TODO
router.use(express.json());
router.use(express.urlencoded({extended: true}));


//main page
router.get('/', (req, res) => {
  if (req.session.user) {
    res.render('layouts/landingPage', {loggedIn: true, muscleGroup : validation.MUSCLE_GROUPS});
  } else {
    res.render('layouts/landingPage', {muscleGroup : validation.MUSCLE_GROUPS});
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

router.post('/signup', async (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  } else {
    errors = []
    //verify email
    if (!req.body.inputEmail) {
      errors.push({error: 'Email must be provided.'});
    }
    try {
      validation.verifyEmail(req.body.inputEmail);
    } catch (e) {
      errors.push({error: 'Email must be valid.'});
    }
    //verify password
    if (!req.body.inputPassword) {
      errors.push({error: 'Password must be provided.'});
    }
    let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!req.body.inputPassword.match(passwordRegex)) {
      errors.push({error: 'Password must be valid.'});
    }
    //verify first name
    if (!req.body.inputFirstName) {
      errors.push({error: 'First name is not provided.'});
    }
    if (!req.body.inputFirstName.trim().length) {
      errors.push({error: 'First name can\'t be an empty string or just spaces.'});
    }
    //verify last name if provided
    if (req.body.inputLastName) {
      if (!req.body.inputLastName.trim().length) {
        errors.push({error: 'If last name is provided, it can\'t be just spaces.'});
      }
    }
    //verify weight if provided
    if (req.body.inputWeight) {
      try {
        validation.verifyWeight(parseInt(req.body.inputWeight));
      } catch (e) {
        errors.push({error: 'If weight is provided, it must be between 0 and 1400.'});
      }
    }
    //verify height if provided
    if (req.body.inputHeight) {
      try {
        validation.verifyHeight(parseInt(req.body.inputHeight));
      } catch (e) {
        errors.push({error: 'If height is provided, it must be between 0 and 108.'});
      }
    }
    //verify birthdate
    try {
      let birthDate = new Date(req.body.inputBirthDate + 'T00:00');
      validation.verifyBirthDate(birthDate);
    } catch (e) {
      errors.push({error: 'You must be between 13 and 120 years old.'});
    }
    //verify frequency if provided
    if (req.body.inputFrequency) {
      try {
        validation.verifyFrequencyOfWorkingOut(parseInt(req.body.inputFrequency));
      } catch (e) {
        errors.push({error: 'If frequency is provided, it must be between 0 and 7.'});
      }
    }
    //verify bio if provided
    if (req.body.inputBio) {
      try {
        validation.verifyBio(req.body.inputBio);
      } catch (e) {
        errors.push({error: 'If biography is provided, it must be a non-empty string.'});
      }
    }
    inputHandlebars = {
      inputEmail: (req.body.inputEmail) ? xss(req.body.inputEmail.toLowerCase()) : "",
      inputFirstName: (req.body.inputFirstName) ? xss(req.body.inputFirstName) : "",
      inputLastName: (req.body.inputLastName) ? xss(req.body.inputLastName) : "",
      inputBio: (req.body.inputBio) ? xss(req.body.inputBio) : "",
      inputWeight: (req.body.inputWeight) ? parseInt(req.body.inputWeight) : 0,
      inputHeight: (req.body.inputHeight) ? parseInt(req.body.inputHeight) : 0,
      inputFrequency: (req.body.inputFrequency) ? parseInt(req.body.inputFrequency) : 0
    }
    if (errors.length > 0) {
      inputHandlebars.errors = errors;
      res.status(400).render('layouts/signup', inputHandlebars);
    } else {
      //currently just seeing if user exists by seeing if createUser fails
      try {
        let createUser = await usersDB.createUser(
          xss(req.body.inputEmail.toLowerCase()), 
          req.body.inputPassword,
          xss(req.body.inputFirstName),
          (req.body.inputLastName) ? xss(req.body.inputLastName) : "",
          (req.body.inputBirthDate) ? new Date(req.body.inputBirthDate + 'T00:00') : new Date(),
          (req.body.inputBio) ? xss(req.body.inputBio) : "",
          (req.body.inputWeight) ? parseInt(req.body.inputWeight) : 0,
          (req.body.inputHeight) ? parseInt(req.body.inputHeight) : 0,
          (req.body.inputFrequency) ? parseInt(req.body.inputFrequency) : 0
          );
          if (createUser) {
            res.redirect('/signin');
          } else {
            inputHandlebars.errors = [{error: 'Something went wrong, try again.'}];
            res.status(400).render('layouts/signup', inputHandlebars);
          }
      } catch (e) {
        inputHandlebars.errors = [{error: e}];
        res.status(400).render('layouts/signup', inputHandlebars);
      }
    }
  }
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
  //DONE: should have all validation done correctly
  errors = []
  if (!req.body.inputEmail) {
    errors.push({error: 'Email must be provided.'});
  }
  if (!req.body.inputPassword) {
    errors.push({error: 'Password must be provided.'});
  }
  inputHandlebars = {
    inputEmail: (req.body.inputEmail) ? xss(req.body.inputEmail.toLowerCase()) : ""
  }

  if (errors.length > 0) {
    inputHandlebars.errors = errors;
    res.status(400).render('layouts/signin', inputHandlebars);
  } else {
    try {
      let loginUser = await usersDB.checkUser(req.body.inputEmail.toLowerCase(), req.body.inputPassword);
      req.session.user = loginUser._id;
      req.session.password = req.body.inputPassword;
      res.redirect('/');
    } catch (e) {
      inputHandlebars.errors = [{error: e}];
      res.status(400).render('layouts/signin', inputHandlebars);
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
    res.redirect('/signin');
  }
});

//profile page
router.get('/profile', async (req, res) => {
    //get user information TODO
    let userId = req.session.user;
    let user = await usersDB.getUser(userId);
    let userPassword = req.session.password;
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
    res.render('layouts/profile', {loggedIn: true, user: user, workoutLogs: userWorkoutoutLogs});
  //}
});

module.exports = router;