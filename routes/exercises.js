const express = require('express');
const router = express.Router();
const data = require('../data');
const exercises = data.exercises;
const validation = data.validation;

//TODO

router
    .route('/exercise/exercisesByName')
    .get(async (req, res) => {
        try{
            let searchValue = req.query.input;
            searchValue = validation.verifyMessage(searchValue, 'Provided value of exercise name');
            let results = await exercises.getExercisesByName(searchValue, 5);
            return res.status(200).json({"exercises": results});
        }
        catch (e) {
            res.status(400).json({"error": e});
        }
    })

module.exports = router;