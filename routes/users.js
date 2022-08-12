const express = require('express');
const router = express.Router();

//TODO

router.get('/', (req, res) => {
  res.render('layouts/signup');
})

module.exports = router;