const express = require('express');
const router = express.Router();
const workoutLogs = require('../data/workoutLogs');

//TODO

router.get('/', (req, res) => {
  res.render('layouts/landingPage');
});

router.get('/workoutLogs/:id', (req, res) => {
  //given a user id, get all the workoutLogs and return them
  
})





module.exports = router;