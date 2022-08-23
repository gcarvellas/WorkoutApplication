const mongoCollections = require("../config/mongoCollections");
const { v4 : uuidv4} = require('uuid');
const users = require('./users');
const validation = require('./validation');
const comments = mongoCollections.comments;

module.exports = {
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
        _workoutId = validation.verifyUUID(_workoutId, "Workout ID");
        const commentCollection = await comments();
        let results = await commentCollection.find({workout: _workoutId});
        results = await results.toArray();
        if (results === null) throw "No comments found";
        return results;
    },
    async editComment(user, userPassword, _id, message){
         /**
         * @param user {Object} user object
         * @param userPassword {String} user password from cookie
         * @param _id {String} uuid of comment
         * @param message {String} new message
         * @return edited comment object
         * @throws Will throw an exception if params are invalid, db insert fails, or user tries to edit other user's comment
         */
        user = validation.verifyUser(user);
        userPassword = validation.verifyPassword(userPassword)
        user = await users.checkUser(user.email, userPassword);

        _id = validation.verifyUUID(_id, "Comment id");

        message = validation.verifyMessage(message);

        let comment = await this.getComment(_id);
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
}