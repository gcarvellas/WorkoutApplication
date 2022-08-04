module.exports = {
/*
workoutLog Object:
{
	“_id” : “6b76eef3-d4c0-4f36-b2a8-645e39e8ecf1”,
	“workout” : “d3cfef5e-ebc3-4b95-9053-d26ecaf199cc”,
	“logInfo”: [
    {
		“date”: Date(),
		“intensity” : 3,
		“length” : 65,
		“exercises” : [{
            “exerciseId” : “70bf5aad-2c71-4466-aa23-e1c8bb22c4e0”, 
            “sets” : 2,
            “repetitions” : 10,
        
            “rest” : 60, 
        
            “weight” : 30, (optional)
        
            “comment”: “7b76eef3-d4c0-4f26-b2a8-645e39e8ecf3”
        }],
        “comment” : “6b76eef3-d4c0-4f36-b2a8-645e39e8ecf1”
    }
}

*/

    //function for creating a new workoutlog from a workout
    //user, parentWorkout, and logInfo are required parameters
    //types of paramters:
    //  user = Object (from express-session)
    //  parentWorkout = Object (specifically a Workout object) contains _id, name, author, intensity, length, exercises, comments, usersLiked, and workoutType
    //  logInfo = Object contains date, intensity, length, exercises, and comment
    async createWorkoutLogFromWorkout(user, parentWorkout, logInfo){
        //verify user is provided
        if (!user) {
            throw 'user must be provided.';
        }
        //verify user is an object
        if (Array.isArray(user) || typeof(user) !== object) {
            throw 'user must be object';
        }
        //verify user contains correct fields
        if (!user._id) { //TODO: maybe verify all fields are correct
            
        }

        //verify parentWorkout is provided
        if (!parentWorkout) {
            throw 'parentWorkout must be provided';
        }
        //verify parentWorkout is an object
        if (Array.isArray(parentWorkout) || typeof(parentWorkout) !== object) {
            throw 'parentWorkout must be an object';
        }
        //
        
    },
    async createWorkoutLogFromScratch(user, logInfo){
        //TODO
    },
    async editWorkoutLog(user, _workoutLogId, logInfo){
        //TODO
    },
    async copyWOrkoutLog(user, _workoutLogId){
        //TODO
    },
    async deleteWorkoutLog(user, _workoutLogId){
        //TODO
    }
}