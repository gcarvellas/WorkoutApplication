const validation = require('./validation');
const users = require('./users');
const workouts = require('./workouts');
const mongoCollections = require('../config/mongoCollections');
const { v4 : uuidv4} = require('uuid');
const workoutLogs = mongoCollections.workoutLogs;
const userDB = mongoCollections.users;

const UUID_V4_REGEX = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/;

module.exports = {
    /**
     * Function for creating a workoutLog from a parentWorkout
     * @param {Object} user 
     * @param userPassword {String} user password from cookie
     * @param {Object} parentWorkout 
     * @param {Object} logInfo 
     * @returns {Object} created workoutLog from DB
     * @throws Will trow an exception if fields invalid
     */
    async createWorkoutLogFromWorkout(user, userPassword, parentWorkout, logInfo){
        //verify user
        user = validation.verifyUser(user); //contains id field we want to save
        user = await users.checkUser(user.email, userPassword);
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
            "logInfo": logInfo,
            "author": user._id
        }

        const insertInfo = await workoutLogsCollection.insertOne(newWorkoutLog);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'could not add new workoutLog';
        
        const newId = insertInfo.insertedId;
        const workoutLog = await this.getWorkoutLog(user, userPassword, newId);
        //my attempt of fixing to wait for addUserMadeWorkoutLog to finish first before returning workoutLog using callback
        //addUserMadeWorkoutLog(user, newId, (val) => {
         //   return workoutLog;
        //})
        //below is the old attempt with addUserMadeWorkoutLog not having callback and just returning true
        //await addUserMadeWorkoutLog(user, newId); //don't know why it's saying await is not needed...

        //add workout logs to user.workoutLogs

        user.workoutLogs.push(workoutLog._id);

        let updatedWorkoutUser = {
            workoutLogs: user.workoutLogs
        };

        const userCollection = await userDB();

        const updatedInfo = await userCollection.updateOne(
            {_id: user._id},
            {$set: updatedWorkoutUser}
        );
        if (updatedInfo.modifiedCount === 0) {
            throw 'Could not update user successfully!';
        }

        return workoutLog;
    },
    /**
     * Function for editing an existing workoutLog
     * @param {Object} user 
     * @param userPassword {String} user password from cookie
     * @param {String} _workoutLogId 
     * @param {Object} logInfo 
     * @returns {Object} edited workoutLog from DB
     * @throws Will throw an exception if fields are invaid, workoutLog can't be found or if user is trying to edit workoutLog that isn't theres
     */
    async editWorkoutLog(user, userPassword, _workoutLogId, logInfo){
        //verify user
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, userPassword);
        //verify _workoutLogId
        _workoutLogId = validation.verifyUUID(_workoutLogId, "Workout log id");

        //verify logInfo
        logInfo = validation.verifyLogInfo(logInfo);

        //get workoutLog from user's workoutLogs
        let oldWorkoutLog = await this.getWorkoutLog(user, userPassword, _workoutLogId);

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
        let workoutLog = await this.getWorkoutLog(user, userPassword, _workoutLogId);

        return workoutLog;
    },
    /**
     * Function that copies an existing workoutLog
     * @param {Object} user 
     * @param userPassword {String} user password from cookie
     * @param {String} _workoutLogId 
     * @returns {Object} copy of an existing workoutLog
     * @throws Will throw an exception if fields are invalid or user is trying to copy workoutLog that isn't theres
     */
    async copyWorkoutLog(user, userPassword, _workoutLogId){
        //verify user
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, userPassword);
        //verify _workoutLogId
        _workoutLogId = validation.verifyUUID(_workoutLogId, "Workout log id");
        
        //get workoutLog from user's workoutLogs
        let newWorkoutLog = await this.getWorkoutLog(user, userPassword, _workoutLogId);

        let parentWorkout = await workouts.getWorkout(newWorkoutLog.workout);

        return await this.createWorkoutLogFromWorkout(user, userPassword, parentWorkout, newWorkoutLog.logInfo);
    },
    /**
     * Function that deletes a workoutLog
     * @param {Object} user 
     * @param userPassword {String} user password from cookie
     * @param {String} _workoutLogId 
     * @returns {Boolean} true if successfully deleted
     * @throws Will throw an exception if fields are invalid or user is trying to delete workoutLog that isn't theres
     */
    async deleteWorkoutLog(user, userPassword, _workoutLogId){
        //verify user
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, userPassword);
        //verify _workoutLogId
        _workoutLogId = validation.verifyUUID(_workoutLogId, "Workout log id");
        let workoutLog = await this.getWorkoutLog(user, userPassword, _workoutLogId);

        const workoutLogsCollection = await workoutLogs();
        if (!workoutLogsCollection) throw 'could not get workoutLogs collection';

        const deleteInfo = await workoutLogsCollection.deleteOne({_id:_workoutLogId});
        if (deleteInfo.deletedCount === 0) throw 'could not delete workoutLog';

        //remove workout logs from user.workoutLogs
        let index = user.workoutLogs.indexOf(_workoutLogId);
        user.workoutLogs.splice(index, 1);
        //user.workoutLogs.pop(_workoutLogId);

        let updatedWorkoutUser = {
            workoutLogs: user.workoutLogs
        };

        const userCollection = await userDB();

        const updatedInfo = await userCollection.updateOne(
            {_id: user._id},
            {$set: updatedWorkoutUser}
        );
        if (updatedInfo.modifiedCount === 0) {
            throw 'Could not update user successfully!';
        }

        return true;

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
    async getWorkoutLog(user, userPassword, _workoutLogId) {
        //verify user
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, userPassword);
        //verify _workoutLogId
        _workoutLogId = validation.verifyUUID(_workoutLogId, "Workout log id");

        const workoutLogsCollection = await workoutLogs();
        if (!workoutLogsCollection) throw 'could not get workoutLogs collection';

        const workoutLog = await workoutLogsCollection.findOne({_id: _workoutLogId});
        if (!workoutLog) throw 'could not find workoutLog for that given uuid';
        if (workoutLog.author !== user._id) throw "User cannot get other user's workout log";

        return workoutLog;
    }
}