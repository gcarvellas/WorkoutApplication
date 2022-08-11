const validation = require('./validation');
const workout = require('./workouts');
const mongoCollections = require("../config/mongoCollections");
const { v4 : uuidv4} = require('uuid');
const comments = mongoCollections.comments;
const users = require('./users');

module.exports = {
    async createComment(user, _workoutId, message){
        /**
         * Helper function for workouts.addCommentToWorkout
         * @param user {Object} user object
         * @param _workoutId {String} workout uuid
         * @param message {String} user message
         * @return comment object inserted into the DB
         * @throws Will throw an exception if params are invalid or db insert fails
         */
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, user.hashedPassword);

        _workoutId = validation.verifyUUID(_workoutId, "Workout id");
        let workout = await workout.getWorkout(_workoutId); //check if workout exists
        if (workout === null) throw "Workout not found";

        message = validation.verifyMessage(message);

        const commentCollection = await comments();
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
        const comment = await this.getComment(newId);
        return comment;
    },
    async getComment(_id){
        /**
         * @param _id {int} comment uuid
         * @return comment object
         * @throws Will throw an exception if comment is not found
         */
        _id = validation.verifyUUID(_id, "Comment id");
        const commentCollection = await comments();
        const comment = await commentCollection.findOne({_id: _id});
        if (comment === null) throw "No comment found";
        return comment;
    },
    async getCommentsByWorkoutId(_workoutId){
        /**
         * @param _workoutId {int} comment uuid
         * @return array of comment objects
         * @throws Will throw an exception if comment is not found
         */
        _workoutId = validation.verifyUUID(_workoutId, "Workout id");
        let workout = await workout.getWorkout(_workoutId); //check if workout exists
        if (workout === null) throw "Workout not found";

        const commentCollection = await comments();
        (await commentCollection.find({workout: _workoutId})).toArray(function(err, result) {
            if (err) throw err;
            if (result === null) throw "No comments found";
            return result;
        });
    },
    async editComment(user, _id, message){
         /**
         * @param user {Object} user object
         * @param _id {String} uuid of comment
         * @param message {String} new message
         * @return edited comment object
         * @throws Will throw an exception if params are invalid, db insert fails, or user tries to edit other user's comment
         */
        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, user.hashedPassword);

        _id = validation.verifyUUID(_id, "Comment id");

        message = validation.verifyMessage(message);

        let comment = this.getComment(_id);
        if (comment.author !== user._id) throw "User cannot edit other user's comment";

        const commentCollection = await comments();
        let editedComment = {
            "currentTime": Date.now(),
            "comment": message
        }
        const updatedInfo = await commentCollection.updateOne(
            {_id: _id},
            {$set: editedComment}
        );
        if (updatedInfo.modifiedCount < 0) throw "Could not update comment successfully";

        comment = await this.getComment(_id);
        return comment;
    },
    async deleteComment(user, _id){
        /**
         * Helper function for workouts.removeCommentFromWorkout
         * @param user {Object} user object
         * @param _id {String} valid comment uuid
         * @return true if comment  was successfully deleted
         * @throws will throw an exception if comment could not be deleted or comment is not made by user
         */
        _id = validation.verifyUUID(_id, "Comment id");

        user = validation.verifyUser(user);
        user = await users.checkUser(user.email, user.hashedPassword);

        const comment = await this.getComment(_id);
        if (comment.author !== user._id) throw "User cannot delete other user's comment";

        const commentCollection = await comments();
        const deletionInfo = await commentCollection.deleteOne({_id: _id});

        if (deletionInfo.deletedCount === 0) throw "Could not delete comment";

        return true;
    }
}