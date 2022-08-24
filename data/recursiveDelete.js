const mongoCollections = require('../config/mongoCollections');
const workoutUser = mongoCollections.users;
const commentDB = mongoCollections.comments;
const workoutDB = mongoCollections.workouts;

module.exports = {
    deleteUser: async(user, userPassword) => {
        const users = require('./users');
        const workouts = require('./workouts');
        const validation = require('./validation');
        user = validation.verifyUser(user);
        userPassword = validation.verifyPassword(userPassword);
        user = await users.checkUser(user.email, userPassword);

        //Delete User's Workouts
        for(const workout of user.userMadeWorkouts){
            await workouts.deleteWorkout(user, userPassword, workout);
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

        //Delete Workout

        const workoutCollection = await workoutDB();
        const deletionInfo = await workoutCollection.deleteOne({_id:_id});

        if (deletionInfo.deletedCount === 0) throw "Could not delete workout";
        await workouts.removeUserMadeWorkout(user, userPassword, _id);

        return true;
    }
}