const express = require('express');
const router = express.Router();
const workoutLogs = require('../data/workoutLogs');

//TODO

router.get('/', (req, res) => {
  res.render('layouts/workoutLogs');
})



module.exports = router;