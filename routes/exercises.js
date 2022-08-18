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
            if (!req.session.user) return res.status(403).json({"error": "forbidden"});
            let searchValue = req.query.input;
            if (typeof searchValue !== 'string') throw "Search Value must be a string";
            if (searchValue.trim() === ""){
                return res.status(200).json({"exercises": []});
            }
            let results = await exercises.getExercisesByName(searchValue, 5);
            return res.status(200).json({"exercises": results});
        }
        catch (e) {
            res.status(400).json({"error": e});
        }
    })

module.exports = router;