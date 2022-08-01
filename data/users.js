module.exports = {
    async createUser(email, password, firstName, lastName, birthDate, bio, weight, height, frequencyOfWorkingOut){
        //TODO
    },
    async editUser(_id, email, password, firstName, lastName, birthDate, bio, weight, height, frequencyOfWorkingOut){
        //TODO
    },
    async deleteUser(_id){
        //TODO
    },
    async checkUser(email, password){
        //TODO
    },
    async incrementTotalLikes(_id){
        //TODO
    },
    async decrementTotalLikes(_id){
        //TODO
    },
    async incrementTotalCommentsReceived(_id){
        //TODO
    },
    async decrementTotalCommentsReceived(_id){
        //TODO
    },
    async getWorkoutLogs(_id){
        //TODO
    }
}