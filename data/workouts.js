const validation = require('./validation');
const users = require('./users');
const workoutSearch = require('./workoutSearch');
const mongoCollections = require("../config/mongoCollections");
const { ObjectId } = require('mongodb');
const workouts = mongoCollections.workouts;
const userDB = mongoCollections.users;

async function addUserMadeWorkout(user, _id){
    /**
     * Helper function. adds workout ID to user.userMadeWorkouts
     * @param user {Object} user object
     * @param  _id {String} workout ID
     * @return true if workout id is added to user.userMadeWorkouts
     * @throws Will throw an exception if workout is already in user made workouts or DB fails.
     */
    user = validation.verifyUser(user);
    user = await users.checkUser(user.email, user.password);
    _id = validation.verifyID(_id);
    _id = ObjectId(_id);

    if (_id in user.userMadeWorkouts) throw "Workout is already in user made workouts";

    const userCollection = await userDB();
    const updatedInfo = await userCollection.updateOne(
        {_id: user._id},
        {$set: {"userMadeWorkouts": user.userMadeWorkouts.push(_id)}}
    );
    if (updatedInfo.modifiedCount < 0) throw "Could not add userMadeWorkouts successfully";
    return true;
}

async function removeUserMadeWorkout(user, _id){
    /**
     * Helper function. Removes workout ID from user.userMadeWorkouts
     * @param user {Object} user object
     * @param  _id {String} workout ID
     * @return true if workout id is removed from user.userMadeWorkouts
     * @throws Will throw an exception if workout is not in user made workouts or DB fails.
     */
    user = validation.verifyUser(user);
    user = await users.checkUser(user.email, user.password);
    _id = validation.verifyID(_id);
    _id = ObjectId(_id);

    if (_id in user.userMadeWorkouts) throw "Workout is not in user made workouts";

    const userCollection = await userDB();
    const updatedInfo = await userCollection.updateOne(
        {_id: user._id},
        {$set: {"userMadeWorkouts": user.userMadeWorkouts.pop(_id)}}
    );
    if (updatedInfo.modifiedCount < 0) throw "Could not remove userMadeWorkouts successfully";
    return true;
}

async function addUserLikedWorkout(user, _id){
    /**
     * Helper function. adds workout ID to user.userLikedWorkouts
     * @param user {Object} user object
     * @param  _id {String} workout ID
     * @return true if workout id is added to user.userLikedWorkouts
     * @throws Will throw an exception if workout is already in user liked workouts or DB fails.
     */
    user = validation.verifyUser(user);
    user = await users.checkUser(user.email, user.password);
    _id = validation.verifyID(_id);
    _id = ObjectId(_id);

    if (_id in user.userLikedWorkouts) throw "Workout is already in user liked workouts";

    const userCollection = await userDB();
    const updatedInfo = await userCollection.updateOne(
        {_id: user._id},
        {$set: {"userLikedWorkouts": user.userLikedWorkouts.push(_id)}}
    );
    if (updatedInfo.modifiedCount < 0) throw "Could not add userLikedWorkouts successfully";
    return true;
}

async function removeUserLikedWorkout(user, _id){
    /**
     * Helper function. Removes workout ID from user.userLikedWorkouts
     * @param user {Object} user object
     * @param  _id {String} workout ID
     * @return true if workout id is removed from user.userLikedWorkouts
     * @throws Will throw an exception if workout is not in user liked workouts or DB fails.
     */
    user = validation.verifyUser(user);
    user = await users.checkUser(user.email, user.password);
    _id = validation.verifyID(_id);
    _id = ObjectId(_id);

    if (_id in user.userLikedWorkouts) throw "Workout is not in user liked workouts";

    const userCollection = await userDB();
    const updatedInfo = await userCollection.updateOne(
        {_id: user._id},
        {$set: {"userLikedWorkouts": user.userLikedWorkouts.pop(_id)}}
    );
    if (updatedInfo.modifiedCount < 0) throw "Could not remove userLikedWorkouts successfully";
    return true;
}

module.exports = {
    async createWorkout(user, workoutName, intensity, length, exercises, workoutType){
        /**
         * @param user {Object} user object
         * @param workoutName {String} name of the workout
         * @param intensity {int} workout intensity number from 1-5
         * @param length {int} workout length in minutes
         * @param exercises {Array of Objects} list of exercises
         * @param workoutType {String} workout type
         * @return workout object inserted into the DB
         * @throws Will throw an exception if params are invalid, workout name already exists, or db insert fails
         */
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, user.password);
        workoutName = validation.verifyWorkoutName(workoutName);
        intensity = validation.verifyWorkoutIntensity(intensity);
        length = validation.verifyWorkoutLength(length);
        //TODO need to validate exercise object. Waiting for exercises.js implementation
        //TODO need to validate workoutType. Need to discuss this in a meeting.
        let workoutSearchResults = await workoutSearch.getWorkoutsByName(workoutName);
        if (!Array.isArray(workoutSearchResults)) throw "Unexpected error when checking if workout already exists";
        if (workoutSearchResults !== []) throw "Workout name already exists";
        const workoutCollection = await workouts();
        let newWorkout = {
            "name": workoutName,
            "author": user._id,
            "intensity": intensity,
            "length": length,
            "exercises": exercises,
            "comments": [],
            "usersLiked": [],
            "workoutType": workoutType
        }
        const insertInfo = await workoutCollection.insertOne(newWorkout);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not add new workout";

        const newId = insertInfo.insertedId.toString();
        const workout = await this.getWorkout(newId);
        await addUserMadeWorkout(user, newId);
        return workout;
    },
    async editWorkout(_id, user, workoutName, intensity, length, exercises, workoutType){
        /**
         * @param _id {String} id of workout
         * @param user {Object} user object
         * @param workoutName {String} name of the workout
         * @param intensity {int} workout intensity number from 1-5
         * @param length {int} workout length in minutes
         * @param exercises {Array of Objects} list of exercises
         * @param workoutType {String} workout type
         * @return edited workout object
         * @throws Will throw an exception if params are invalid, workout name already exists, db insert fails, or user tries to edit other user's workout
         */
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, user.password);
        workoutName = validation.verifyWorkoutName(workoutName);
        intensity = validation.verifyWorkoutIntensity(intensity);
        length = validation.verifyWorkoutLength(length);
        //TODO need to validate exercise object. Waiting for exercises.js implementation
        //TODO need to validate workoutType. Need to discuss this in a meeting.
        let workout = await this.getWorkout(_id);

        if (workout.author !== user._id) throw "User cannot edit other user's workout";

        const workoutCollection = await workouts();
        let editedWorkout = {
            "name": workoutName,
            "intensity": intensity,
            "length": length,
            "exercises": exercises,
            "comments": [],
            "usersLiked": [],
            "workoutType": workoutType
        }
        const updatedInfo = await workoutCollection.updateOne(
            {_id: ObjectId(_workoutId)},
            {$set: editedWorkout}
        );
        if (updatedInfo.modifiedCount < 0) throw "Could not update workout successfully";

        workout = await this.getWorkout(_id);
        return workout;

    },
    async deleteWorkout(user, _id){
        /**
         * @param user {Object} user object
         * @param _id {String} valid id
         * @return true if workout was successfully deleted
         * @throws will throw an exception if workout could not be deleted or workout is not made by user
         */
        _id = validation.verifyID(_id);
        user = validation.verifyUser(user);
        user = users.checkUser(user.email, user.hashedPassword);

        const workout = await this.getWorkout(_id);
        if (workout.author !== user._id) throw "User cannot delete other user's workout";

        const workoutCollection = await workouts();
        const deletionInfo = await workoutCollection.deleteOne({_id:ObjectId(_id)});

        if (deletionInfo.deletedCount === 0) throw "Could not delete workout";
        await removeUserMadeWorkout(user, _id);

        return true;

    },
    async getWorkout(_id){
        /**
         * @param _id {int} workout id
         * @return workout object
         * @throws Will throw an exception if workout is not found
         */
        _id = validation.verifyID(_id);
        const workoutCollection = await workouts();
        const workout = await workoutCollection.findOne({_id:ObjectId(_id)});
        if (workout === null) throw "No workout with that id";
        return workout;
    },
    async addCommentToWorkout(user, _workoutId, comment){
        //TODO Can't implement this yet. need to discuss about comment collection.
    },
    async removeCommentFromWorkout(user, _workoutId, comment){
        //TODO Can't implement this yet. need to discuss about comment collection.
    },
    async checkIfUserLikedWorkout(user, _workoutId){
        /**
         * Checks if user liked a workout
         * @param user {Object} user object
         * @param _workoutId {String} workout id
         * @return true if user liked workout. false if user did not like workout.
         */
        _workoutId = validation.verifyID(_workoutId);
        user = validation.verifyUser(user);
        let workout = await this.getWorkout(_workoutId);
        return user._id in workout.usersLiked;
    },
    async addLikeToWorkout(user, _workoutId){
        /**
         * @param user {Object} user object
         * @param _workoutId {String} valid workout ID
         * @return true if like was successfully added to workout
         * @throws Will throw an exception if user has already liked workout or database function fails
         */
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, user.hashedPassword);
        let workout = await this.getWorkout(_workoutId);
        if (await this.checkIfUserLikedWorkout(user, workout._id) !== true) throw "User already liked workout";
        const workoutCollection = await workouts();

        //Update workout.usersLiked
        const updatedInfo = await workoutCollection.updateOne(
            {_id: ObjectId(_workoutId)},
            {$set: {usersLiked: workout.usersLiked.push(user._id)}}
        );
        if (updatedInfo.modifiedCount < 0) throw "Could not update workout successfully";        

        await addUserLikedWorkout(user, _workoutId);
        await users.incrementTotalLikes(user);
        return true;
    },
    async removeLikeFromWorkout(user, _workoutId){
        /**
         * @param user {Object} user object
         * @param _workoutId {String} valid workout ID
         * @return true if like was successfully removed from workout
         * @throws Will throw an exception if user has not liked workout or database function fails
         */
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, user.hashedPassword);
        let workout = await this.getWorkout(_workoutId);
        if (await this.checkIfUserLikedWorkout(user, workout._id) !== false) throw "User has not liked workout";
        const workoutCollection = await workouts();

        //Update workout.usersLiked
        const updatedInfo = await workoutCollection.updateOne(
            {_id: ObjectId(_workoutId)},
            {$set: {usersLiked: workout.usersLiked.pop(user._id)}}
        );
        if (updatedInfo.modifiedCount < 0) throw "Could not update workout successfully";
        
        await removeUserLikedWorkout(user, _workoutId);
        await users.decrementTotalLikes(user);
        return true;
    },
    async copyWorkout(user, _id){
        /**
         * Copies workout and creates a new workout. Does not copy the workouts comments and likes.
         * @param user {Object} user object
         * @param _id {String} id of old workout
         * @return new workout object
         */
        _id = validation.verifyID(_id);
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, user.hashedPassword);
        let newWorkout = await this.getWorkout(_id);
        return await this.createWorkout(user, newWorkout.name, newWorkout.intensity, newWorkout.length, newWorkout.exercises, newWorkout.workoutType);
    }
}