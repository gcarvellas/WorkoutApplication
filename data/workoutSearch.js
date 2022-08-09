const mongoCollections = require('../config/mongoCollections');
const usersData = require('../data/users');
const workouts = mongoCollections.workouts;

function checkArgumentCount(functionName, numOfArgumentsPassed, numOfArgumentsExpected) {
    if (numOfArgumentsPassed !== numOfArgumentsExpected) {
        throw `${numOfArgumentsExpected} arguments must be provided to function ${functionName}. (${numOfArgumentsPassed} arguments were passed)`;
    }
}

function isValidNumber(value, variableName) {
    if (typeof value !== 'number') {
        throw `${variableName} is not a number`;
    }

    if (isNaN(value)) {
        throw `${variableName} cannot be NaN`;
    }

    if (value < 0) {
        throw `${variableName || 'provided variable'} cannot be negative`;
    }

    if (value === 0) {
        throw `${variableName || 'provided variable'} cannot be zero`;
    }
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

function isValidString(str, strName) {
    if (!str) {
        throw `${strName} cannot be null, undefined, or empty string.`;
    }

    if (typeof str !== 'string') {
        throw `${strName} is not a valid string.`;
    }

    return true;
}

const getWorkoutsByAuthor = async function getWorkoutsByAuthor(author, limit) {
    checkArgumentCount('getWorkoutsByAuthor', arguments.length, getWorkoutsByAuthor.length);
    isValidUUID(author, 'Provided value of author');
    isValidNumber(limit, 'Provided value of limit');

    const userFound = await usersData.getUser(author);

    if(userFound === null) {
        throw `No user was found for the given id`;
    }

    const workoutsCollection = await workouts();
    const workoutsFound = await workoutsCollection.aggregate([
        {
            '$match': {
              'author': author
            }
          }, {
            '$limit': limit
          }
    ]).toArray();
    
    return workoutsFound;
}

const getWorkoutsByMuscleGroup = async function getWorkoutsByMuscleGroup(muscleGroup, limit) {
    checkArgumentCount('getWorkoutsByMuscleGroup', arguments.length, getWorkoutsByMuscleGroup.length);
}

const getWorkoutsByName = async function getWorkoutsByName(workoutName, limit) {
    checkArgumentCount('getWorkoutsByName', arguments.length, getWorkoutsByName.length);
    isValidString(workoutName, 'Provided value of workout name');

    const workoutsCollection = await workouts();
    const workoutsFound = await workoutsCollection.aggregate([
        {
            '$match': {
              'name': {
                '$regex': workoutName, 
                '$options': 'i'
              }
            }
          }, {
            '$limit': limit
          }
    ]).toArray();

    return workoutsFound;
}

const getMostPopularWorkouts = async function getMostPopularWorkouts(limit) {
    checkArgumentCount('getMostPopularWorkouts', arguments.length, getMostPopularWorkouts.length);
    isValidNumber(limit);

    const workoutsCollection = await workouts();
    const workoutsList = await workoutsCollection.aggregate([
        {
          '$addFields': {
            'numberOfLikes': {
              '$size': '$usersLiked'
            }
          }
        }, {
          '$sort': {
            'numberOfLikes': -1
          }
        }, {
          '$limit': limit
        }, {
          '$unset': 'numberOfLikes'
        }
      ]).toArray();
    
      return workoutsList;
}

module.exports = {
    getWorkoutsByAuthor,
    getWorkoutsByMuscleGroup,
    getWorkoutsByName,
    getMostPopularWorkouts
}