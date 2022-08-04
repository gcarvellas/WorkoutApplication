const data = require('../data');
const validation = data.validation;

function testUserValidation(){
    const TEST_ID = "    551137c2f9e1fac808a5f572";
    let userInfo = {
        firstName: "    Bob",
        lastName: "     Smith",
        birthDate: new Date('1995-12-17T03:24:00'),
        bio: "      this is a test bio",
        weight: 160,
        height: 72,
        frequencyOfWorkingOut: 3
    };
    let user = {
        _id: TEST_ID,
        userInfo: userInfo,
        email: "   test123@gmail.com",
        hashedPassword: "     TESTHASH$@!)SHF)AH*SHA)*",
        userMadeWorkouts: [TEST_ID, TEST_ID],
        userLikedWorkouts: [TEST_ID, TEST_ID],
        totalLikesReceived: 0,
        totalCommentsReceived: 0,
        workoutLogs: [TEST_ID, TEST_ID]
    }

    console.log(validation.verifyUser(user));
    console.log("Verified user!");
}

testUserValidation();