const validation = require('./validation');
const users = require('./users');
const workouts = require('./workouts');
const mongoCollections = require('../config/mongoCollections');
const { ObjectId } = require('mongodb');
const workoutLogs = mongoCollections.workoutLogs;
const userDB = mongoCollections.users;

/**
 * Helper function that adds workoutLog ID to user.workoutLogs
 * @param {Object} user 
 * @param {String} _id 
 * TODO
 */
async function addUserMadeWorkoutLog(user, _id) {
    //question regarding user.workoutLogs, should we make it just a workoutLogs array or keep it as dict
    //verify user
    user = validation.verifyUser(user);
    user = await users.checkUser(user.email, user.password);
    //verify _id
    _id = validation.verifyID(_id);
    _id = ObjectId(_id);
    //TODO: question from above
    if (_id in user.workoutLogs) throw 'workoutLog is already in user workoutLogs';

    const userCollection = await userDB();
    const updatedInfo = todo
}

/**
 * Helper function that removes workoutLog ID from user.workoutLogs
 * @param {Object} user 
 * @param {String} _id 
 * TODO
 */
async function removeUserMadeWorkoutLog(user, _id) {
    //question regarding user.workoutLogs, should we make it just a workoutLogs array or keep it as dict
    //verify user
    user = validation.verifyUser(user);
    user = await users.checkUser(user.email, user.password);
    //verify _id
    _id = validation.verifyID(_id);
    _id = ObjectId(_id);
    //TODO: question from above
    if (_id in user.workoutLogs) throw 'workoutLog is not in user workoutLogs';

    const userCollection = await userDB();
    const udpatedInfo = todo
}

module.exports = {
    /**
     * Function for creating a workoutLog from a parentWorkout
     * @param {Object} user 
     * @param {Object} parentWorkout 
     * @param {Object} logInfo 
     * @returns {Object} created workoutLog from DB
     * @throws Will trow an exception if fields invalid
     */
    async createWorkoutLogFromWorkout(user, parentWorkout, logInfo){
        //verify user
        user = validation.verifyUser(user); //contains id field we want to save
        user = await users.checkUser(user.email, user.password);
        //verify parentWorkout
        parentWorkout = validation.verifyWorkout(parentWorkout); //contains id field we want to save
        parentWorkout = await workouts.getWorkout(parentWorkout._id);
        //verify logInfo
        logInfo = validation.verifyLogInfo(logInfo);

        const workoutLogsCollection = await workoutLogs();
        if (!workoutLogsCollection) throw 'could not get workoutLogs collection';

        let newWorkoutLog = {
            "workout": parentWorkout._id,
            "logInfo": logInfo
        }

        const insertInfo = await workoutLogsCollection.insertOne(newWorkoutLog);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'could not add new workoutLog';
        
        const newId = insertInfo.insertedId.toString();
        const workoutLog = await this.getWorkoutLog(newId);
        await addUserMadeWorkoutLog(user, newId);

        return workoutLog;
    },
    /**
     * Function for creating a workoutLog without parentWorkout object
     * @param {Object} user 
     * @param {Object} logInfo 
     * @returns {Object} created workoutLog from DB
     * @throws Will throw an exception if fields invalid
     */
    async createWorkoutLogFromScratch(user, logInfo){
        //verify user
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, user.password);
        //verify logInfo
        logInfo = validation.verifyLogInfo(logInfo);
        
        const workoutLogsCollection = await workoutLogs();
        if (!workoutLogsCollection) throw 'could not get workoutLogs collection';

        let newWorkoutLog = {
            "workout": "",
            "logInfo": logInfo
        }

        const insertInfo = await workoutLogsCollection.insertOne(newWorkoutLog);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'could not add new workoutLog';
        
        const newId = insertInfo.insertedId.toString();
        const workoutLog = await this.getWorkoutLog(newId);
        await addUserMadeWorkoutLog(user, newId);

        return workoutLog;
    },
    /**
     * Function for editing an existing workoutLog
     * @param {Object} user 
     * @param {String} _workoutLogId 
     * @param {Object} logInfo 
     * @returns {Object} edited workoutLog from DB
     * @throws Will throw an exception if fields are invaid, workoutLog can't be found or if user is trying to edit workoutLog that isn't theres
     */
    async editWorkoutLog(user, _workoutLogId, logInfo){
        //verify user
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, user.password);
        //verify _workoutLogId
        _workoutLogId = verifyId(_workoutLogId);
        let allWorkoutLogs = await users.getWorkoutLogs(user._id);
        //TODO: line below depends on if it returns array or dict
        if (!allWorkoutLogs.includes(_workoutLogId)) throw 'user cannot edit other user\'s workoutLog';
        //get workoutLog from user's workoutLogs
        let oldWorkoutLog = await this.getWorkoutLog(user, _workoutLogId);

        //verify logInfo
        logInfo = validation.verifyLogInfo(logInfo);

        const workoutLogsCollection = await workoutLogs();
        if (!workoutLogsCollection) throw 'could not get workoutLogs collection';

        let editedWorkoutLog = {
            "workout": oldWorkoutLog.workout,
            "logInfo": logInfo
        }

        const updatedInfo = await workoutLogsCollection.updateOne(
            {_id: ObjectId(_workoutLogId)},
            {$set: editedWorkoutLog}
        );
        if (updatedInfo.modifiedCount < 0) throw 'could not update workoutLog successfully';

        let workoutLog = await this.getWorkoutLog(user, _workoutLogId);
        return workoutLog;
    },
    /**
     * Function that copies an existing workoutLog
     * @param {Object} user 
     * @param {String} _workoutLogId 
     * @returns {Object} copy of an existing workoutLog
     * @throws Will throw an exception if fields are invalid or user is trying to copy workoutLog that isn't theres
     */
    async copyWorkoutLog(user, _workoutLogId){
        //verify user
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, user.password);
        //verify _workoutLogId
        _workoutLogId = verifyId(_workoutLogId);
        let allWorkoutLogs = await users.getWorkoutLogs(user._id);
        //TODO: line below depends on if it returns array or dict
        if (!allWorkoutLogs.includes(_workoutLogId)) throw 'user cannot copy other user\'s workoutLog';
        let newWorkoutLog = await this.getWorkoutLog(user, _workoutLogId);

        return await this.createWorkoutLogFromWorkout(user, newWorkoutLog, newWorkoutLog.logInfo);
    },
    /**
     * Function that deletes a workoutLog
     * @param {Object} user 
     * @param {String} _workoutLogId 
     * @returns {Boolean} true if successfully deleted
     * @throws Will throw an exception if fields are invalid or user is trying to delete workoutLog that isn't theres
     */
    async deleteWorkoutLog(user, _workoutLogId){
        //verify user
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, user.password);
        //verify _workoutLogId
        _workoutLogId = verifyId(_workoutLogId);
        let allWorkoutLogs = await users.getWorkoutLogs(user._id);
        //TODO: line below depends on if it returns array or dict
        if (!allWorkoutLogs.includes(_workoutLogId)) throw 'user cannot delete other user\'s workoutLog';

        const workoutLogsCollection = await workoutLogs();
        if (!workoutLogsCollection) throw 'could not get workoutLogs collection';

        const deleteInfo = await workoutLogsCollection.deleteOne({_id:ObjectId(_id)});
        if (deleteInfo.deletedCount === 0) throw 'could not delete workoutLog';

        await removeUserMadeWorkoutLog(user, _workoutLogId);

        return true;
    },
    /**
     * Function that gets a workoutLog
     * @param {Object} user 
     * @param {String} _workoutLogId 
     * @returns {Object} workoutLog
     * @throws Will throw an exception if fields are invalid, workoutLog can't be found, or user is trying to get workoutLog that isn't theres
     */
    async getWorkoutLog(user, _workoutLogId) {
        //verify user
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, user.password);
        //verify _workoutLogId
        _workoutLogId = verifyId(_workoutLogId);
        let allWorkoutLogs = await users.getWorkoutLogs(user._id);
        //TODO: line below depends on if it returns array or dict
        if (!allWorkoutLogs.includes(_workoutLogId)) throw 'user cannot get other user\'s workoutLog';

        const workoutLogsCollection = await workoutLogs();
        if (!workoutLogsCollection) throw 'could not get workoutLogs collection';

        const workoutLog = workoutLogsCollection.findOne({_id:ObjectId(_workoutLogId)});
        if (!workoutLog) throw 'could not find workoutLog for that given id';

        return workoutLog;
    }
}