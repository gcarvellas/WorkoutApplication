const express = require('express');
const router = express.Router();

const data = require('../data');
const validation = data.validation;
const workoutSearchData = data.workoutSearch;

//TODO
router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.get('/workoutSearch/:searchValue', async (req, res) => {
    let searchValue = validation.verifyMessage(req.params.searchValue);
    let page = 1;
    let pageSize = 10;

    if(typeof req.query.page !== 'undefined') {
        page = validation.verifyNumber(parseInt(req.query.page), 'page', 'int', 1, 500);
    }

    if(typeof req.query.pageSize !== 'undefined') {
        pageSize = validation.verifyNumber(parseInt(req.query.pageSize), 'page size', 'int', 1, 500);
    }

    let results = undefined;
    if(searchValue === 'popular') {
        results = await workoutSearchData.getMostPopularWorkouts(page, pageSize)
    } else if (validation.MUSCLE_GROUPS.includes(searchValue)){
        results = await workoutSearchData.getWorkoutsByMuscleGroup(searchValue, page, pageSize);
    }

    if(results !== undefined) {
        res.json(results);
    } else {
        res.json({
            page: 1,
            hasNextPage: false,
            totalPages: 1,
            totalItems: 0,
            data: []
        });
    }
});

router.get('/workoutSearch/name/:searchName', async (req, res) => {
    let searchName = validation.verifyMessage(req.params.searchName);
    let page = 1;
    let pageSize = 10;

    if(typeof req.query.page !== 'undefined') {
        page = validation.verifyNumber(parseInt(req.query.page), 'page', 'int', 1, 500);
    }

    if(typeof req.query.pageSize !== 'undefined') {
        pageSize = validation.verifyNumber(parseInt(req.query.pageSize), 'page size', 'int', 1, 500);
    }

    let results = await workoutSearchData.getWorkoutsByName(searchName, page, pageSize);
    
    if(results === undefined) {
        res.json({
            page: 1,
            hasNextPage: false,
            totalPages: 1,
            totalItems: 0,
            data: []
        });
    } else {
        res.json(results);
    }
});

router.get('/workoutSearch/user/loggedInUser', async (req, res) => {
    let page = 1;
    let pageSize = 10;

    if(typeof req.query.page !== 'undefined') {
        page = validation.verifyNumber(parseInt(req.query.page), 'page', 'int', 1, 500);
    }

    if(typeof req.query.pageSize !== 'undefined') {
        pageSize = validation.verifyNumber(parseInt(req.query.pageSize), 'page size', 'int', 1, 500);
    }

    if (req.session.user) {
        let results = await workoutSearchData.getWorkoutsByAuthor(req.session.user, page, pageSize);

        if(results === undefined) {
            res.json({
                page: 1,
                hasNextPage: false,
                totalPages: 1,
                totalItems: 0,
                data: []
            });
        } else {
            res.json(results);
        }
    }
});

module.exports = router;