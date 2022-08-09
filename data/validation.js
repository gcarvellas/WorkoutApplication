
//Constants
const EMAIL_REGEX =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const {ObjectId} = require('mongodb');
const USER_OBJECT_KEYS = Object.freeze(["_id", "userInfo", "email", "hashedPassword", "userMadeWorkouts", "userLikedWorkouts", "totalLikesReceived", "totalCommentsReceived", "workoutLogs"]);
const USER_INFO_OBJECT_KEYS = Object.freeze(["firstName", "lastName", "birthDate", "bio", "weight", "height", "frequencyOfWorkingOut"]);
const WORKOUT_OBJECT_KEYS = Object.freeze(["_id", "name", "author", "intensity", "length", "exercises", "comments", "usersLiked", "workoutType"]);
const EXERCISES_OBJECT_KEYS = Object.freeze(["_id", "user", "name", "muscles"]);
const EXERCISES_SUBOBJECT_KEYS = Object.freeze(["exerciseId", "sets", "repititions", "rest", "comment"]);

module.exports = {
    verifyUser(user){
        /**
         * Verifies user object. A user object must contain:
         * _id {String}
         * userInfo {Object}
         * email {String}
         * hashedPassword {String}
         * userMadeWorkouts {array of Strings}
         * userLikedWorkouts {array of Strings} 
         * totalLikesReceived {int}
         * totalCommentsReceived {int}
         * workoutLogs {array of Strings}
         * @param {Object} user Valid user object
         * @return {Object} valid user object
         * @throws Will throw an exception if Object is invalid
         */
        if (typeof user !== "object") throw "User must be an object";
        this.verifyKeys(user, USER_OBJECT_KEYS);
        user._id = this.verifyID(user._id);
        user.userInfo = this.verifyUserInfo(user.userInfo);
        user.email = this.verifyEmail(user.email);

        //Verify hashed password
        if (typeof user.hashedPassword === 'undefined') throw "Hashed password must be provided";
        if (typeof user.hashedPassword !== "string") throw "Hashed password must be a string";
        user.hashedPassword = user.hashedPassword.trim();
        if (user.hashedPassword.length === 0) throw "Hashed password cannot be an empty string or just spaces";

        //Verify user made workouts
        if (typeof user.userMadeWorkouts === 'undefined') throw "User made workouts must be provided";
        if (!Array.isArray(user.userMadeWorkouts)) throw "User made workouts must be an array of ids";
        user.userMadeWorkouts.forEach(function (val, i){
            if (typeof val !== "string") throw "User made workout ID must be a string";
            user.userMadeWorkouts[i] = val.trim();
            val = val.trim();
            if (!ObjectId.isValid(val)) throw "User made workout ID must be valid";
        });

        //Verify user liked workouts
        if (typeof user.userLikedWorkouts === 'undefined') throw "User liked workouts must be provided";
        if (!Array.isArray(user.userLikedWorkouts)) throw "User liked workouts must be an array of ids";
        user.userLikedWorkouts.forEach(function (val, i){
            if (typeof val !== "string") throw "User liked workout ID must be a string";
            user.userLikedWorkouts[i] = val.trim();
            val = val.trim();
            if (!ObjectId.isValid(val)) throw "User liked workout ID must be valid";
        });

        //Verify total likes received
        if (typeof user.totalLikesReceived === 'undefined') throw "Total likes received must be provided";
        if (!Number.isInteger(user.totalLikesReceived)) throw "Total likes received must be an integer";
        if (user.totalLikesReceived < 0) throw "Total likes received must be a number greater than or equal to 0";
        
        //Verify total comments received
        if (typeof user.totalCommentsReceived === 'undefined') throw "Total comments received must be provided";
        if (!Number.isInteger(user.totalCommentsReceived)) throw "Total comments received must be an integer";
        if (user.totalCommentsReceived < 0) throw "Total comments received must be a number greater than or equal to 0";

        //Verify workout logs
        if (typeof user.workoutLogs === 'undefined') throw "Workout logs must be provided";
        if (!Array.isArray(user.workoutLogs)) throw "Workout logs must be an array of ids";
        user.workoutLogs.forEach(function (val, i) {
            if (typeof val !== "string") throw "Workout log ID must be a string";
            user.workoutLogs[i] = val.trim();
            val = val.trim();
            if (!ObjectId.isValid(val)) throw "Workout log ID must be valid";
        });

        return user;

    },
    verifyID(id){
        /**
         * Verifies a valid Mongo DB ID
         * @param {String} id Valid mongo DB ID
         * @return {String} Valid id
         * @throws Will throw an exception if ID is invalid
         */
        if (typeof id === 'undefined') throw "ID must be provided";
        if (typeof id !== "string") throw "ID must be a string";
        id = id.trim();
        if (id.length === 0) throw "ID cannot be an empty string or just spaces";
        if (!ObjectId.isValid(id)) throw "ID must be valid";
        return id;
    },
    verifyUserInfo(userInfo){
        /**
         * Verifies a valid userInfo object. A userInfo object must contain:
         * firstName {String}
         * lastName {String} (optional)
         * birthDate {Date} (optional)
         * bio {String} (optional)
         * weight {int} (optional)
         * height {int} (optional)
         * frequencyOfWorkingOut {int} (optional)
         * @param {Object} userInfo Valid userInfo object
         * @return {Object} valid userInfo object
         * @throws Will throw an exception if userInfo is invalid
         */
        if (typeof userInfo === 'undefined') throw "userInfo must be provided";
        if (typeof userInfo !== "object") throw "userInfo must be an object";
        this.verifyKeys(userInfo, USER_INFO_OBJECT_KEYS);
        
        //Verify first name
        if (typeof userInfo.firstName === 'undefined') throw "First name must be provided";
        if (typeof userInfo.firstName !== "string") throw "First name must be a string";
        userInfo.firstName = userInfo.firstName.trim();
        if (userInfo.firstName.length === 0) throw "First name cannot be an empty string or just spaces";

        //Verify last name (optional arg)
        if (typeof userInfo.lastName !== 'undefined'){
            if (typeof userInfo.lastName !== "string") throw "Last name must be a string";
            userInfo.lastName = userInfo.lastName.trim();
            if (userInfo.lastName.length === 0) throw "Last name cannot be an empty string or just spaces";
        }

        //Verify birth date (optional arg)
        if (typeof userInfo.birthDate !== 'undefined'){
            if (Object.prototype.toString.call(userInfo.birthDate) !== "[object Date]" || isNaN(userInfo.birthDate)) throw "Birth date must be a date";
        }
        
        //Verify bio (optional arg)
        if (typeof userInfo.bio !== 'undefined'){
            if (typeof userInfo.bio !== "string") throw "Bio must be a string";
            userInfo.bio = userInfo.bio.trim();
            if (userInfo.bio.length === 0) throw "Bio cannot be an empty string or just spaces";
        }

        //Verify weight (optional arg)
        if (typeof userInfo.weight !== 'undefined') this.verifyWeight(userInfo.weight);

        //Verify height (optional arg)
        if (typeof userInfo.height !== 'undefined'){
            if (!Number.isInteger(userInfo.height)) throw "Height must be an integer";
            if (userInfo.height < 0) throw "Height must be greater than or equal to 0";
        }

        //Verify frequency of working out (optional arg)
        if (typeof userInfo.frequencyOfWorkingOut !== 'undefined'){
            if (!Number.isInteger(userInfo.frequencyOfWorkingOut)) throw "Frequency of working out must be an integer";
            if (userInfo.frequencyOfWorkingOut < 0) throw "Frequency of working out must be a number greater than or equal to 0";
        }

        return userInfo;

    },
    verifyWeight(weight){
        /**
         * Verifies a valid weight.
         * @param {int} weight valid weight
         * @return {int} valid weight
         * @throws Will throw an exception if weight is invalid
         */
        if (typeof weight === 'undefined') throw "Weight must be provided";
        if (!Number.isInteger(weight)) throw "Weight must be an integer";
        if (weight < 0) throw "Weight must be a positive value";
        return weight;
    },
    verifyWorkout(workout) {
        /**
         * Verifies Workout object. Workout object must contain:
         * _id {String}
         * name {String}
         * author {String}
         * intensity {Integer bounds: [0, 10]}
         * length {Integer bounds [0, inf]}
         * exercises {Object} contains valid exercise subobject
         * comment {String}
         * @param {Object} workout Valid workout object
         * @return {Object} valid workout object
         * @throws Will throw an exception if workout is invalid
         */
        if (typeof workout === undefined) throw "workout must be provided";
        if (typeof workout !== "object") throw "workout must be an object";
        this.verifyKeys(workout, WORKOUT_OBJECT_KEYS)

        //verify _id 
        this.verifyID(workout._id)

        //verify name
        if (typeof workout.name)
    },
    verifyEmail(email){
        /**
         * Verifies a valid email.
         * @param {String} email valid email
         * @return {String} valid email
         * @throws Will throw an exception if email is invalid
         */
        if (typeof email === 'undefined') throw "Email must be provided";
        if (typeof email !== "string") throw "Email must be a string";
        email = email.trim();
        if (email.length === 0) throw "Email cannot be an empty string or just spaces";
        if (email.match(EMAIL_REGEX)) return email;
        else throw "Email is invalid";
    },
    verifyKeys(obj, keys){
        /**
         * Verify an array only consists of the list of keys
         * @param {Object} obj Object
         * @param {String Array} keys the keys of the array
         * @return {Object} input Object
         * @throws Will throw an exception if there's a key that doesn't belong in the Object
         */
        if (typeof obj === "undefined") throw "Object must be provided";
        if (typeof obj !== "object") throw  "Object input must be an object";

        if (typeof keys === "undefined") throw "keys must be provided";
        if (!Array.isArray(keys)) throw "Key array must be provided";

        Object.keys(obj).forEach(function (val, i) {
            if (!keys.includes(val)) throw `"The input \'${val}\' is not a valid input"`;
        });
    }       
}