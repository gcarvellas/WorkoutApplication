const mongoCollections = require('../config/mongoCollections');
const validation = require('./validation');
const { v4 : uuidv4, validate} = require('uuid');
const workoutUser = mongoCollections.users;
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

module.exports = {
    async createUser(email, password, firstName, lastName="", birthDate=new Date(), bio="", weight=0, height=0, frequencyOfWorkingOut=0){
        email = validation.verifyEmail(email);
        password = validation.verifyPassword(password);
        firstName = validation.verifyFirstName(firstName);
        lastName = validation.verifyLastName(lastName);
        birthDate = validation.verifyBirthDate(birthDate);
        bio = validation.verifyBio(bio);
        weight = validation.verifyWeight(weight);
        height = validation.verifyHeight(height);
        frequencyOfWorkingOut = validation.verifyFrequencyOfWorkingOut(frequencyOfWorkingOut);

        const workoutUserCollection = await workoutUser();
        const checkEmail = await workoutUserCollection.findOne({email: email});
        if (checkEmail !== null) throw 'Email is already registered!'

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        let newUser = {
            _id: uuidv4(),
            userInfo: {
                firstName: firstName,
                lastName: lastName,
                birthDate: birthDate,
                bio: bio,
                weight: weight,
                height: height,
                frequencyOfWorkingOut: frequencyOfWorkingOut
            },
            email: email,
            hashedPassword: hashedPassword,
            userMadeWorkouts: [],
            userLikedWorkouts: [],
            totalLikesReceived: 0,
            totalCommentsReceived: 0,
            workoutLogs: []
        };

        const insertInfo = await workoutUserCollection.insertOne(newUser);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Insert user failed!';
        const user = await this.checkUser(newUser.email, password);
        return user;
    },
    async editUser(_id, oldEmail, oldPassword, email, password, firstName, lastName="", birthDate=new Date(), bio="", weight=0, height=0, frequencyOfWorkingOut=0){
        _id = validation.verifyUUID(_id, "User ID");
        old_email = validation.verifyEmail(oldEmail);
        old_password = validation.verifyPassword(oldPassword);
        email = validation.verifyEmail(email);
        password = validation.verifyPassword(password);
        firstName = validation.verifyFirstName(firstName);
        if (lastName !== '') lastName = validation.verifyLastName(lastName);
        birthDate = validation.verifyBirthDate(birthDate);
        if (bio !== '') bio = validation.verifyBio(bio);
        weight = validation.verifyWeight(weight);
        height = validation.verifyHeight(height);
        frequencyOfWorkingOut = validation.verifyFrequencyOfWorkingOut(frequencyOfWorkingOut);

        //Check if user is authorized.
        await this.checkUser(oldEmail, oldPassword);

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const workoutUserCollection = await workoutUser();

        let updatedWorkoutUser = {
            userInfo: {
                firstName: firstName,
                lastName: lastName,
                birthDate: birthDate,
                bio: bio,
                weight: weight,
                height: height,
                frequencyOfWorkingOut: frequencyOfWorkingOut
            },
            email: email,
            hashedPassword: hashedPassword
        };

        const updatedInfo = await workoutUserCollection.updateOne(
            {_id: _id},
            {$set: updatedWorkoutUser}
        );
        if (updatedInfo.modifiedCount === 0) {
            throw 'Could not update workoutUser successfully!';
        }

        return await this.checkUser(updatedWorkoutUser.email, password);
    },
    async deleteUser(user, userPassword){
        //Check if user is authorized.
        user = validation.verifyUser(user);
        user = await this.checkUser(user.email, userPassword);

        const workoutUserCollection = await workoutUser();
        const deletionInfo = await workoutUserCollection.deleteOne({_id: user._id});

        if (deletionInfo.deletedCount === 0) throw `Could not delete user with id of ${user._id}`;
    
        return true;
    },
    async checkUser(email, password){
        email = validation.verifyEmail(email);
        password = validation.verifyPassword(password);
        let workoutUserCollection = await workoutUser();
        const user = await workoutUserCollection.findOne({email: email});
        if (user === null) throw 'Email does not match!';
        let compareToMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!compareToMatch) throw "Password is invalid";

        return user;
    },
    async getUser(_id){
        _id = validation.verifyUUID(_id);
        const workoutUserCollection = await workoutUser();
        const user = await workoutUserCollection.findOne({_id: _id});
        if (user === null) throw 'No workoutUser with that id!';
        user.hashedPassword = null;

        return user;
    },
    async incrementTotalLikes(_id){
        _id = validation.verifyUUID(_id);
        const user = await this.getUser(_id);
        const workoutUserCollection = await workoutUser();
        const updatedInfo = await workoutUserCollection.updateOne(
            {_id: _id},
            {$set: {totalLikesReceived: user.totalLikesReceived+1}}
        );
        if (updatedInfo.modifiedCount === 0) {
            throw 'Could not increment total likes successfully!';
        }
        return user.totalLikesReceived+1;
    },
    async decrementTotalLikes(_id){
        _id = validation.verifyUUID(_id);
        const user = await this.getUser(_id);
        if (user.totalLikesReceived < 1) throw "Total likes received cannot be negative";
        const workoutUserCollection = await workoutUser();
        const updatedInfo = await workoutUserCollection.updateOne(
            {_id: _id},
            {$set: {totalLikesReceived: user.totalLikesReceived-1}}
        );
        if (updatedInfo.modifiedCount === 0) {
            throw 'Could not decrement total likes successfully!';
        }
        return user.totalLikesReceived-1;
    },
    async incrementTotalCommentsReceived(_id){
        _id = validation.verifyUUID(_id);
        const user = await this.getUser(_id);
        const workoutUserCollection = await workoutUser();
        const updatedInfo = await workoutUserCollection.updateOne(
            {_id: _id},
            {$set: {totalCommentsReceived: user.totalCommentsReceived+1}}
        );
        if (updatedInfo.modifiedCount === 0) {
            throw 'Could not increment total comments  successfully!';
        }
        return user.totalCommentsReceived+1;
    },
    async decrementTotalCommentsReceived(_id){
        _id = validation.verifyUUID(_id);
        const user = await this.getUser(_id);
        if (user.totalCommentsReceived < 1) throw "Total comments received cannot be negative";
        const workoutUserCollection = await workoutUser();
        const updatedInfo = await workoutUserCollection.updateOne(
            {_id: _id},
            {$set: {totalCommentsReceived: user.totalCommentsReceived-1}}
        );
        if (updatedInfo.modifiedCount === 0) {
            throw 'Could not decrement total comments successfully!';
        }
        return user.totalCommentsReceived-1;
    },
    async getWorkoutLogs(_id){
        _id = validation.verifyUUID(_id);
        const workoutUser = await this.getUser(_id);
        return workoutUser.workoutLogs;
    }
}