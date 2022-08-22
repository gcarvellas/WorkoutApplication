const mongoCollections = require('../config/mongoCollections');
const usersData = require('../data/users');
const exerciseData = require('../data/exercises');
const validation = require('./validation');
const workouts = mongoCollections.workouts;
const MUSCLE_GROUPS = validation.MUSCLE_GROUPS;

const getWorkoutsByAuthor = async function getWorkoutsByAuthor(author, page = 1, limit = 10) {
    validation.verifyUUID(author, 'Provided value of author');
    validation.verifyNumber(page, 'Provided value of page', 'int', 1, 500);
    validation.verifyNumber(limit, 'Provided vaue of limit', 'int', 1, 500);

    const skip = (page - 1) * limit;
    const userFound = await usersData.getUser(author);

    if(userFound === null) {
        throw `No user was found for the given id`;
    }

    const workoutsCollection = await workouts();
    const workoutsFound = await workoutsCollection.aggregate([
      {
        '$match': {
          'author': author.trim(),
        }
      }, {
        '$facet': {
          'total': [
            {
              '$count': 'count'
            }
          ], 
          'data': [
            {
              '$addFields': {
                '_id': '$_id'
              }
            }
          ]
        }
      }, {
        '$unwind': '$total'
      }, {
        '$project': {
          'page': {
            '$literal': skip / limit + 1
          }, 
          'hasNextPage': {
            '$lt': [
              {
                '$multiply': [
                  limit, page
                ]
              }, '$total.count'
            ]
          }, 
          'totalPages': {
            '$ceil': {
              '$divide': [
                '$total.count', limit
              ]
            }
          }, 
          'totalItems': '$total.count', 
          'data': {
            '$slice': [
              '$data', skip, {
                '$ifNull': [
                  limit, '$total.count'
                ]
              }
            ]
          }
        }
      }
    ]).toArray();
    
    return workoutsFound[0];
}

const getWorkoutsByMuscleGroup = async function getWorkoutsByMuscleGroup(muscleGroup, page = 1, limit = 10) {
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

  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(resultArr.length / limit);
  const data = resultArr.slice(skip, limit * page);
  const hasNext = ((limit * page) < resultArr.length) ? true : false;
  return {
    page: page,
    hasNextPage: hasNext,
    totalPages : totalPages,
    totalItems: resultArr.length,
    data: data
  };
}

const getWorkoutsByName = async function getWorkoutsByName(workoutName, page = 1, limit = 10) {
    validation.verifyMessage(workoutName, 'Provided value of workout name');
    validation.verifyNumber(page, 'Provided value of page', 'int', 1, 500);
    validation.verifyNumber(limit, 'Provided vaue of limit', 'int', 1, 500);

    const skip = (page - 1) * limit;

    const workoutsCollection = await workouts();
    const workoutsFound = await workoutsCollection.aggregate([
      {
        '$match': {
          'name': {
                '$regex': workoutName.trim(), 
                '$options': 'i'
              }        }
      }, {
        '$facet': {
          'total': [
            {
              '$count': 'count'
            }
          ], 
          'data': [
            {
              '$addFields': {
                '_id': '$_id'
              }
            }
          ]
        }
      }, {
        '$unwind': '$total'
      }, {
        '$project': {
          'page': {
            '$literal': skip / limit + 1
          }, 
          'hasNextPage': {
            '$lt': [
              {
                '$multiply': [
                  limit, page
                ]
              }, '$total.count'
            ]
          }, 
          'totalPages': {
            '$ceil': {
              '$divide': [
                '$total.count', limit
              ]
            }
          }, 
          'totalItems': '$total.count', 
          'data': {
            '$slice': [
              '$data', skip, {
                '$ifNull': [
                  limit, '$total.count'
                ]
              }
            ]
          }
        }
      }
    ]).toArray();

    return workoutsFound[0];
}

const getMostPopularWorkouts = async function getMostPopularWorkouts(page = 1, limit = 10) {
    validation.verifyNumber(page, 'Provided value of page', 'int', 1, 500);
    validation.verifyNumber(limit, 'Provided value of limit', 'int', 1, 500);

    const skip = (page - 1) * limit;

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
        '$unset': 'numberOfLikes'
      }, {
        '$facet': {
          'total': [
            {
              '$count': 'count'
            }
          ], 
          'data': [
            {
              '$addFields': {
                '_id': '$_id'
              }
            }
          ]
        }
      }, {
        '$unwind': '$total'
      }, {
        '$project': { 
          'page': {
            '$literal': skip / limit + 1
          }, 
          'hasNextPage': {
            '$lt': [
              {
                '$multiply': [
                  limit, page
                ]
              }, '$total.count'
            ]
          }, 
          'totalPages': {
            '$ceil': {
              '$divide': [
                '$total.count', limit
              ]
            }
          }, 
          'totalItems': '$total.count',
          'data': {
            '$slice': [
              '$data', skip, {
                '$ifNull': [
                  limit, '$total.count'
                ]
              }
            ]
          }
        }
      }
      ]).toArray();
    
      return workoutsList[0];
}

module.exports = {
    getWorkoutsByAuthor,
    getWorkoutsByMuscleGroup,
    getWorkoutsByName,
    getMostPopularWorkouts
}