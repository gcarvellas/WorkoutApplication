const { v4 : uuidv4} = require('uuid');

//Constants
const EMAIL_REGEX =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const UUID_V4_REGEX = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/;
const USER_OBJECT_KEYS = Object.freeze(["_id", "userInfo", "email", "hashedPassword", "userMadeWorkouts", "userLikedWorkouts", "totalLikesReceived", "totalCommentsReceived", "workoutLogs"]);
const USER_INFO_OBJECT_KEYS = Object.freeze(["firstName", "lastName", "birthDate", "bio", "weight", "height", "frequencyOfWorkingOut"]);
const WORKOUT_OBJECT_KEYS = Object.freeze(["_id", "name", "author", "intensity", "length", "exercises", "comments", "usersLiked"]);
const EXERCISES_OBJECT_KEYS = Object.freeze(["_id", "user", "name", "muscles", "equipment", "comment"]);
const SUBEXERCISES_OBJECT_KEYS = Object.freeze(["exerciseId", "sets", "repetitions", "rest", "weight", "comment"]);
const MUSCLE_GROUPS = Object.freeze(['chest', 'back', 'arms', 'abs', 'legs', 'shoulders']);
const MAX_HEIGHT = 108;
const MAX_WORKOUT_LENGTH = 240;
const MAX_WORKOUT_INTENSITY = 5;
const MAX_WEIGHT = 1400;

function verifyString(str, variableName = undefined){
    /**
     * Verifies there's content in the string
     * @param str a string
     * @param variableName (optional) If an error is thrown, adds name of variable to error message
     * @return str valid string
     * @throws Will throw a string if string is empty or undefined
     */
    if (typeof variableName === 'undefined'){
        variableName = "String";
    }
    if (typeof str === "undefined") throw `${variableName} must be provided`;
        if (typeof str !== "string") throw `${variableName} must be a string`;
        str = str.trim();
        if (str.length === 0) throw `${variableName} cannot be an empty string or just spaces`;
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

function verifyDate(obj, variableName = undefined){
    /**
     * Verify a date object is of type date
     * @param {Date} obj Date Object
     * @param variableName (optional) If an error is thrown, adds name of variable to error message
     * @return {Date} Date Object
     * @throws Will throw an exception if object is not type Date
     */
    if (variableName === "undefind") {
        variableName = "Date";
    }
    if (typeof obj === "undefined") throw "Object must be provided";
    if (Object.prototype.toString.call(obj) !== '[object Date]') throw `${variableName} must be a date object`;
    return obj
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
        user._id = this.verifyUUID(user._id, "User id");
        user.userInfo = this.verifyUserInfo(user.userInfo);
        user.email = this.verifyEmail(user.email);

        //Verify hashed password
        try{
            user.hashedPassword = verifyString(user.hashedPassword, "Hashed password");
        }
        catch (e) {
            if (user.hashedPassword !== null) throw "Password must be a string or null";
        }

        //Verify user made workouts
        if (typeof user.userMadeWorkouts === 'undefined') throw "User made workouts must be provided";
        if (!Array.isArray(user.userMadeWorkouts)) throw "User made workouts must be an array of ids";
        user.userMadeWorkouts.forEach((userMadeWorkout) => {
            this.verifyUUID(userMadeWorkout, "User made workout ID");
        });

        //Verify user liked workouts
        if (typeof user.userLikedWorkouts === 'undefined') throw "User liked workouts must be provided";
        if (!Array.isArray(user.userLikedWorkouts)) throw "User liked workouts must be an array of ids";
        user.userLikedWorkouts.forEach((userLikedWorkout) => {
            this.verifyUUID(userLikedWorkout, "User liked workout ID");
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
        user.workoutLogs.forEach((workoutLog) => {
            this.verifyUUID(workoutLog, "Workout Log ID");
        });

        return user;

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
        userInfo.bio = this.verifyBio(userInfo.bio);

        //Verify weight (optional arg)
        if (typeof userInfo.weight !== 'undefined') this.verifyWeight(userInfo.weight);

        //Verify height (optional arg)
        if (typeof userInfo.height !== 'undefined'){
            if (!Number.isInteger(userInfo.height)) throw "Height must be an integer";
            if (userInfo.height < 0) throw "Height must be greater than or equal to 0";
            if (userInfo.height > MAX_HEIGHT) throw `Height must be less than ${MAX_HEIGHT}`;
        }

        //Verify frequency of working out (optional arg)
        if (typeof userInfo.frequencyOfWorkingOut !== 'undefined'){
            if (!Number.isInteger(userInfo.frequencyOfWorkingOut)) throw "Frequency of working out must be an integer";
            if (userInfo.frequencyOfWorkingOut < 0) throw "Frequency of working out must be a number greater than or equal to 0";
            if (userInfo.frequencyOfWorkingOut > 7) throw "Frequency of working out cannot be greater than 7";
        }

        return userInfo;

    },
    /**
     * Verifies number
     * @param {Number} number a number of type numberType
     * @param {String} [variableName=Number] (optional) If an error is thrown, adds name of variable to error message
     * @param {String} [numberType=undefined] (optional) specify 'int' if number is an int, if not specified, just checks if number
     * @param {Number} [lowerBound=undefined] (optional) lower bound for number (inclusive)
     * @param {Number} [upperBound=undefined] (optional) upper bound for number (inclusive)
     * @returns {Number} number valid number of numberType
     * @throws Will throw a string if number is invalid or undefined
     */
    verifyNumber(number, variableName = undefined, numberType = undefined, lowerBound = undefined, upperBound = undefined) {
        if (typeof variableName === 'undefined') {
            variableName = 'number';
        }
        if (typeof number === 'undefined') throw `${variableName} must be provided`;
        if (typeof numberType === 'undefined') {
            if (typeof number !== 'number') throw `${variableName} must be a number`;
        } else if (numberType === 'int') {
            if (!Number.isInteger(number)) throw `${variableName} must be an integer`;
        } else throw 'numberType can only have value "int" or "undefined"';
        if (typeof lowerBound !== 'undefined') {
            if (number < lowerBound) throw `${variableName} cannot be below ${lowerBound}`;
        }
        if (typeof upperBound !== 'undefined') {
            if (number > upperBound) throw `${variableName} cannot be above ${upperBound}`;
        }
        
        return number;
    },
    /**
     * 
     * @param {STRING} uuid valid v4 uuid
     * @param {STRING} variableName (optional) If an error is thrown, adds name of variable to error message
     * @return {STRING} uuid
     * @throws Will throw an exception if uuid is invalid
     */
    verifyUUID(uuid, variableName=undefined) {
        if (typeof variableName === 'undefined') {
            variableName = 'Input';
        }
        uuid = verifyString(uuid, variableName);
        if (!uuid.match(UUID_V4_REGEX)) throw variableName + ' is not a valid v4 UUID';

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
        workout.author = this.verifyUUID(workout.author, "Workout author id");
        //verify intensity
        workout.intensity = this.verifyWorkoutIntensity(workout.intensity);
        //verify length
        workout.length = this.verifyWorkoutLength(workout.length);
        //verify exercises
        workout.exercises = this.verifySubExercise(workout.exercises); 
        //verify comments
        if (typeof workout.comments === 'undefined') throw "comments must be provided";
        if (!Array.isArray(workout.comments)) throw "comments must be an array of comment ids";
        workout.comments.forEach((val, i) => {
            //TODO: verify if these exceptions are caught correctly for a forEach
            workout.comments[i] = this.verifyUUID(workout.comments[i], "Comment id");
        });
        //verify usersLiked
        if (typeof workout.usersLiked === 'undefined') throw 'usersLiked must be provided';
        if (!Array.isArray(workout.usersLiked)) throw 'usersLiked must be an array of user ids';
        workout.usersLiked.forEach((val, i) => {
            //TODO: verify if these exceptions are caught correctly for a forEach
            workout.usersLiked[i] = this.verifyUUID(workout.usersLiked[i], "User id");
        });

        return workout;
    },
    /**
     * Verifies a valid exercise (object from exercise collection)
    */
    verifyExercise(exercise) {
        if (typeof exercise === 'undefined') throw "workout must be provided";
        if (typeof exercise !== "object") throw "workout must be an object";
        verifyKeys(exercise, EXERCISES_OBJECT_KEYS);

        // verify _id
        exercise._id = this.verifyUUID(exercise._id, "Exercise id");
        // verify user
        exercise.user = this.verifyUUID(exercise.user, "Exercise user id");
        // verify name
        exercise.name = verifyString(exercise.name, "Exercise name");
        // verify muscles
        if (typeof exercise.muscles === 'undefined') throw 'muscles must be provided';
        if (!Array.isArray(exercise.muscles)) throw 'muscles must be an array of strings';
        exercise.muscles.forEach((muscle_group) => {
            verifyString(muscle_group);
            if(!MUSCLE_GROUPS.includes(muscle_group.toLowerCase())) throw `The input "${muscle_group}" is not a valid muscle group`;
        }); 

        if (typeof exercise.equipment !== 'undefined') {
            if(!Array.isArray(exercise.equipment)) throw 'equipment must be an array of strings';
            exercise.equipment.forEach((single_equipment) => {
                verifyString(single_equipment);
            });
        }

        if (typeof exercise.note !== 'undefined') {
            exercise.note = verifyString(exercise.note, "Exercise note");
        }

        return exercise;
    },
    /**
     * Verifies subExercises (which is contained in workout object and workoutLog object)
     * @param {Object} subExercises
     * @param {String} subExercises.exerciseId exercise id
     * @param {Integer} subExercises.sets bounds: [1, inf]
     * @param {Integer} subExercises.repetitions bounds: [1, inf]
     * @param {Integer} subExercises.rest bounds: [0, inf]
     * @param {Integer} subExercises.weight (optional) bounds: [0, inf]
     * @param {String=} subExercises.note (optional) note
     * @return {Object} valid subExercises object
     * @throws Will throw an exception if there is an issue with any of the fields in subExercises
    */
    verifySubExercise(subExercises) {
        if (typeof subExercises === 'undefined') throw 'subExercises must be provided';
        if (!Array.isArray(subExercises)) throw 'subExercises must be an array';

        //verify that each object in subExercises is a valid subExercise
        
        subExercises.forEach((val, i) => {
            try {
                //TODO: verify if these exceptions are caught correctly for a forEach
                if (typeof val !== 'object') throw 'subExercises item must be an object';
                val = verifyKeys(val, SUBEXERCISES_OBJECT_KEYS)
                //verify exerciseId
                subExercises[i].exerciseId = this.verifyUUID(subExercises[i].exerciseId, 'subExercises item exerciseId');
                //verify sets
                subExercises[i].sets = this.verifyNumber(subExercises[i].sets, 'subExercises item sets', 'int', 1, 500);
                //verify repetitions
                subExercises[i].repetitions = this.verifyNumber(subExercises[i].repetitions, 'subExercises item repetitions', 'int', 1, 500);
                //verify rest
                subExercises[i].rest = this.verifyNumber(subExercises[i].rest, 'subExercises item rest', 'int', 0, 500);
                //verify weight (optional field)
                if (typeof subExercises[i].weight !== 'undefined') {
                    subExercises[i].weight = this.verifyNumber(subExercises[i].weight, 'subExercises item weight', undefined, 0, 500);
                }
                //verify note (optional field)
                if (typeof subExercises[i].note !== 'undefined') {
                    subExercises[i].note = this.verifyString(subExercises[i].note, 'subExercises item comment id');
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
     * @param {Object} logInfo.exercises valid subExcerises object (contained in workout object and workoutLog object)
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
        logInfo.intensity = this.verifyNumber(logInfo.intensity, 'logInfo intensity', 'int', 0, 5);
        //verify length
        logInfo.length = this.verifyNumber(logInfo.length, 'logInfo length', 'int', 1, 500);
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
        email = verifyString(email, "Email").toLowerCase();
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
        if (workoutIntensity < 1 || workoutIntensity > MAX_WORKOUT_INTENSITY) throw `Workout intensity must be a value between 1 and ${MAX_WORKOUT_INTENSITY}.`;
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
        if (workoutLength > MAX_WORKOUT_LENGTH) throw `Workout length must be less than ${MAX_WORKOUT_LENGTH}`;
        return workoutLength;
    },
    verifyMessage(message){
        /**
         * Verifies message is a string.
         * @param {String} message a non-empty string
         * @return {String} trimmed string
         * @throws Will throw an exception if message is invalid
         */
        return verifyString(message);
    },
    verifyPassword(password){
        /**
         * Verifies password is a string.
         * @param {String} password a non-empty string
         * @return {String} trimmed string
         * @throws Will throw an exception if password is invalid
         */
        return verifyString(password, "Password");
    },
    verifyFirstName(firstName){
        /**
         * Verifies first name is a string.
         * @param {String} firstName a non-empty string
         * @return {String} trimmed string
         * @throws Will throw an exception if firstName is invalid
         */
        return verifyString(firstName, "First Name");
    },
    verifyLastName(lastName){
        /**
         * Verifies last name is a string.
         * @param {String} lastName a non-empty string
         * @return {String} trimmed string
         * @throws Will throw an exception if lastName is invalid
         */
        return verifyString(lastName, "Last Name");
    },
    verifyBirthDate(birthDate){
        /**
         * Verifies birthDate is a date object.
         * @param {Date} birthDate a date object
         * @return {Date} date object
         * @throws Will throw an exception if birthDate is invalid
         */
        if (typeof birthDate !== "object") throw "Birth Date must be a Date object";
        
        birthDate = verifyDate(birthDate, "Birth Date");
        //see if user is at least 13 years old and not above 120
        let today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
            years--;
        }
        if (years < 13) {
            throw 'user\'s birthdate is below 13 years of age';
        }
        if (years > 120) {
            throw 'user\'s birthdate is above 120 years of age';
        }

        return birthDate;
    },
    verifyBio(bio){
        /**
         * Verifies bio is a string.
         * @param {String} bio a non-empty string
         * @return {String} trimmed string
         * @throws Will throw an exception if bio is invalid
         */
        if (typeof bio === "string" && bio.trim() === '') return bio;
        return verifyString(bio, "Bio");

    },
    verifyWeight(weight){
        /**
         * Verifies weight is an integer.
         * @param {Integer} weight a non-empty integer
         * @return {Integer} integer
         * @throws Will throw an exception if weight is invalid
         */
        return this.verifyNumber(weight, "Weight", "int", 0, MAX_WEIGHT);
    },
    verifyHeight(height){
        /**
         * Verifies height is an integer.
         * @param {Integer} height a non-empty integer
         * @return {Integer} integer
         * @throws Will throw an exception if height is invalid
         */
        return this.verifyNumber(height, "Height", "int", 0, MAX_HEIGHT);
    },
    verifyFrequencyOfWorkingOut(frequencyOfWorkingOut){
        /**
         * Verifies frequencyOfWorkingOut is an integer.
         * @param {Integer} frequencyOfWorkingOut a non-empty integer
         * @return {Integer} integer
         * @throws Will throw an exception if frequencyOfWorkingOut is invalid
         */
        return this.verifyNumber(frequencyOfWorkingOut, "frequencyOfWorkingOut", "int", 0, 7);
    },
    
    
    MUSCLE_GROUPS,
    MAX_HEIGHT,
    MAX_WORKOUT_LENGTH,
    MAX_WORKOUT_INTENSITY,
    MAX_WEIGHT
}