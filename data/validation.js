
//Constants
const EMAIL_REGEX =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const UUID_V4_REGEX = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/;
const { v4 : uuidv4} = require('uuid');
const USER_OBJECT_KEYS = Object.freeze(["_id", "userInfo", "email", "hashedPassword", "userMadeWorkouts", "userLikedWorkouts", "totalLikesReceived", "totalCommentsReceived", "workoutLogs"]);
const USER_INFO_OBJECT_KEYS = Object.freeze(["firstName", "lastName", "birthDate", "bio", "weight", "height", "frequencyOfWorkingOut"]);
const WORKOUT_OBJECT_KEYS = Object.freeze(["_id", "name", "author", "intensity", "length", "exercises", "comments", "usersLiked"]);
const EXERCISES_OBJECT_KEYS = Object.freeze(["_id", "user", "name", "muscles"]);
const SUBEXERCISES_OBJECT_KEYS = Object.freeze(["exerciseId", "sets", "repititions", "rest", "note"]);

const MUSCLE_GROUPS = ['chest', 'back', 'arms', 'abs', 'legs', 'shoulders'];

function verifyString(str, errorMessage = undefined){
    /**
     * Verifies there's content in the string
     * @param str a string
     * @param errorMessage (optional) If an error is thrown, adds name of variable to error message
     * @return str valid string
     * @throws Will throw a string if string is empty or undefined
     */
    if (typeof errorMessage === 'undefined'){
        errorMessage = "string";
    }
    if (typeof str === "undefined") throw `${errorMessage} must be provided`;
        if (typeof str !== "string") throw `${errorMessage} must be a string`;
        str = str.trim();
        if (str.length === 0) throw `${errorMessage} cannot be an empty string or just spaces`;
        return str;
}

function verifyKeys(obj, keys){
    /**
     * Verify an object only contains a certain list of keys
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

    return obj;
}

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
        verifyKeys(user, USER_OBJECT_KEYS);
        user._id = this.verifyID(user._id);
        user.userInfo = this.verifyUserInfo(user.userInfo);
        user.email = this.verifyEmail(user.email);

        //Verify hashed password
        user.hashedPassword = verifyString(user.hashedPassword, "Hashed password");

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
        id = verifyString(id, "ID");
        if (!ObjectId.isValid(id)) throw "ID must be valid";
        return id;
    },
    verifyUserInfo(userInfo){
        /**
         * Verifies a valid userInfo object. A userInfo object contains:
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
        verifyKeys(userInfo, USER_INFO_OBJECT_KEYS);
        
        //Verify first name
        userInfo.firstName = verifyString(userInfo.firstName, "First name");

        //Verify last name (optional arg)
        if (typeof userInfo.lastName !== 'undefined'){
            userInfo.lastName = verifyString(userInfo.lastName, "Last name");
        }

        //Verify birth date (optional arg)
        if (typeof userInfo.birthDate !== 'undefined'){
            if (Object.prototype.toString.call(userInfo.birthDate) !== "[object Date]" || isNaN(userInfo.birthDate)) throw "Birth date must be a date";
        }
        
        //Verify bio (optional arg)
        if (typeof userInfo.bio !== 'undefined'){
            userInfo.bio = verifyString(userInfo.bio, "Bio");
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
         * Verifies a valid weight. A weight is a positive integer.
         * @param {int} weight valid weight
         * @return {int} valid weight
         * @throws Will throw an exception if weight is invalid
         */
        if (typeof weight === 'undefined') throw "Weight must be provided";
        if (!Number.isInteger(weight)) throw "Weight must be an integer";
        if (weight < 0) throw "Weight must be a positive value";
        return weight;
    },
    /**
     * Verifies number
     * @param {Number} number a number of type numberType
     * @param {String} [errorMessage=Number] (optional) If an error is thrown, adds name of variable to error message
     * @param {String} [numberType=undefined] (optional) specify 'int' if number is an int, if not specified, just checks if number
     * @param {Number} [lowerBound=undefined] (optional) lower bound for number (inclusive)
     * @param {Number} [upperBound=undefined] (optional) upper bound for number (inclusive)
     * @returns {Number} number valid number of numberType
     * @throws Will throw a string if number is invalid or undefined
     */
    verifyNumber(number, errorMessage = undefined, numberType = undefined, lowerBound = undefined, upperBound = undefined) {
        if (typeof errorMessage === 'undefined') {
            errorMessage = 'number';
        }
        if (typeof number === 'undefined') throw `${errorMessage} must be provided`;
        if (typeof numberType === 'undefined') {
            if (typeof number !== 'number') throw `${errorMessage} must be a number`;
        } else if (typeof numberType === 'int') {
            if (!Number.isInteger(number)) throw `${errorMessage} must be an integer`;
        } else throw 'numberType can only have value "int" or "undefined"';
        if (typeof lowerBound !== 'undefined') {
            if (number < lowerBound) throw `${errorMessage} cannot be below ${lowerBound}`;
        }
        if (typeof upperBound !== 'undefined') {
            if (number > upperBound) throw `${errorMessage} cannot be above ${upperBound}`;
        }
        
        return number;
    },
    /**
     * 
     * @param {STRING} uuid valid v4 uuid
     * @param {STRING=} errorMessage 
     * @return {STRING} uuid
     * @throws Will throw an exception if uuid is invalid
     */
    verifyUUID(uuid, errorMessage='undefined') {
        if (typeof errorMessage === 'undefined') {
            errorMessage = 'uuid';
        }
        uuid = verifyString(uuid, errorMessage);
        if (!uuid.match(UUID_V4_REGEX)) throw errorMessage + ' is not a valid v4 UUID';

        return uuid
    },
    /**
     * Verifies Workout object. Workout object must contain:
     * @param {Object} workout Valid workout object
     * @param {String} workout._id
     * @param {String} workout.name
     * @param {String} workout.author
     * @param {Integer} workout.intensity bounds: [0, 5]
     * @param {Integer} workout.length bounds: (0, inf)
     * @param {Object} workout.exercises contains valid subexercise object
     * @param {String} workout.comments contains valid array of comment ids
     * @param {String} workout.usersLiked contains valid array of user ids
     * @return {Object} valid workout object
     * @throws Will throw an exception if workout is invalid
     */
    verifyWorkout(workout) {
        if (typeof workout === 'undefined') throw "workout must be provided";
        if (typeof workout !== "object") throw "workout must be an object";
        verifyKeys(workout, WORKOUT_OBJECT_KEYS)

        //verify _id 
        workout._id = this.verifyWorkoutName(workout._id);
        //verify name
        workout.name = verifyString(workout.name, "Workout name");
        //verify author
        workout.author = verifyUUID(workout.author);
        //verify intensity
        workout.intensity = verifyWorkoutIntensity(workout.intensity);
        //verify length
        workout.length = verifyWorkoutLength(workout.length);
        //verify exercises
        workout.exercises = verifySubExercise(workout.exercises); 
        //verify comments
        if (typeof workout.comments === 'undefined') throw "comments must be provided";
        if (!Array.isArray(workout.comments)) throw "comments must be an array of comment ids";
        workout.comments.forEach((val, i) => {
            //TODO: verify if these exceptions are caught correctly for a forEach
            workout.comments[i] = verifyUUID(workout.comments[i]);
        });
        //verify usersLiked
        if (typeof workout.usersLiked === 'undefined') throw 'usersLiked must be provided';
        if (!Array.isArray(workout.usersLiked)) throw 'usersLiked must be an array of user ids';
        workout.usersLiked.forEach((val, i) => {
            //TODO: verify if these exceptions are caught correctly for a forEach
            workout.usersLiked[i] = verifyUUID(workout.usersLiked[i]);
        });

        return workout;
    },
    /**
     * Verifies a valid exercise (object from exercise collection)
    */
    verifyExercises(exercises) {
        //TODO
    },
    /**
     * Verifies subExercises (which is contained in workout object and workoutLog object)
     * @param {Object} subExercises
     * @param {String} subExercises.exerciseId exercise id
     * @param {Integer} subExercises.sets bounds: [1, inf]
     * @param {Integer} subExercises.repetitions bounds: [1, inf]
     * @param {Integer} subExercises.rest bounds: [0, inf]
     * @param {Integer=} subExercises.weight (optional) bounds: [0, inf]
     * @param {String=} subExercises.note (optional) note
     * @return {Object} valid subExercises object
     * @throws Will throw an exception if there is an issue with any of the fields in subExercises
    */
    verifySubExercise(subExercises) {
        if (typeof subExercises === 'undefined') throw 'subExercises must be provided';
        if (!Array.isArray(exercises)) throw 'subExercises must be an array';

        //verify that each object in subExercises is a valid subExercise
        subExercises.forEach((val, i) => {
            try {
                //TODO: verify if these exceptions are caught correctly for a forEach
                if (typeof val !== 'object') throw 'subExercises item must be an object';
                val = verifyKeys(val, SUBEXERCISES_OBJECT_KEYS)
                //verify exerciseId
                subExercises[i].exerciseId = verifyUUID(subExercises[i].exerciseId, 'subExercises item exerciseId');
                //verify sets
                subExercises[i].sets = verifyNumber(subExercises[i].sets, 'subExercises item sets', 'int', 1, 500);
                //verify repetitions
                subExercises[i].repetitions = verifyNumber(subExercises[i].repetitions, 'subExercises item repetitions', 'int', 1, 500);
                //verify rest
                subExercises[i].rest = verifyNumber(subExericses[i].rest, 'subExercises item rest', 'int', 0, 500);
                //verify weight (optional field)
                if (typeof subExercises[i].weight !== 'undefined') {
                    subExercises[i].weight = verifyNumber(subExercises[i].weight, 'subExercises item weight', 'undefined', 0, 500);
                }
                //verify note (optional field)
                if (typeof subExercises[i].note !== 'undefined') {
                    subExercises[i].note = verifyString(subExercises[i].note, 'subExercises item comment id');
                }
            } catch (e) {
                throw `index ${i} threw exception: ` + e;
            }
        })
        
        return subExercises;
    },
    /**
     * verifies log info
     * @param {Object} logInfo 
     * @param {Date} logInfo.date
     * @param {Integer} logInfo.intensity bounds [0,5]
     * @param {Integer} logInfo.length bounds [0, inf]
     * @param {Object} logInfo.subExercises valid subExcerises object (contained in workout object and workoutLog object)
     * @param {String=} logInfo.comment (optional)
     * @return {Object} logInfo
     * @throws Will throw an exception if logInfo is invalid
    */
    verifyLogInfo(logInfo) {
        if (typeof logInfo === 'undefined') throw 'logInfo must be provided';
        //verify date
        if (typeof logInfo.date === 'undefined') throw 'logInfo date must be provided';
        if (Object.prototype.toString.call(logInfo.date) !== '[object Date]' || isNaN(logInfo.date)) throw 'logInfo date must be a date';
        //verify intensity
        logInfo.intensity = verifyNumber(logInfo.intensity, 'logInfo intensity', 'int', 0, 5);
        //verify length
        logInfo.length = verifyNumber(logInfo.length, 'logInfo length', 'int', 1, 500);
        //verify subExercises
        logInfo.exercises = this.verifySubExercise(logInfo.exercises);
        //verify comment
        if (typeof logInfo.comment !== 'undefined') {
            logInfo.comment = verifyString(logInfo.comment, 'logInfo comment id');
        }
        
        return logInfo;
    },
    verifyEmail(email){
        /**
         * Verifies a valid email.
         * @param {String} email valid email
         * @return {String} valid email
         * @throws Will throw an exception if email is invalid
         */
        email = verifyString(email, "Email");
        if (email.match(EMAIL_REGEX)) return email;
        else throw "Email is invalid";
    },
    verifyWorkoutName(workoutName){
        /**
         * Verifies workout name. Workout name is a non-empty string.
         * @param {String} workoutName the workout name
         * @return {String} valid workout name
         * @throws Will throw an exception if workout name is invalid
         */
        return verifyString(workoutName, "Workout Name");
    },
    verifyWorkoutIntensity(workoutIntensity){
        /**
         * Verifies workout intensity. Workout intensity is an integer between 1-5.
         * @param {int} workoutIntensity the workout intensity
         * @return {int} Valid workout intensity
         * @throws Will throw an exception if workout intensity is invalid
         */
        if (typeof workoutIntensity === "undefined") throw "Workout intensity must be provided";
        if (!Number.isInteger(workoutIntensity)) throw "Workout intensity must be a number";
        if (workoutIntensity < 1 || workoutIntensity > 5) throw "Workout intensity must be a value between 1 and 5.";
        return workoutIntensity;
    },
    verifyWorkoutLength(workoutLength){
        /**
         * Verifies workout length. WOrkout length is a positive number that represents minutes.
         * @param {int} workoutLength
         * @return {int} valid workout length
         * @throws Will throw an exception if workout length is invalid.
         */
        if (typeof workoutLength === "undefined") throw "Workout length must be provided";
        if (!Number.isInteger(workoutLength)) throw "Workout length must be a number";
        if (workoutLength <= 0) throw "Workout length must be a value greater than 0";
        return workoutLength;
    },
    MUSCLE_GROUPS
}