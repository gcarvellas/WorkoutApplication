const mongoCollections = require('../config/mongoCollections');
const exercises = mongoCollections.exercises;
const { v4 : uuidv4} = require('uuid');

function checkArgumentCount(functionName, numOfArgumentsPassed, numOfArgumentsExpected) {
    if (numOfArgumentsPassed !== numOfArgumentsExpected) {
        throw `${numOfArgumentsExpected} arguments must be provided to function ${functionName}. (${numOfArgumentsPassed} arguments were passed)`;
    }
}

function isValidString(str, strName) {
    if (!str) {
        throw `${strName} cannot be null, undefined, or empty string.`;
    }

    if (typeof str !== 'string') {
        throw `${strName} is not a valid string.`;
    }

    return true;
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
        isValidString(elem, `Provided value of a ${elementName} in the ${arrayName}`);
    });
}

function isValidUUID(uuid, variableName) {
    const UUID_V4_REGEX = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/;

    isValidString(uuid, `Provided value of ${variableName}`);

    if (uuid.trim().length === 0) {
        throw `${variableName} cannot be a string with empty spaces.`;
    }

    if(!uuid.match(UUID_V4_REGEX)) {
        throw `${variableName} is not a valid v4 UUID.`;
    }
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
 * @param {*} _id 
 * @returns 
 */
 const getExercise = async function getExercise(_id) {
    checkArgumentCount('getExercise', arguments.length, getExercise.length);
    isValidUUID(_id, 'Provided value of exercise id');

    const exerciseCollection = await exercises();
    const exercise = await exerciseCollection.findOne({_id: _id});

    if (exercise === null) {
        throw `No exercise was found for the given ID`;
    }

    return exercise;
}


/**
 * Persists exercise into database
 * @param {String} user 
 * @param {String} name 
 * @param {Array<String>} muscles
 * @param {Array<String>} equipment 
 * @param {String} note 
 * @returns 
 */
const createExercise = async function createExercise(user, name, muscles, equipment, note) {
    checkArgumentCount('createExercise', arguments.length, createExercise.length);
    isValidUUID(user, 'Provided value of user id');
    isValidString(name, 'Provided value of exercise name');

    const exerciseList = await getAllExercise();
    exerciseList.forEach(exercise => {
        if(exercise.name.toLowerCase() == name.toLowerCase()) {
            throw `Exercise name already exists.`;
        }
    });

    isValidStringArray(muscles, 'Provided value of muscles', 'muscles');

    if (Array.isArray(equipment) && equipment.length !== 0) {
        isValidStringArray(equipment, 'Provided value of equipment', 'equipment');
    }

    if (typeof note === 'string' && note.trim().length !== 0) {
        isValidString(note, 'Provided value of exercise note');
    }

    const exerciseCollection = await exercises();

    let newExercise = {
        _id : uuidv4(),
        user : user,
        name : name,
        muscles : muscles,
        equipment : equipment,
        note : note 
    };

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
 * @param {String} _id 
 * @param {String} name 
 * @param {Array<String>} muscles 
 * @param {Array<String>} equipment 
 * @param {String} note 
 * @returns 
 */
const editExercise = async function editExercise(_id, name, muscles, equipment, note) {
    checkArgumentCount('editExercise', arguments.length, editExercise.length);
    isValidUUID(_id, 'Provided value of exercise id');

    const exerciseCollection = await exercises();
    const exerciseToUpdate = await this.getExercise(_id);

    if(exerciseToUpdate === null) {
        throw `No exercise was found for the given ID`;
    }

    const updatedExercise = {};
    
    if(name) {
        isValidString(name, 'Provided value of exercise name');
        updatedExercise.name = name;
    }

    if(muscles) {
        isValidStringArray(muscles, 'Provided value of muscles', 'muscles');
        updatedExercise.muscles = muscles;
    }

    if(equipment) {
        isValidStringArray(equipment, 'Provided value of equipment', 'equipment');
        updatedExercise.equipment = equipment;
    }

    if(note) {
        isValidString(note, 'Provided value of exercise note');
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
    isValidUUID(_id, 'Provided value of exercise id');

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

module.exports = {
    createExercise,
    getExercise,
    getAllExercise,
    editExercise,
    deleteExercise
}