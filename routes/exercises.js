const express = require('express');
const router = express.Router();
const data = require('../data');
const exercises = data.exercises;
const validation = data.validation;

//TODO

router
    .route('/exercise/exercisesByName')
    .get(async (req, res) => {
        if (!req.session.user) return res.status(403).json({"error": "forbidden"});
        let searchValue = req.params.input;
        let results = await exercises.getExercisesByName(searchValue, 5);
        return res.status(200).json({"exercises": results});
    })

module.exports = router;