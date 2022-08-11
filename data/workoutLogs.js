const validation = require('./validation');
const users = require('./users');
const workouts = require('./workouts');
const mongoCollections = require('../config/mongoCollections');
const { v4 : uuidv4} = require('uuid');
const workoutLogs = mongoCollections.workoutLogs;
const userDB = mongoCollections.users;

const UUID_V4_REGEX = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/;

/**
 * Helper function that adds workoutLog ID to user.workoutLogs
 * @param {Object} user 
 * @param {String} _workoutLogId
 * @return {Boolean} true if successful
 * @throws Will throw exception if user is invalid or if workoutLog is already in user's workoutLogs
 */
async function addUserMadeWorkoutLog(user, _workoutLogId, callback) {
    //verify user
    user = validation.verifyUser(user);
    user = await users.checkUser(user.email, user.password);
    //verify _workoutLogId
    _workoutLogId = validation.verifyUUID(_workoutLogId);
    if (user.workoutLogs.includes(_workoutLogId)) throw 'user already has a workoutlog under that workoutLogId';

    //add _workoutLogId to user.workoutLogs
    user.workoutLogs.push(_workoutLogId);

    const userCollection = await userDB();
    
    const updatedInfo = await userCollection.updateOne(
        {_id: user._id},
        {$set: {'workoutLogs': user.workoutLogs}}
    );
    if (updatedInfo.modifiedCount < 0) throw 'could not add workoutLogId successsfully';

    callback(true);
}

/**
 * Helper function that removes workoutLog ID from user.workoutLogs
 * @param {Object} user 
 * @param {String} _workoutLogId 
 * @return {Boolean} true if successful
 * @throws Will throw exception if user is invalid, or if workOutlos is not contained in user's workoutLogs
 */
async function removeUserMadeWorkoutLog(user, _workoutLogId, callback) {
    //verify user
    user = validation.verifyUser(user);
    user = await users.checkUser(user.email, user.password);
    //verify _workoutLogId
    _workoutLogId = validation.verifyUUID(_workoutLogId);
    if (!user.workoutLogs.includes(_workoutLogId)) throw 'workoutLog is not in user workoutLogs';

    //remove _workoutLogId from user.workoutLogs
    let workoutLogIdIndex = user.workoutLogs.indexOf(_workoutLogId);
    user.workoutLogs.splice(workoutLogIdIndex, 1);

    const userCollection = await userDB();
    const updatedInfo = await userCollection.updateOne(
        {_id: user._id},
        {$set: {'workoutLogs': user.workoutLogs}}
    );
    if (updatedInfo.modifiedCount < 0) throw 'could not remove workoutLogId successsfully';

    callback(true);
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
            "_id": uuidv4(),
            "workout": parentWorkout._id,
            "logInfo": logInfo
        }

        const insertInfo = await workoutLogsCollection.insertOne(newWorkoutLog);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'could not add new workoutLog';
        
        const newId = insertInfo.insertedId;
        const workoutLog = await this.getWorkoutLog(newId);
        //my attempt of fixing to wait for addUserMadeWorkoutLog to finish first before returning workoutLog using callback
        addUserMadeWorkoutLog(user, newId, (val) => {
            return workoutLog;
        })
        //below is the old attempt with addUserMadeWorkoutLog not having callback and just returning true
        //await addUserMadeWorkoutLog(user, newId); //don't know why it's saying await is not needed...

        //return workoutLog;
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
        _workoutLogId = validation.verifyUUID(_workoutLogId);
        let allWorkoutLogs = await users.getWorkoutLogs(user._id);
        if (!allWorkoutLogs.includes(_workoutLogId)) throw 'user cannot edit other user\'s workoutLog';
        //verify logInfo
        logInfo = validation.verifyLogInfo(logInfo);

        //get workoutLog from user's workoutLogs
        let oldWorkoutLog = await this.getWorkoutLog(user, _workoutLogId);

        const workoutLogsCollection = await workoutLogs();
        if (!workoutLogsCollection) throw 'could not get workoutLogs collection';

        let editedWorkoutLog = {
            "workout": oldWorkoutLog.workout,
            "logInfo": logInfo
        }

        const updatedInfo = await workoutLogsCollection.updateOne(
            {_id: _workoutLogId},
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
        _workoutLogId = validation.verifyUUID(_workoutLogId);
        let allWorkoutLogs = await users.getWorkoutLogs(user._id);
        if (!allWorkoutLogs.includes(_workoutLogId)) throw 'user cannot copy other user\'s workoutLog';
        
        //get workoutLog from user's workoutLogs
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
        _workoutLogId = validation.verifyUUID(_workoutLogId);
        let allWorkoutLogs = await users.getWorkoutLogs(user._id);
        if (!allWorkoutLogs.includes(_workoutLogId)) throw 'user cannot delete other user\'s workoutLog';

        const workoutLogsCollection = await workoutLogs();
        if (!workoutLogsCollection) throw 'could not get workoutLogs collection';

        const deleteInfo = await workoutLogsCollection.deleteOne({_id:_workoutLogId});
        if (deleteInfo.deletedCount === 0) throw 'could not delete workoutLog';

        removeUserMadeWorkoutLog(user, _workoutLogId, (val) => {
            return true;
        });

        //same attempt as in addUserMadeWorkoutLog to fix nested async function issue
        //await removeUserMadeWorkoutLog(user, _workoutLogId);

        //return true;
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
        _workoutLogId = validation.verifyUUID(_workoutLogId);
        let allWorkoutLogs = await users.getWorkoutLogs(user._id);
        if (!allWorkoutLogs.includes(_workoutLogId)) throw 'user cannot get other user\'s workoutLog';

        const workoutLogsCollection = await workoutLogs();
        if (!workoutLogsCollection) throw 'could not get workoutLogs collection';

        const workoutLog = workoutLogsCollection.findOne({_id: _workoutLogId});
        if (!workoutLog) throw 'could not find workoutLog for that given uuid';

        return workoutLog;
    }
}