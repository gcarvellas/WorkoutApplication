const mongoCollections = require('../config/mongoCollections');
const validation = require('./validation');
const exercises = mongoCollections.exercises;
const { v4 : uuidv4} = require('uuid');
const MUSCLE_GROUPS = validation.MUSCLE_GROUPS;
const users = require('./users');

function checkArgumentCount(functionName, numOfArgumentsPassed, numOfArgumentsExpected) {
    if (numOfArgumentsPassed !== numOfArgumentsExpected) {
        throw `${numOfArgumentsExpected} arguments must be provided to function ${functionName}. (${numOfArgumentsPassed} arguments were passed)`;
    }
}

function isValidStringArray(arr, arrayName, elementName) {
    if (!arr) {
        throw `${arrayName} cannot be null or undefined`;
    }

    if (!Array.isArray(arr)) {
        throw `${arrayName} is not a valid array`;
    }

    if (arr.length === 0) {
        throw `${arrayName} is empty. You must supply at least one ${elementName}`;
    }

    arr.forEach(elem => {
        validation.verifyMessage(elem, `Provided value of a ${elementName} in the ${arrayName}`);
    });
}

function isValidMuscleGroups(arr) {
    isValidStringArray(arr, 'Provided value of muscles', 'muscles');

    arr.forEach((muscle_group) => {
        validation.verifyMessage(muscle_group, `Provided value of a muscle in the muscles array`);

        if(!MUSCLE_GROUPS.includes(muscle_group.toLowerCase())) throw `The input "${muscle_group}" is not a valid muscle group`;
    });
}

/**
 * Get all exercises
 * @returns 
 */
 const getAllExercise = async function getAllExercise() {
    checkArgumentCount('getAllExercise', arguments.length, getAllExercise.length);

    const exerciseCollection = await exercises();
    const exerciseList = await exerciseCollection.find({}).toArray();
    
    if (!exerciseList) {
        throw `Could not get all exercises.`;
    }

    if (exerciseList.length === 0) {
        return [];
    }

    return exerciseList;
}


/**
 * Get exercise by a given ID
 * @param {String} _id 
 * @returns 
 */
 const getExercise = async function getExercise(_id) {
    checkArgumentCount('getExercise', arguments.length, getExercise.length);
    validation.verifyUUID(_id, 'Provided value of exercise id');

    const exerciseCollection = await exercises();
    const exercise = await exerciseCollection.findOne({_id: _id});

    if (exercise === null) {
        throw `No exercise was found for the given ID`;
    }

    return exercise;
}


/**
 * Persists exercise into database
 * @param {Object} user 
 * @param {String} userPassword password from cookie
 * @param {String} name 
 * @param {Array<String>} muscles
 * @param {Array<String>} equipment 
 * @param {String} note 
 * @returns 
 */
const createExercise = async function createExercise(user, userPassword, name, muscles, equipment, note) {
    user = validation.verifyUser(user);
    user = await users.checkUser(user.email, userPassword);
    checkArgumentCount('createExercise', arguments.length, createExercise.length);
    validation.verifyMessage(name, 'Provided value of exercise name');

    const exerciseList = await getAllExercise();
    exerciseList.forEach(exercise => {
        if(exercise.name.toLowerCase() == name.toLowerCase()) {
            throw `Exercise name already exists.`;
        }
    });

    isValidMuscleGroups(muscles);

    muscles.forEach((muscle, i) => {
        muscles[i] = muscle.toLowerCase();
    });

    const exerciseCollection = await exercises();

    let newExercise = {
        _id : uuidv4(),
        user : user._id,
        name : name,
        muscles : Array.from(new Set(muscles))
    };

    if (Array.isArray(equipment) && equipment.length !== 0) {
        isValidStringArray(equipment, 'Provided value of equipment', 'equipment');
        newExercise.equipment = equipment;
    }

    if (typeof note === 'string' && note.trim().length !== 0) {
        validation.verifyMessage(note, 'Provided value of exercise note');
        newExercise.note = note;
    }

    const insertInfo = await exerciseCollection.insertOne(newExercise);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw `Could not add exercise`;
    }

    const newId = insertInfo.insertedId.toString();
    const exercise = await this.getExercise(newId);
    return exercise;
}


/**
 * Updates exercise by a given ID
 * @param {Object} user 
 * @param {String} userPassword password from cookie
 * @param {String} _id 
 * @param {String} name 
 * @param {Array<String>} muscles 
 * @param {Array<String>} equipment 
 * @param {String} note 
 * @returns 
 */
const editExercise = async function editExercise(user, userPassword, _id, name, muscles, equipment, note) {
    user = validation.verifyUser(user);
    user = await users.checkUser(user.email, userPassword);
    checkArgumentCount('editExercise', arguments.length, editExercise.length);
    validation.verifyUUID(_id, 'Provided value of exercise id');

    const exerciseCollection = await exercises();
    const exerciseToUpdate = await this.getExercise(_id);

    if(exerciseToUpdate === null) {
        throw `No exercise was found for the given ID`;
    }

    if (exerciseToUpdate.user !== user._id) throw "User cannot edit other user's exercise";

    const updatedExercise = {};
    
    if(name) {
        validation.verifyMessage(name, 'Provided value of exercise name');
        updatedExercise.name = name;
    }

    if(muscles) {
        isValidMuscleGroups(muscles);
        muscles.forEach((muscle, i) => {
            muscles[i] = muscle.toLowerCase();
        });
        updatedExercise.muscles = muscles;
    }

    if(equipment) {
        isValidStringArray(equipment, 'Provided value of equipment', 'equipment');
        updatedExercise.equipment = equipment;
    }

    if(note) {
        validation.verifyMessage(note, 'Provided value of exercise note');
        updatedExercise.note = note;
    }

    await exerciseCollection.updateOne(
        {_id: _id},
        {$set: updatedExercise}
    );

    return await this.getExercise(_id);
}


/**
 * Delete exercise by given ID
 * @param {String} _id 
 */
const deleteExercise = async function deleteExercise(_id) {
    checkArgumentCount('deleteExercise', arguments.length, deleteExercise.length);
    validation.verifyUUID(_id, 'Provided value of exercise id');

    const exerciseCollection = await exercises();
    const exerciseToRemove = await this.getExercise(_id);

    if (exerciseToRemove === null) {
        throw `No exercise was found for the given ID`;
    }

    const deletionInfo = await exerciseCollection.deleteOne(
        {_id: _id}
    );

    if (deletionInfo.deleteCount === 0) {
        throw `Could not delete exercise with id of ${_id}`;
    }

    return true;
}

const getExercisesByName = async function getExercisesByName(exerciseName, limit = 10) {
    validation.verifyMessage(exerciseName, 'Provided value of exercise name');
    validation.verifyNumber(limit, 'Provided value of limit', 'int', 1, 500);

    const workoutsCollection = await exercises();
    const exercisesFound = await workoutsCollection.aggregate([
        {
            '$match': {
              'name': {
                '$regex': exerciseName.trim(), 
                '$options': 'i'
              }
            }
          }, {
            '$limit': limit
          }
    ]).toArray();

    return exercisesFound;
}

module.exports = {
    createExercise,
    getExercise,
    getAllExercise,
    editExercise,
    deleteExercise,
    getExercisesByName
}