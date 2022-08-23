const validation = require('./validation');
const workoutSearch = require('./workoutSearch');
const comments = require('./comments');
const mongoCollections = require("../config/mongoCollections");
const { v4 : uuidv4} = require('uuid');
const recursiveDelete = require('./recursiveDelete');
const workouts = mongoCollections.workouts;
const userDB = mongoCollections.users;
const commentDB = mongoCollections.comments;
const users = require('./users');

async function addUserMadeWorkout(user, userPassword, _id){
    /**
     * Helper function. adds workout ID to user.userMadeWorkouts
     * @param user {Object} user object
     * @param userPassword {String} user password from cookie
     * @param  _id {String} workout UUID
     * @return true if workout id is added to user.userMadeWorkouts
     * @throws Will throw an exception if workout is already in user made workouts or DB fails.
     */
    user = validation.verifyUser(user);
    userPassword = validation.verifyPassword(userPassword);
    user = await users.checkUser(user.email, userPassword);
    _id = validation.verifyUUID(_id, "Workout id");

    if (user.userMadeWorkouts.includes(_id)) throw "Workout is already in user made workouts";

    user.userMadeWorkouts.push(_id);

    const userCollection = await userDB();
    const updatedInfo = await userCollection.updateOne(
        {_id: user._id},
        {$set: {"userMadeWorkouts": user.userMadeWorkouts}}
    );
    if (updatedInfo.modifiedCount < 0) throw "Could not add userMadeWorkouts successfully";
    return true;
}

async function removeUserMadeWorkout(user, userPassword, _id){
    /**
     * Helper function. Removes workout ID from user.userMadeWorkouts
     * @param user {Object} user object
     * @param  _id {String} workout UUID
     * @return true if workout id is removed from user.userMadeWorkouts
     * @throws Will throw an exception if workout is not in user made workouts or DB fails.
     */
    user = validation.verifyUser(user);
    userPassword = validation.verifyPassword(userPassword);
    user = await users.checkUser(user.email, userPassword);
    _id = validation.verifyUUID(_id, "Workout id");

    if (!user.userMadeWorkouts.includes(_id)) throw "Workout is not in user made workouts";

    user.userMadeWorkouts.splice(user.userMadeWorkouts.indexOf(_id), 1);

    const userCollection = await userDB();
    const updatedInfo = await userCollection.updateOne(
        {_id: user._id},
        {$set: {"userMadeWorkouts": user.userMadeWorkouts}}
    );
    if (updatedInfo.modifiedCount < 0) throw "Could not remove userMadeWorkouts successfully";
    return true;
}

async function addUserLikedWorkout(user, userPassword, _id){
    /**
     * Helper function. adds workout ID to user.userLikedWorkouts
     * @param user {Object} user object
     * @param  _id {String} workout UUID
     * @return true if workout id is added to user.userLikedWorkouts
     * @throws Will throw an exception if workout is already in user liked workouts or DB fails.
     */
    user = validation.verifyUser(user);
    userPassword = validation.verifyPassword(userPassword);
    user = await users.checkUser(user.email, userPassword);
    _id = validation.verifyUUID(_id, "Workout id");

    if (user.userLikedWorkouts.includes(_id)) throw "Workout is already in user liked workouts";

    user.userLikedWorkouts.push(_id);

    const userCollection = await userDB();
    const updatedInfo = await userCollection.updateOne(
        {_id: user._id},
        {$set: {"userLikedWorkouts": user.userLikedWorkouts}}
    );
    if (updatedInfo.modifiedCount < 0) throw "Could not add userLikedWorkouts successfully";
    return true;
}

async function removeUserLikedWorkout(user, userPassword, _id){
    /**
     * Helper function. Removes workout ID from user.userLikedWorkouts
     * @param user {Object} user object
     * @param  _id {String} workout UUID
     * @return true if workout id is removed from user.userLikedWorkouts
     * @throws Will throw an exception if workout is not in user liked workouts or DB fails.
     */
    user = validation.verifyUser(user);
    userPassword = validation.verifyPassword(userPassword);
    user = await users.checkUser(user.email, userPassword);
    _id = validation.verifyUUID(_id, "Workout id");

    if (!user.userLikedWorkouts.includes(_id)) throw "Workout is not in user liked workouts";

    user.userLikedWorkouts.splice(user.userLikedWorkouts.indexOf(_id), 1)

    const userCollection = await userDB();
    const updatedInfo = await userCollection.updateOne(
        {_id: user._id},
        {$set: {"userLikedWorkouts": user.userLikedWorkouts}}
    );
    if (updatedInfo.modifiedCount < 0) throw "Could not remove userLikedWorkouts successfully";
    return true;
}

const createComment = async (user, userPassword, _workoutId, message) => {
    /**
     * Helper function for workouts.addCommentToWorkout
     * @param user {Object} user object
     * @param userPassword {String} user password from cookie
     * @param _workoutId {String} workout uuid
     * @param message {String} user message
     * @return comment object inserted into the DB
     * @throws Will throw an exception if params are invalid or db insert fails
     */
    user = validation.verifyUser(user);
    userPassword = validation.verifyPassword(userPassword);
    user = await users.checkUser(user.email, userPassword);

    _workoutId = validation.verifyUUID(_workoutId, "Workout id");
    let workout = await getWorkout(_workoutId); //check if workout exists
    if (workout === null) throw "Workout not found";

    message = validation.verifyMessage(message);

    const commentCollection = await commentDB();
    let newComment = {
        "_id": uuidv4(),
        "currentTime": Date.now(),
        "workout": _workoutId,
        "author": user._id,
        "comment": message
    }
    const insertInfo = await commentCollection.insertOne(newComment);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not add comment";

    const newId = insertInfo.insertedId.toString();
    const comment = await comments.getComment(newId);
    return comment;
}

const deleteComment = async (user, userPassword, _id) => {
    /**
     * Helper function for workouts.removeCommentFromWorkout
     * @param user {Object} user object
     * @param userPassword {String} user password from cookie
     * @param _id {String} valid comment uuid
     * @return true if comment  was successfully deleted
     * @throws will throw an exception if comment could not be deleted or comment is not made by user
     */
    _id = validation.verifyUUID(_id, "Comment id");

    user = validation.verifyUser(user);
    userPassword = validation.verifyPassword(userPassword);
    user = await users.checkUser(user.email, userPassword);

    const comment = await comments.getComment(_id);
    if (comment.author !== user._id) throw "User cannot delete other user's comment";

    const commentCollection = await commentDB();
    const deletionInfo = await commentCollection.deleteOne({_id: _id});

    if (deletionInfo.deletedCount === 0) throw "Could not delete comment";

    return true;
}

const createWorkout = async (user, userPassword, workoutName, intensity, length, exercises) => {
    /**
         * @param user {Object} user object
         * @param userPassword {String} user password from cookie
         * @param workoutName {String} name of the workout
         * @param intensity {int} workout intensity number from 1-5
         * @param length {int} workout length in minutes
         * @param exercises {Array of Objects} list of exercises
         * @return workout object inserted into the DB
         * @throws Will throw an exception if params are invalid, workout name already exists, or db insert fails
         */
     user = validation.verifyUser(user);
     userPassword = validation.verifyPassword(userPassword);
     user = await users.checkUser(user.email, userPassword);
     workoutName = validation.verifyWorkoutName(workoutName);
     intensity = validation.verifyWorkoutIntensity(intensity);
     length = validation.verifyWorkoutLength(length);
     exercises = validation.verifySubExercise(exercises);
     
     const workoutCollection = await workouts();
     const workoutList = await workoutCollection.find({}).toArray();
     workoutList.forEach(workout => {
         if(workout.name.toLowerCase() == workoutName.toLowerCase()) {
             throw `Workout name already exists.`;
         }
     });

     let newWorkout = {
         "_id": uuidv4(),
         "name": workoutName,
         "author": user._id,
         "intensity": intensity,
         "length": length,
         "exercises": exercises,
         "comments": [],
         "usersLiked": []
     }
     const insertInfo = await workoutCollection.insertOne(newWorkout);
     if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not add new workout";

     const newId = insertInfo.insertedId.toString();
     const workout = await getWorkout(newId);
     await addUserMadeWorkout(user, userPassword, newId);
     return workout;
}

const editWorkout = async (_id, user, userPassword, workoutName, intensity, length, exercises) => {
    /**
         * @param _id {String} uuid of workout
         * @param user {Object} user object
         * @param userPassword {String} user password from cookie
         * @param workoutName {String} name of the workout
         * @param intensity {int} workout intensity number from 1-5
         * @param length {int} workout length in minutes
         * @param exercises {Array of Objects} list of exercises
         * @return edited workout object
         * @throws Will throw an exception if params are invalid, workout name already exists, db insert fails, or user tries to edit other user's workout
         */
     user = validation.verifyUser(user);
     userPassword = validation.verifyPassword(userPassword);
     user = await users.checkUser(user.email, userPassword);
     workoutName = validation.verifyWorkoutName(workoutName);
     intensity = validation.verifyWorkoutIntensity(intensity);
     length = validation.verifyWorkoutLength(length);
     exercises = validation.verifySubExercise(exercises);
     let workout = await getWorkout(_id);

     if (workout.author !== user._id) throw "User cannot edit other user's workout";

     const workoutCollection = await workouts();

     const workoutList = await workoutCollection.find({}).toArray();
     workoutList.forEach(workout => {
         if(workout.name.toLowerCase() === workoutName.toLowerCase() && workout._id !== _id) {
             throw `Workout name already exists.`;
         }
     });

     let editedWorkout = {
         "name": workoutName,
         "intensity": intensity,
         "length": length,
         "exercises": exercises,
     }
     const updatedInfo = await workoutCollection.updateOne(
         {_id: _id},
         {$set: editedWorkout}
     );
     if (updatedInfo.modifiedCount < 0) throw "Could not update workout successfully";

     workout = await getWorkout(_id);
     return workout;

}

const deleteWorkout = async (user, userPassword, _id) => {
    /**
         * @param user {Object} user object
         * @param userPassword {String} user password from cookie
         * @param _id {String} valid workout uuid
         * @return true if workout was successfully deleted
         * @throws will throw an exception if workout could not be deleted or workout is not made by user
         */
     let result = await recursiveDelete.deleteWorkout(user, userPassword, _id);
     return result;
}

const getWorkout = async (_id) => {
    /**
     * @param _id {int} workout uuid
     * @return workout object
     * @throws Will throw an exception if workout is not found
     */
    _id = validation.verifyUUID(_id, "Workout id");
    const workoutCollection = await workouts();
    const workout = await workoutCollection.findOne({_id:_id});
    if (workout === null) throw "No workout with that id";
    return workout;
}

const addCommentToWorkout = async (user, userPassword, _workoutId, comment) => {
    /**
         * @param user {Object} user object of the user that will add comment to workout
         * @param userPassword {String} user password of the user that will add comment to workout from cookie
         * @param _workoutId {String} valid workout uuid
         * @param comment {String}
         * @return comment object
         * @throws Will throw an exception if workout is not found or input is invalid
         */
     user = validation.verifyUser(user);
     userPassword = validation.verifyPassword(userPassword);
     user = await users.checkUser(user.email, userPassword);

     _workoutId = validation.verifyUUID(_workoutId, "Workout id");

     comment = validation.verifyMessage(comment);

     let workout = await getWorkout(_workoutId);
     const createdComment = await createComment(user, userPassword, _workoutId, comment);

     workout.comments.push(createdComment._id);

     const workoutCollection = await workouts();
     let editedWorkout = {
         "comments": workout.comments
     }

     const updatedInfo = await workoutCollection.updateOne(
         {_id: _workoutId},
         {$set: editedWorkout}
     );

     if (updatedInfo.modifiedCount < 0) throw "Could not update workout successfully";

     user = await users.getUser(workout.author);
     
     await users.incrementTotalCommentsReceived(user._id);
     return createdComment;
}

const removeCommentFromWorkout = async (user, userPassword, _workoutId, _commentId) => {
    /**
         * @param user {Object} user object of the user that will remove his/her comment from workout
         * @param userPassword {String} user password of the user that will add comment to workout from cookie 
         * @param _workoutId {String} valid workout uuid
         * @param _commentId {String} valid comment uuid
         * @return true if comment was successfully deleted
         * @throws Will throw an exception if workout is not found or input is invalid
         */
     user = validation.verifyUser(user);
     userPassword = validation.verifyPassword(userPassword);
     user = await users.checkUser(user.email, userPassword);

     _workoutId = validation.verifyUUID(_workoutId, "Workout id");

     _commentId = validation.verifyUUID(_commentId, "Comment id");

     const workout = await getWorkout(_workoutId);
     const comment = await comments.getComment(_commentId);

     if (comment.author !== user._id) throw "User cannot remove other user's comment";

     workout.comments.splice(workout.comments.indexOf(comment._id), 1)

     const workoutCollection = await workouts();
     let editedWorkout = {
         "comments": workout.comments
     }

     const updatedInfo = await workoutCollection.updateOne(
         {_id: _workoutId},
         {$set: editedWorkout}
     );

     if (updatedInfo.modifiedCount < 0) throw "Could not update workout successfully";

     workoutAuthor = await users.getUser(workout.author);

     await users.decrementTotalCommentsReceived(workoutAuthor._id);
     await deleteComment(user, userPassword, _commentId);
     return true;
}

const checkIfUserLikedWorkout = async(user, _workoutId) => {
    /**
         * Checks if user liked a workout
         * @param user {Object} user object
         * @param _workoutId {String} workout uuid
         * @return true if user liked workout. false if user did not like workout.
         */
     _workoutId = validation.verifyUUID(_workoutId, "Workout id");
     user = validation.verifyUser(user);
     user = await users.getUser(user._id);
     let workout = await getWorkout(_workoutId);
     return workout.usersLiked.includes(user._id);
}

const addLikeToWorkout = async (user, userPassword, _workoutId) => {
    /**
     * @param user {Object} user object
     * @param userPassword {String} user password from cookie
     * @param _workoutId {String} valid workout UUID
     * @return true if like was successfully added to workout
     * @throws Will throw an exception if user has already liked workout or database function fails
     */
    user = validation.verifyUser(user);
    userPassword = validation.verifyPassword(userPassword);
    user = await users.checkUser(user.email, userPassword);
    let workout = await getWorkout(_workoutId);
    let result = await checkIfUserLikedWorkout(user, workout._id);
    if (result !== false) throw "User already liked workout";
    const workoutCollection = await workouts();


    workout.usersLiked.push(user._id)
    //Update workout.usersLiked
    const updatedInfo = await workoutCollection.updateOne(
        {_id: _workoutId},
        {$set: {usersLiked: workout.usersLiked}}
    );
    if (updatedInfo.modifiedCount < 0) throw "Could not update workout successfully";        

    await addUserLikedWorkout(user, userPassword, _workoutId);
    let workoutAuthor = await users.getUser(workout.author);
    await users.incrementTotalLikes(workoutAuthor._id);
    return true;
}

const removeLikeFromWorkout = async (user, userPassword, _workoutId) => {
    /**
     * @param user {Object} user object
     * @param userPassword {String} user password from cookie
     * @param _workoutId {String} valid workout UUID
     * @return true if like was successfully removed from workout
     * @throws Will throw an exception if user has not liked workout or database function fails
     */
    user = validation.verifyUser(user);
    userPassword = validation.verifyPassword(userPassword);
    user = await users.checkUser(user.email, userPassword);
    let workout = await getWorkout(_workoutId);
    let result = await checkIfUserLikedWorkout(user, workout._id);
    if (result !== true) throw "User has not liked workout";
    const workoutCollection = await workouts();

    workout.usersLiked.splice(workout.usersLiked.indexOf(user._id), 1)

    //Update workout.usersLiked
    const updatedInfo = await workoutCollection.updateOne(
        {_id: _workoutId},
        {$set: {usersLiked: workout.usersLiked}}
    );
    if (updatedInfo.modifiedCount < 0) throw "Could not update workout successfully";
    
    await removeUserLikedWorkout(user, userPassword, _workoutId);
    let workoutAuthor = await users.getUser(workout.author);
    await users.decrementTotalLikes(workoutAuthor._id);
    return true;
}

const copyWorkout = async (user, userPassword, _id) => {
     /**
     * Copies workout and creates a new workout. Does not copy the workouts comments and likes.
     * @param user {Object} user object
     * @param userPassword {String} user password from cookie
     * @param _id {String} uuid of old workout
     * @return new workout object
     */
    _id = validation.verifyUUID(_id, "Workout id");
    user = validation.verifyUser(user);
    userPassword = validation.verifyPassword(userPassword);
    user = await users.checkUser(user.email, userPassword);
    let newWorkout = await getWorkout(_id);
    return await createWorkout(user, userPassword, `${newWorkout.name}_${uuidv4()}`, newWorkout.intensity, newWorkout.length, newWorkout.exercises);
}

module.exports = {
    createWorkout,
    editWorkout,
    deleteWorkout,
    getWorkout,
    addCommentToWorkout,
    removeCommentFromWorkout,
    checkIfUserLikedWorkout,
    addLikeToWorkout,
    removeLikeFromWorkout,
    copyWorkout,
    removeUserMadeWorkout,
    removeUserLikedWorkout
}