const express = require('express');
const data = require('../data');
const validation = data.validation;
const workouts = data.workouts;
const comments = data.comments;
const router = express.Router();
const util = require('./utilities');

//TODO

router
    .route('/workout/:id/comments')
    .put(async (req, res) => {
        let user,password;
        try{
            if (!req.session.user) { 
                return res.status(403).json({error: "Forbidden"});
            }
            let comment = req.body.message;
            comment = validation.verifyMessage(comment);

            let id = req.params.id;
            id = validation.verifyUUID(id, "Workout ID");

            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);

            let commentResult = await workouts.addCommentToWorkout(user, password, id, comment);
            return res.status(200).json({comment: commentResult});
        } catch (e) {
            return res.status(400).json({error: e});
        }
    })
    .delete(async (req, res) => {
        let user,password;
        try{
            if (!req.session.user) {
                return res.status(403).json({error: "Forbidden"});
            }
            let commentId = req.body.commentId;
            commentId = validation.verifyUUID(commentId, "Comment ID");

            let id = req.params.id;
            id = validation.verifyUUID(id, "Workout ID");

            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);

            let commentResult = await workouts.removeCommentFromWorkout(user, id, commentId);
            return res.status(200).json({result: commentResult});
        } catch (e) {
            return res.status(400).json({error: e});
        }
    })
    .patch(async (req, res) => {
        let user, password;
        try{
            if (!req.session.user) {
                return res.status(403).json({error: "Forbidden"});
            }
            let commentId = req.body.commentId;
            commentId = validation.verifyUUID(commentId, "Comment ID");

            let message = req.body.message;
            message = validation.verifyMessage(message);

            [user, password] = await util.getAuthUsernameAndPasswordFromSession(req);

            await comments.editComment(user, password, commentId, message);
            return res.status(200).json({result: true});
        } catch (e) {
            return res.status(400).json({error: e});
        }
    })

module.exports = router;