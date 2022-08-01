module.exports = {
    async createWorkout(user, workoutName, intensity, length, exercises, workoutType){
        //TODO
    },
    async editWorkout(_id, user, workoutName, intensity, length, exercises){
        //TODO
    },
    async deleteWorkout(_id){
        //TODO
    },
    async getWorkout(_id){
        //TODO
    },
    async addCommentToWorkout(user, _workoutId, comment){
        //TODO
    },
    async checkIfUserLikedWorkout(user, _workoutId){
        //TODO
    },
    async addLikeToWorkout(user, _workoutId){
        //TODO
    },
    async removeLikeFromWorkout(user, _workoutId){
        //TODO
    },
    async copyWorkout(_id){
        //TODO
    }
}