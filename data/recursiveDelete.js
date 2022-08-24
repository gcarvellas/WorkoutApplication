const mongoCollections = require('../config/mongoCollections');
const workoutUser = mongoCollections.users;
const commentDB = mongoCollections.comments;
const workoutDB = mongoCollections.workouts;
const workoutLogs = mongoCollections.workoutLogs;

module.exports = {
    deleteUser: async(user, userPassword) => {
        const users = require('./users');
        const workouts = require('./workouts');
        const validation = require('./validation');
        const workoutLogs = require('./workoutLogs');
        user = validation.verifyUser(user);
        userPassword = validation.verifyPassword(userPassword);
        user = await users.checkUser(user.email, userPassword);

        //Delete User's Workouts
        for(const workout of user.userMadeWorkouts){
            await workouts.deleteWorkout(user, userPassword, workout);
        }
        
        //Delete User's Workout Logs
        for (const log of user.workoutLogs){
            await workoutLogs.deleteWorkoutLog(user, userPassword, log);
        }

        //Delete User
        const workoutUserCollection = await workoutUser();
        const deletionInfo = await workoutUserCollection.deleteOne({_id: user._id});

        if (deletionInfo.deletedCount === 0) throw `Could not delete user with id of ${user._id}`;
    
        return true;
    },
    deleteWorkout: async(user, userPassword, _id) => {
        const users = require('./users');
        const workouts = require('./workouts');
        const validation = require('./validation');
        _id = validation.verifyUUID(_id, "Workout id");
        user = validation.verifyUser(user);
        userPassword = validation.verifyPassword(userPassword);
        user = await users.checkUser(user.email, userPassword);

        const workout = await workouts.getWorkout(_id);
        if (workout.author !== user._id) throw "User cannot delete other user's workout";

        //Delete Workout Comments
        for (const comment of workout.comments){
            await users.decrementTotalCommentsReceived(workout.author);

            const commentCollection = await commentDB();
            const deletionInfo = await commentCollection.deleteOne({_id: comment});

            if (deletionInfo.deletedCount === 0) throw "Could not delete comment";
        }

        //Delete Workout Likes
        for (const likedUser of workout.usersLiked){
            await users.decrementTotalLikes(user._id);
            let userObj = await users.getUser(likedUser);

            userObj.userLikedWorkouts.splice(userObj.userLikedWorkouts.indexOf(workout._id), 1);

            let updatedWorkoutUser = {userLikedWorkouts: userObj.userLikedWorkouts};

            const workoutUserCollection = await workoutUser();
            const updatedInfo = await workoutUserCollection.updateOne(
                {_id: userObj._id},
                {$set: updatedWorkoutUser}
            );
            if (updatedInfo.modifiedCount === 0) {
                throw 'Could not update workoutUser successfully!';
            }

        }

        //Delete all workout logs from that workout
        
        const workoutUserCollection = await workoutUser();
        let results = await workoutUserCollection.find().toArray();
        for (const user of results){
            for(const log of user.workoutLogs){
                const workoutLogsCollection = await workoutLogs();
                if (!workoutLogsCollection) throw 'could not get workoutLogs collection';
        
                const workoutLog = await workoutLogsCollection.findOne({_id: log});
                if (!workoutLog) throw 'could not find workoutLog for that given uuid';
                if (workoutLog.workout === workout._id){
                    const deleteInfo = await workoutLogsCollection.deleteOne({_id:log});
                    if (deleteInfo.deletedCount === 0) throw 'could not delete workoutLog';

                        //remove workout logs from user.workoutLogs
                    let index = user.workoutLogs.indexOf(log);
                    user.workoutLogs.splice(index, 1);
                    //user.workoutLogs.pop(_workoutLogId);

                    let updatedWorkoutUser = {
                        workoutLogs: user.workoutLogs
                    };

                    const updatedInfo = await workoutUserCollection.updateOne(
                        {_id: user._id},
                        {$set: updatedWorkoutUser}
                    );
                    if (updatedInfo.modifiedCount === 0) {
                        throw 'Could not update user successfully!';
                    }
                }
            }
        }


        //Delete Workout

        const workoutCollection = await workoutDB();
        const deletionInfo = await workoutCollection.deleteOne({_id:_id});

        if (deletionInfo.deletedCount === 0) throw "Could not delete workout";
        await workouts.removeUserMadeWorkout(user, userPassword, _id);

        return true;
    }
}