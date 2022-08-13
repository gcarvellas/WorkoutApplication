const mongoCollections = require('../config/mongoCollections');
const usersData = require('../data/users');
const exerciseData = require('../data/exercises');
const validation = require('./validation');
const workouts = mongoCollections.workouts;
const MUSCLE_GROUPS = validation.MUSCLE_GROUPS;

const getWorkoutsByAuthor = async function getWorkoutsByAuthor(author, limit = 10) {
    validation.verifyUUID(author, 'Provided value of author');
    validation.verifyNumber(limit, 'Provided vaue of limit', 'int', 1, 500);

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

const getWorkoutsByMuscleGroup = async function getWorkoutsByMuscleGroup(muscleGroup, limit = 10) {
  validation.verifyNumber(limit, 'Provided vaue of limit', 'int', 1, 500);

  muscleGroup = muscleGroup.toLowerCase();
  if(!MUSCLE_GROUPS.includes(muscleGroup))
    throw `The input ${muscleGroup} is not a valid muscle group`;
    
  const workoutCollection = await workouts();
  const workoutsList = await workoutCollection.find({}).toArray();

  if (!workoutsList) {
    throw `Could not get all workouts`;
  }

  if (workoutsList.length === 0) {
    return [];
  }

  if (limit > workoutsList.length) {
    limit = workoutsList.length;
  }

  let resultArr = [];
  let resultArrIds = [];

  for (let workout of workoutsList)  {
      if(workout.exercises.length !== 0) {
        for(const exercise of workout.exercises) {
          let exerciseFound = await exerciseData.getExercise(exercise.exerciseId);
          exerciseFound.muscles.forEach((muscle, i) => {
            if(!resultArrIds.includes(workout._id)){
              if(resultArr.length < limit) {
                if(muscle === muscleGroup) {
                  resultArr.push(workout);
                  resultArrIds.push(workout._id);
                }
              }
            }
          });
        }
      }
  }

  return resultArr;
}

const getWorkoutsByName = async function getWorkoutsByName(workoutName, limit = 10) {
    validation.verifyMessage(workoutName, 'Provided value of workout name');
    validation.verifyNumber(limit, 'Provided vaue of limit', 'int', 1, 500);

    const workoutsCollection = await workouts();
    const workoutsFound = await workoutsCollection.aggregate([
        {
            '$match': {
              'name': {
                '$regex': workoutName.trim(), 
                '$options': 'i'
              }
            }
          }, {
            '$limit': limit
          }
    ]).toArray();

    return workoutsFound;
}

const getMostPopularWorkouts = async function getMostPopularWorkouts(limit = 10) {
    validation.verifyNumber(limit, 'Provided vaue of limit', 'int', 1, 500);

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