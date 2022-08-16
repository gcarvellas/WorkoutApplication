const express = require('express');
const router = express.Router();

//TODO

router.get('/signup', (req, res) => {
  res.render('layouts/signup');
});

router.get('/signin', (req, res) => {
  res.render('layouts/signin');
});

router.get('/profile', (req, res) => {
  res.render('layouts/profile');
});

module.exports = router;