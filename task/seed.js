const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const validation = data.validation;
const users = data.users;
const workoutLogs = data.workoutLogs;
const workouts = data.workouts;
const exercises = data.exercises;
const commentData = data.comments;

async function main() {
    console.log('Seeding database...');
    const db = await dbConnection.dbConnection();
    await db.dropDatabase();

    let userData = { //Object where the key is the user email and the value is the password
        "admin@gmail.com": {
            firstName: "Admin",
            lastName: "User",
            birthDate: new Date("March 23, 1994"),
            bio: undefined,
            weight: 142,
            height: 57,
            frequencyOfWorkingOut: 0,
            password: "password123"
        },
        "panda.zali@gmail.com": {
            firstName: "Colton",
            lastName: "Madison",
            birthDate: new Date("October 15, 1999"),
            bio: "I'm new to working out and I would love to meet people and find some exercises on this platform!",
            weight: 174,
            height: 59,
            frequencyOfWorkingOut: 3,
            password: "74n$RuS%SIb1"
        },
        "hsan.fidan200@gmail.com": {
            firstName: "Hsan",
            lastName: "Fidan",
            birthDate: new Date("October 17, 1990"),
            bio: "I've been working out for 10 years. I want to share my workouts to the world.",
            weight: 160,
            height: 73,
            frequencyOfWorkingOut: 5,
            password: "2018hfask"
        },
        "boxzedit77@gmail.com": {
            firstName: "Micky",
            lastName: "Dianna",
            birthDate: new Date("May 2, 1986"),
            bio: "I work out casually just to stay fit, but I can't find any exercises :(. I hope to find some here!",
            weight: 180,
            height: 66,
            frequencyOfWorkingOut: 2,
            password: "ylvbursa77"
        },
        "yusuf_koroglu1238@gmail.com": {
            firstName: "Yusuf",
            lastName: "Koroglu",
            birthDate: new Date("October 4, 1967"),
            bio: "Personal trainer in the US. I use this platform to share my exercises to students and to get feedback from other people!",
            weight: 150,
            height: 65,
            frequencyOfWorkingOut: 3,
            password: "bayburt691238"
        },
        "axundova010@gmail.com": { 
            firstName: "Jake",
            lastName: "Porter",
            birthDate: new Date("October 17, 1990"),
            bio: "Member of the national exercise trainers association in the US as of 2018",
            weight: 130,
            height: 62,
            frequencyOfWorkingOut: 4,
            password: "silaali321",
        },
        "yasar_tuzun3@gmail.com": {
            firstName: "Yasar",
            lastName: "Tuzun",
            birthDate: new Date("November 29, 1990"),
            bio: "I am new to this platform I would like to learn new exercises",
            weight: 156,
            height: 66,
            frequencyOfWorkingOut: 2,
            password: "53822114ya"
        },
        "kkzz.damla_04@gmail.com": {
            firstName: "Edward",
            lastName: "Collins",
            birthDate: new Date("June 23, 1970"),
            bio: undefined,
            weight: 150,
            height: 66,
            frequencyOfWorkingOut: 4,
            password: "damla04kkz"
        },
        "bakicansenturk4615@gmail.com": {
            firstName: "Josh",
            lastName: "Parker",
            birthDate: new Date("July 24, 1904"),
            bio: undefined,
            weight: 172,
            height: 68,
            frequencyOfWorkingOut: 1,
            password: "2020senturk"
        },
        "nicholas.read5249@gmail.com": {
            firstName: "Nicholas",
            lastName: "Read",
            birthDate: new Date("November 11, 1998"),
            bio: "I play a lot of sports and I've been exercising since I was a little kid",
            weight: 190,
            height: 73,
            frequencyOfWorkingOut: 4,
            password: "321ssk49"
        }
    }

    for(const [email, user] of Object.entries(userData)){
        const userResult = await users.createUser(email, user.password, user.firstName, user.lastName, user.birthDate, user.bio, user.weight, user.height, user.frequencyOfWorkingOut);
        userData[email].object = userResult;
    }

    let exerciseData = {
        "Push Ups": {
            "muscles": ["shoulders", "arms", "chest", "abs"],
            "equipment": [],
            "note": "STEPS:\n1.Get down on all fours, placing your hands slightly wider than your shoulders.\n2.Straighten your arms and legs.\n3.Lower your body until your chest nearly touches the floor.\n4. Pause, then push yourself back up.\n5. Repeat.",
            "author": "admin@gmail.com"
        },
        "Lateral Lunge": {
            "muscles": ["legs"],
            "equipment": [],
            "note": "STEPS:\n1.Stand with your feet hip-width apart.\n2.Take a big step to the side with your left leg, then bend your left knee, push hips back and lower until your left knee is bent 90 degrees. This should take around two seconds. Push back to the start. You can alternate, or complete all reps on your left before moving on to your right.",
            "author": "admin@gmail.com"
        },
        "Scorpion": {
            "muscles": ["abs", "legs"],
            "equipment": [],
            "note": "STEPS:\n1.Stand up straight and lift your leg up behind you.\n2.Grab the outer side of your back foot with the hand from the same side.\n3.Push your back foot up towards the ceiling.\n4.Push your leg higher with your arm as you turn your elbow outward.\n5.Grab your back leg with your outer hand.\n6.Use a stunt strap to improve your flexibility and posture.",
            "author": "admin@gmail.com"
        },
        "Single-leg deadlift": {
            "muscles": ["legs", "abs"],
            "equipment": ["dumbbell"],
            "note": "STEPS:\n1.Begin standing with your feet hip-width apart and parallel. Hold two dumbbells in your hand down in front of you.\n2.Lean forward in your hips, shifting your weight onto one leg while your other leg engages and starts to extend straight behind you.\n3.Lift your extended leg and pitch your body forward until your body forms a \"T\" shape. Your arms should be hanging straight down, holding onto the weight. Keep a slight bend in your standing leg. Slowly bring in your extended leg and return to starting position. Repeat with other leg.",
            "author": "admin@gmail.com"
        },
        "Hammer Curl": {
            "muscles": ["arms", "shoulders"],
            "equipment": ["dumbbell"],
            "note": "STEPS:\n1.Hold a dumbbell in each hand with palms facing your sides and arms extended straight down.\n2.Keeping your upper arms against your sides, curl both weights at the same time, minimizing momentum used during the curl.",
            "author": "axundova010@gmail.com"
        },
        "Dip": {
            "muscles": ["chest", "shoulders", "arms"],
            "equipment": ["Dip bar"],
            "note": "STEPS:\n1.Use dip bar as you extend your legs out in front of you.\n2.Lower your body until your upper arms are parallel to the floor, but no lower.\n3.Extend your elbows to come up.",
            "author": "axundova010@gmail.com"
        },
        "Neutral-grip Triceps Extension": {
            "muscles": ["chest", "shoulders", "arms"],
            "equipment": ["bench", "dumbbell"],
            "note": "STEPS:\n1.Lie back on a bench or the floor holding a dumbbell in each hand with palms facing each other.\n2.Press the weights over your chest, then bend your elbows to lower the weights.\n3.Extend your elbows.\n4.Keep your elbows facing the ceiling the entire set.",
            "author": "axundova010@gmail.com"
        },
        "Back Squat": {
            "muscles": ["legs"],
            "equipment": ["barbell"],
            "note": "STEPS:\n1.Load a barbell on your traps and stand with your feet shoulder-width apart. Your gaze should be ahead, your chest should be proud, and your toes should be pointed slightly out.\n2.Sit back into your hips, bend your kness, and drop down toward the floor. Ensure that your knees move slightly out, and do not collapse in.\n3.Lower until your thighs are parallel to the ground - or as far down as your mobility allows - then push back up to the starting point.",
            "author": "yusuf_koroglu1238@gmail.com"
        },
        "Front Squat": {
            "muscles": ["legs"],
            "equipment": ["barbell"],
            "note": "STEPS:\n1.Load a barbell onto the front of your shoulders, hooking your fingers in an underhand grip on either side of your shoulders to support it. Push your elbows up and keep your gaze ahead.\n2. Sit back into your hips, bend your kness, and lower down toward the floor. Ensure that your kness track out and your chest stays proud, resisting the pull to fall forward.\n3.Lower until your thighs are parallel to the ground - or as far down as your mobility allows - then push back up to the starting position.",
            "author": "yusuf_koroglu1238@gmail.com"
        },
        "Romanian Deadlift": {
            "muscles": ["legs"],
            "equipment": ["barbell"],
            "note": "STEPS:\n1.Hold a barbell. Keep your back straight and your gaze straight throughout the movement.\n2.Begin to hinge forward at your hips, lowering your weight toward the ground with a slight bend in your knees. Allow the weights to closely follow the line of your legs, and lower until you feel a stretch in your hamstring.",
            "author": "yusuf_koroglu1238@gmail.com"
        },
        "Incline Bench Press": {
            "muscles": ["chest"],
            "equipment": ["bench", "bar"],
            "note": "Lie back and place your hands on the bar, slightly wider than shoulder-width apart, with your palms facing up. Lift the bar out of the rack and press it up until your arms are extended and your hands are above your shoulders. Slowly lower the bar to your chest, then press it back up again.",
            "author": "hsan.fidan200@gmail.com"
        },
        "Dumbbell Bench Press": {
            "muscles": ["chest"],
            "equipment": ["dumbbell", "bench"],
            "note": "Set up a bench at an incline of 30-45° and sit with your feet flat on the floor and your back on the bench. Lift the dumbbells to chest height with your palms facing forwards. Breathe out and push the dumbbells up until your arms are fully extended, using your pecs to power the movement. Don't let the dumbbells touch.",
            "author": "hsan.fidan200@gmail.com"
        },
        "Decline Press": {
            "muscles": ["chest"],
            "equipment": ["vertical press machine"],
            "note": "Grip the bar with your palms facing forward, arms slightly wider than shoulder-width apart. Straighten your arms to lift the barbell from the rack. Move it over your shoulders, locking your elbows. Inhale and slowly lower the barbell until it touches your mid-chest, keeping your elbows 45 degrees from your body.",
            "author": "hsan.fidan200@gmail.com"
        },
        "Quad Stretch": {
            "muscles": ["legs"],
            "equipment": [],
            "note": "STEPS:\n1.Stand and hold onto a wall or the back of a chair for balance if needed.\n2.Grab the top of the left foot and bend your knee, bringing the foot towards the glutes, knee pointing straight at the floor. You should feel a stretch down the front of your leg.\n3.Squeeze your hips forward for a deeper stretch.\n4.Hold for 15 to 30 seconds and switch sides, repeating one to three times per leg.",
            "author": "admin@gmail.com"
        },
        "Chest and Shoulder Stretch": {
            "muscles": ["chest", "shoulders"],
            "equipment": [],
            "note": "STEPS:\n1.Sit or stand and clasp your hands together behind your back, arms straight.\n2.Lift your hands towards the ceiling, going only as high as is comfortable. You should feel a stretch in your shoulders and chest.\n3.Hold for 15 to 30 seconds, repeating one to three times.",
            "author": "admin@gmail.com"
        },
        "Upper Back Stretch": {
            "muscles": ["chest"],
            "equipment": [],
            "note": "STEPS:\n1.Clasp your hands together in front of you and round your back, pressing your arms away from your body to feel a stretch in your upper back.\n2.Contract the abs to get the most out of this stretch.\n3.Hold for 15 to 30 seconds, repeating one to three times.",
            "author": "admin@gmail.com"
        },
        "Triceps Stretch": {
            "muscles": ["arms"],
            "equipment": [],
            "note": "STEPS:\n1.Bend your right elbow behind your head and use the right hand to gently pull the left elbow in further until you feel a stretch in your triceps.\n2.Hold for 15 to 30 seconds and switch sides, repeating one to three times.",
            "author": "admin@gmail.com"
        }

    }

    for (const [name, exercise] of Object.entries(exerciseData)){
        const exerciseResult = await exercises.createExercise(userData[exercise.author].object, userData[exercise.author].password, name, exercise.muscles, exercise.equipment, exercise.note);
        exerciseData[name].object = exerciseResult;
    }

    const getId = (key) => exerciseData[key].object._id;

    let workoutData = {
        "Basic Workout for Beginners": {
                author: "admin@gmail.com",
                workoutName: "Basic Workout for Beginners",
                intensity: 1,
                length: 20,
                exercises: [
                    {
                        sets: 2,
                        repetitions: 10,
                        exerciseId: getId("Push Ups"),
                        rest: 15,
                        weight: 0
                    },
                    {
                        sets: 2,
                        repetitions: 10,
                        exerciseId: getId("Lateral Lunge"),
                        rest: 20,
                        weight: 0
                    },
                    {
                        sets: 2,
                        repetitions: 6,
                        exerciseId: getId("Dumbbell Bench Press"),
                        rest: 60,
                        weight: 40
                    },
                    {
                        sets: 3,
                        repetitions: 15,
                        exerciseId: getId("Single-leg deadlift"),
                        rest: 60,
                        weight: 10
                    }
                ]
            },
            "Intermediate Workout": {
                author: "admin@gmail.com",
                workoutName: "Intermediate Workout",
                intensity: 3,
                length: 40,
                exercises: [
                    {
                        sets: 1,
                        repetitions: 3,
                        exerciseId: getId("Quad Stretch"),
                        rest: 0,
                        weight: 0
                    },
                    {
                        sets: 1,
                        repetitions: 3,
                        exerciseId: getId("Chest and Shoulder Stretch"),
                        rest: 0,
                        weight: 0
                    },
                    {
                        sets: 1,
                        repetitions: 3,
                        exerciseId: getId("Upper Back Stretch"),
                        rest: 0,
                        weight: 0
                    },
                    {
                        sets: 1,
                        repetitions: 3,
                        exerciseId: getId("Triceps Stretch"),
                        rest: 0,
                        weight: 0
                    },
                    {
                        sets: 2,
                        repetitions: 10,
                        exerciseId: getId("Push Ups"),
                        rest: 15,
                        weight: 0
                    },
                    {
                        sets: 2,
                        repetitions: 10,
                        exerciseId: getId("Lateral Lunge"),
                        rest: 20,
                        weight: 0
                    },
                    {
                        sets: 2,
                        repetitions: 8,
                        exerciseId: getId("Scorpion"),
                        rest: 15,
                        weight: 0
                    },
                    {
                        sets: 5,
                        repetitions: 8,
                        exerciseId: getId("Back Squat"),
                        rest: 60,
                        weight: 70
                    },
                ]
            },
            "Arm Strength Workout": {
                author: "axundova010@gmail.com",
                workoutName: "Arm Strength Workout",
                intensity: 3,
                length: 25,
                exercises: [
                    {
                        sets: 3,
                        repetitions: 12,
                        exerciseId: getId("Hammer Curl"),
                        rest: 30,
                        weight: 25
                    },
                    {
                        sets: 3,
                        repetitions: 6,
                        exerciseId: getId("Dip"),
                        rest: 30,
                        weight: 25
                    },
                    {
                        sets: 3,
                        repetitions: 12,
                        exerciseId: getId("Neutral-grip Triceps Extension"),
                        rest: 30,
                        weight: 25
                    },
                ]
            },
            "Leg Strength Workout": {
                author: "yusuf_koroglu1238@gmail.com",
                workoutName: "Leg Strength Workout",
                intensity: 3,
                length: 35,
                exercises: [
                    {
                        sets: 5,
                        repetitions: 8,
                        exerciseId: getId("Back Squat"),
                        rest: 60,
                        weight: 70
                    },
                    {
                        sets: 5,
                        repetitions: 8,
                        exerciseId: getId("Front Squat"),
                        rest: 60,
                        weight: 70                      
                    },
                    {
                        sets: 5,
                        repetitions: 10,
                        exerciseId: getId("Romanian Deadlift"),
                        rest: 60,
                        weight: 70
                    },
                    {
                        sets: 2,
                        repetitions: 8,
                        exerciseId: getId("Incline Bench Press"),
                        rest: 60,
                        weight: 50
                    },
                ]
            },
            "Chest Strength Workout": {
                author: "hsan.fidan200@gmail.com",
                workoutName: "Chest Strength Workout",
                intensity: 4,
                length: 40,
                exercises: [
                    {
                        sets: 2,
                        repetitions: 8,
                        exerciseId: getId("Incline Bench Press"),
                        rest: 60,
                        weight: 50
                    },
                    {
                        sets: 2,
                        repetitions: 8,
                        exerciseId: getId("Dumbbell Bench Press"),
                        rest: 60,
                        weight: 35
                    },
                    {
                        sets: 4,
                        repetitions: 5,
                        exerciseId: getId("Decline Press"),
                        rest: 120,
                        weight: 100
                    },
                ]
            },
            "Yasar's All Rounded Workout": {
                author: "yasar_tuzun3@gmail.com",
                workoutName: "Yasar's All Rounded Workout",
                intensity: 2,
                length: 30,
                exercises: [
                    {
                        sets: 2,
                        repetitions: 10,
                        exerciseId: getId("Push Ups"),
                        rest: 15,
                        weight: 0
                    },
                    {
                        sets: 3,
                        repetitions: 12,
                        exerciseId: getId("Hammer Curl"),
                        rest: 30,
                        weight: 25
                    },
                    {
                        sets: 5,
                        repetitions: 8,
                        exerciseId: getId("Front Squat"),
                        rest: 60,
                        weight: 60                     
                    },
                    {
                        sets: 2,
                        repetitions: 8,
                        exerciseId: getId("Incline Bench Press"),
                        rest: 60,
                        weight: 40
                    },
                ]
            },
            "Nicholas' Extreme Workout": {
                author: "nicholas.read5249@gmail.com",
                workoutName: "Nicholas' Extreme Workout",
                intensity: 5,
                length: 50,
                exercises: [
                    {
                        sets: 8,
                        repetitions: 16,
                        exerciseId: getId("Back Squat"),
                        rest: 30,
                        weight: 110
                    },
                    {
                        sets: 6,
                        repetitions: 16,
                        exerciseId: getId("Hammer Curl"),
                        rest: 15,
                        weight: 50
                    },
                    {
                        sets: 8,
                        repetitions: 16,
                        exerciseId: getId("Incline Bench Press"),
                        rest: 20,
                        weight: 80
                    },
                ]
            },
            "Simple Stretches NO EQUIPMENT": {
                author: "admin@gmail.com",
                workoutName: "Simple Stretches",
                intensity: 1,
                length: 5,
                exercises: [
                    {
                        sets: 1,
                        repetitions: 3,
                        exerciseId: getId("Quad Stretch"),
                        rest: 0,
                        weight: 0
                    },
                    {
                        sets: 1,
                        repetitions: 3,
                        exerciseId: getId("Chest and Shoulder Stretch"),
                        rest: 0,
                        weight: 0
                    },
                    {
                        sets: 1,
                        repetitions: 3,
                        exerciseId: getId("Upper Back Stretch"),
                        rest: 0,
                        weight: 0
                    },
                    {
                        sets: 1,
                        repetitions: 3,
                        exerciseId: getId("Triceps Stretch"),
                        rest: 0,
                        weight: 0
                    }
                ]
            },
            "A Mix of Arms and Legs": {
                author: "yusuf_koroglu1238@gmail.com",
                workoutName: "A Mix of Arms and Legs",
                intensity: 3,
                length: 40,
                exercises: [
                    {
                        sets: 3,
                        repetitions: 12,
                        exerciseId: getId("Hammer Curl"),
                        rest: 30,
                        weight: 25
                    },
                    {
                        sets: 3,
                        repetitions: 6,
                        exerciseId: getId("Dip"),
                        rest: 30,
                        weight: 25
                    },
                    {
                        sets: 5,
                        repetitions: 8,
                        exerciseId: getId("Front Squat"),
                        rest: 60,
                        weight: 70                      
                    },
                    {
                        sets: 5,
                        repetitions: 10,
                        exerciseId: getId("Romanian Deadlift"),
                        rest: 60,
                        weight: 70
                    }
                ]
            },
                "Micky's Easy Workout": {
                    author: "boxzedit77@gmail.com",
                    workoutName: "Micky's Easy Workout",
                    intensity: 2,
                    length: 20,
                    exercises: [
                        {
                            sets: 4,
                            repetitions: 10,
                            exerciseId: getId("Push Ups"),
                            rest: 15,
                            weight: 0
                        },
                        {
                            sets: 5,
                            repetitions: 8,
                            exerciseId: getId("Back Squat"),
                            rest: 60,
                            weight: 30
                        },
                    ]
                },
                "Micky's Harder Workout": {
                    author: "boxzedit77@gmail.com",
                    workoutName: "Micky's Easy Workout",
                    intensity: 4,
                    length: 20,
                    exercises: [
                        {
                            sets: 8,
                            repetitions: 20,
                            exerciseId: getId("Push Ups"),
                            rest: 15,
                            weight: 0
                        },
                        {
                            sets: 10,
                            repetitions: 16,
                            exerciseId: getId("Back Squat"),
                            rest: 60,
                            weight: 60
                        },
                    ]
                }
            }

    let RANDOM_GENERIC_COMMENTS = ["Awesome!",
     "Where did you find these exercises?", 
     "Too difficult! :(", 
     "The idea is good but some of the sets and reps are questionable",
     "Great!",
     "I'm using this everyday in the gym now",
     "I will use this as inspiration for future workouts",
     "It's post like these that make me love this website",
     "Needs work",
     "10/10",
     "Pretty good.",
     "The first exercise was fine but the second one made me exhausted. Maybe lower the set/rep count for the second one.",
     "cool",
     "well done workout",
     "i like this a lot",
     "I like this one",
     "one of my favorites",
     "the best exercise out there",
     "this one needs more likes!",
     "please make this easier!!!",
     "please put more instructions in exercises. I don't get how to do it",
     "very detailed instructions and this is very easy to follow",
     "8/10",
     "7/10",
     "6/10",
     "interesting",
     "fun!",
     "challenging",
     "will try this again",
     "I need to work on this more",
     "I wonder how other people are doing with this exercise. This is very hard for me.",
     "Looks good!",
     "Looks great!",
     "Definitely want to give this a try tomorrow",
     "The equipment isn't too complicated. Good.",
     "Very easy to understand and very helpful.",
     "bookmarking this one!",
     "I'm going to tell this one to my friends",
    ]

    function getComment(){
        let result = RANDOM_GENERIC_COMMENTS.splice(Math.floor(Math.random()*RANDOM_GENERIC_COMMENTS.length), 1);
        return result[0];
    }


    for (const [name, workout] of Object.entries(workoutData)){
        const workoutResult = await workouts.createWorkout(userData[workout.author].object, userData[workout.author].password, name, workout.intensity, workout.length, workout.exercises);
        workoutData[name].object = workoutResult;
    }

    let emails = ["panda.zali@gmail.com", "yasar_tuzun3@gmail.com", "boxzedit77@gmail.com", "kkzz.damla_04@gmail.com", "bakicansenturk4615@gmail.com"]
    for (const email of emails){
        await workouts.addLikeToWorkout(userData[email].object, userData[email].password, workoutData["Basic Workout for Beginners"].object._id);
        await workouts.addCommentToWorkout(userData[email].object, userData[email].password, workoutData["Basic Workout for Beginners"].object._id, getComment());
    }
    emails = ["boxzedit77@gmail.com", "kkzz.damla_04@gmail.com", "bakicansenturk4615@gmail.com"]
    for (const email of emails){
        await workouts.addLikeToWorkout(userData[email].object, userData[email].password, workoutData["Intermediate Workout"].object._id);
        await workouts.addCommentToWorkout(userData[email].object, userData[email].password, workoutData["Intermediate Workout"].object._id, getComment());
    }
    emails = ["boxzedit77@gmail.com", "kkzz.damla_04@gmail.com", "hsan.fidan200@gmail.com", "yusuf_koroglu1238@gmail.com", "admin@gmail.com"]
    for (const email of emails){
        await workouts.addLikeToWorkout(userData[email].object, userData[email].password, workoutData["Arm Strength Workout"].object._id);
        await workouts.addCommentToWorkout(userData[email].object, userData[email].password, workoutData["Arm Strength Workout"].object._id, getComment());
    }
    emails = ["boxzedit77@gmail.com", "kkzz.damla_04@gmail.com", "hsan.fidan200@gmail.com", "yusuf_koroglu1238@gmail.com"]
    for (const email of emails){
        await workouts.addLikeToWorkout(userData[email].object, userData[email].password, workoutData["Leg Strength Workout"].object._id);
        await workouts.addCommentToWorkout(userData[email].object, userData[email].password, workoutData["Leg Strength Workout"].object._id, getComment());
    }
    emails = ["boxzedit77@gmail.com", "kkzz.damla_04@gmail.com", "hsan.fidan200@gmail.com", "yusuf_koroglu1238@gmail.com", "admin@gmail.com", "axundova010@gmail.com", "nicholas.read5249@gmail.com"]
    for (const email of emails){
        await workouts.addLikeToWorkout(userData[email].object, userData[email].password, workoutData["Chest Strength Workout"].object._id);
        await workouts.addCommentToWorkout(userData[email].object, userData[email].password, workoutData["Chest Strength Workout"].object._id, getComment());
    }
    emails = ["yasar_tuzun3@gmail.com", "panda.zali@gmail.com"]
    for (const email of emails){
        await workouts.addLikeToWorkout(userData[email].object, userData[email].password, workoutData["Yasar's All Rounded Workout"].object._id);
        await workouts.addCommentToWorkout(userData[email].object, userData[email].password, workoutData["Yasar's All Rounded Workout"].object._id, getComment());
    }
    emails = ["panda.zali@gmail.com", "yasar_tuzun3@gmail.com", "boxzedit77@gmail.com", "kkzz.damla_04@gmail.com", "bakicansenturk4615@gmail.com", "hsan.fidan200@gmail.com", "yusuf_koroglu1238@gmail.com", "axundova010@gmail.com", "nicholas.read5249@gmail.com"]
    for (const email of emails){
        await workouts.addLikeToWorkout(userData[email].object, userData[email].password, workoutData["Simple Stretches NO EQUIPMENT"].object._id);
        await workouts.addCommentToWorkout(userData[email].object, userData[email].password, workoutData["Simple Stretches NO EQUIPMENT"].object._id, getComment());
    }
    //TODO seed comments
    //TODO seed workout logs


    console.log('Done seeding database');
    await dbConnection.closeConnection();
}

main().catch((error) => {
    console.error(error);
    return dbConnection.dbConnection().then((db) => {
        return dbConnection.closeConnection();
    });
});