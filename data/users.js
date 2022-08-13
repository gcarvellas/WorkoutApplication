const mongoCollections = require('../config/mongoCollections');
const validation = require('./validation');
const { v4 : uuidv4, validate} = require('uuid');
const workoutUser = mongoCollections.workoutUser;
const bcrypt = require('bcryptjs');
const saltRounds = 16;

module.exports = {
    async createUser(email, password, firstName, lastName="", birthDate=new Date(), bio="", weight=0, height=0, frequencyOfWorkingOut=0){
        const workoutUserCollection = await workoutUser();

        email = validation.verifyEmail(email);
        const checkEmail = await workoutUserCollection.findOne({email: email});
        if (checkEmail === null) throw 'Email is already registered!'
        password = validation.verifyPassword(password);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        firstName = validation.verifyFirstName(firstName);
        lastName = validation.verifyLastName(lastName);
        birthDate = validation.verifyBirthDate(birthDate);
        bio = validation.verifyBio(bio);
        weight = validation.verifyWeight(weight);
        height = validation.verifyHeight(height);
        frequencyOfWorkingOut = validation.verifyFrequencyOfWorkingOut(frequencyOfWorkingOut);

        let newUser = {
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
            birthDate: birthDate,
            bio: bio,
            weight: weight,
            height: height,
            frequencyOfWorkingOut: frequencyOfWorkingOut,
            totalLikesReceived: 0,
            totalCommentsReceived: 0
        };

        const insertInfo = await workoutUserCollection.insertOne(newUser);
        if (!insertInfo.acknowleged || !insertInfo.insertedId) throw 'Insert user failed!';
        const newId = insertInfo.insertedId.toString();
        const user = await this.getUser(newId);
        return user;
    },
    async editUser(_id, email, password, firstName, lastName, birthDate, bio, weight, height, frequencyOfWorkingOut){
        _id = validation.verifyUUID(_id, "User ID");
        email = validation.verifyEmail(email);
        password = validation.verifyPassword(password);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        firstName = validation.verifyFirstName(firstName);
        lastName = validation.verifyLastName(lastName);
        birthDate = validation.verifyBirthDate(birthDate);
        bio = validation.verifyBio(bio);
        weight = validation.verifyWeight(weight);
        height = validation.verifyHeight(height);
        frequencyOfWorkingOut = validation.verifyFrequencyOfWorkingOut(frequencyOfWorkingOut);

        const workoutUserCollection = await workoutUser();
        const tempWorkoutUser = this.getUser(_id);
        const updatedWorkoutUser = {
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
            birthDate: birthDate,
            bio: bio,
            weight: weight,
            height: height,
            frequencyOfWorkingOut: frequencyOfWorkingOut,
            totalLikesReceived: tempWorkoutUser.totalLikesReceived,
            totalCommentsReceived: tempWorkoutUser.totalCommentsReceived
        };
        
        const updatedInfo = await workoutUserCollection.updateOne(
            {_id: _id},
            {$set: updatedWorkoutUser}
        );
        if (updatedInfo.modifiedCount === 0) {
            throw 'Could not update workoutUser successfully!';
        }

        return await this.getUser(_id);
    },
    async deleteUser(_id){
        _id = validation.verifyUUID(_id);
        const workoutUserCollection = await workoutUser();
        const deletionInfo = await workoutUserCollection.deleteOne({_id: _id});

        if (deletionInfo.deletedCount === 0) throw `Could not delete band with id of ${_id}`;
        return `${_id} has been successfully deleted!`;
    },
    async checkUser(email, password){
        email = valdiate.verifyEmail(email);
        password = validate.verifyPassword(password);
        const workoutUserCollection = await workoutUser();
        const workoutUser = await workoutUserCollection.findOne({email: email}, {password: password});
        if (workoutUser === null) throw 'Email and Password do not match!'

        return workoutUser;
    },
    async getUser(_id){
        _id = validate.verifyUUID(_id);
        const workoutUserCollection = await workoutUser();
        const workoutUser = await workoutUserCollection.findOne({_id: _id});
        if (workoutUser === null) throw 'No workoutUser with that id!';

        return workoutUser;
    },
    async incrementTotalLikes(_id){
        _id = validate.verifyUUID(_id);
        const workoutUser = await this.getUser(_id);
        workoutUser.totalLikesReceived+=1;
        const workoutUserCollection = await workoutUser();
        const updatedInfo = await workoutUserCollection.updateOne(
            {_id: _id},
            {$set: workoutUser}
        );
        if (updatedInfo.modifiedCount === 0) {
            throw 'Could not increment total likes successfully!';
        }
        return workoutUser.totalLikesReceived;
    },
    async decrementTotalLikes(_id){
        _id = validate.verifyUUID(_id);
        const workoutUser = await this.getUser(_id);
        workoutUser.totalLikesReceived-=1;
        const workoutUserCollection = await workoutUser();
        const updatedInfo = await workoutUserCollection.updateOne(
            {_id: _id},
            {$set: workoutUser}
        );
        if (updatedInfo.modifiedCount === 0) {
            throw 'Could not decrement total likes successfully!';
        }
        return workoutUser.totalLikesReceived;
    },
    async incrementTotalCommentsReceived(_id){
        _id = validate.verifyUUID(_id);
        const workoutUser = await this.getUser(_id);
        workoutUser.totalCommentsReceived+=1;
        const workoutUserCollection = await workoutUser();
        const updatedInfo = await workoutUserCollection.updateOne(
            {_id: _id},
            {$set: workoutUser}
        );
        if (updatedInfo.modifiedCount === 0) {
            throw 'Could not increment total comments successfully!';
        }
        return workoutUser.totalCommentsReceived;
    },
    async decrementTotalCommentsReceived(_id){
        _id = validate.verifyUUID(_id);
        const workoutUser = await this.getUser(_id);
        workoutUser.totalCommentsReceived-=1;
        const workoutUserCollection = await workoutUser();
        const updatedInfo = await workoutUserCollection.updateOne(
            {_id: _id},
            {$set: workoutUser}
        );
        if (updatedInfo.modifiedCount === 0) {
            throw 'Could not increment total comments successfully!';
        }
        return workoutUser.totalCommentsReceived;
    },
    async getWorkoutLogs(_id){
        _id = validate.verifyUUID(_id);
        const workoutUser = await this.getUser(_id);
        return workoutUser.workoutLogs;
    }
}