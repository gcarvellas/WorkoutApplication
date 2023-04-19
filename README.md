# CS-546-A Final Project Submission. This project is for personal use and is now read-only

To first pull the code:

- Get to the repository website at [**https://github.com/gcarvellas/WorkoutApplication.git**](https://github.com/gcarvellas/WorkoutApplication.git)
- Clone code by doing "Git clone [https://github.com/gcarvellas/WorkoutApplication.git](https://github.com/gcarvellas/WorkoutApplication.git) in a git interface" such as git bash or git gui.

Once you have pulled the code, go to your text editor to the folder of this application "WorkoutApplication" and make sure that you're in the **master** branch.

How to run code:

- Run "npm install" to download the dependencies needed to run this application
- Run "npm run seed" to seed the database with data

How to start application:

- Run "npm start" to start the application.

User login information:

**User 1** (normal user, not an admin)

Email: admin@gmail.com

Password: password123

**User 2**

Email: hsan.fidan200@gmail.com

Password: 2018hfask

Note: When logged in as [admin@gmail.com](mailto:admin@gmail.com), the landing page lists all users' workouts which can then be sorted or searched for specific categories.

Note: The seed does not have any workout logs, since a user can only see his/her own workout logs

About the Website:

To log in, in the top right hand side of the website, there will be a sign in button where you can log in as one of the provided users above to log in. Otherwise, you can press the join button to create a new user.

Whether the user has an account or not, they will be presented with a workout search in the landing page, where the user can view workouts and sort them by muscle groups or popularity. The user can also make a search by workout name to view the workouts matching that name. If the user has an account and they are logged in, they will have the option to get their workouts via a button "My Workouts" where the user will be able to see a list of their workouts in a minimized list otherwise also seen in the user's profile.

Users can create workouts, which contain multiple exercises and their sets, reps, weights, etc. Users can also view other users' workouts and comment/like on them. Users can also create a workout log, which is a personal log that they can modify. A user can create a workout log for a workout by clicking the "Create Workout Log" button in any workout. A user can only see his/her own workout log. This is used so if a user does a workout from another user and thinks the set/rep count is too high, the user can change it in the log to keep track of the modified changes. Users can make multiple workout logs per workout to view their progress of doing a workout overtime.

When viewing a user's profile, it will display their basic information including frequency of working out, their biography, workouts that they created, and workouts that they most recently liked. The user's profile page also shows how many likes and comments they received. If the user is logged in and viewing their own profile, they can edit/delete their account information and view their own workout logs.

When creating a new workout or editing an existing one, you can add exercises to the workout. Exercises can be searched in the bottom of the create/edit workout page. New exercises can also be created here or using the navigation menu.

Creating workouts, exercises, and workout logs can only be done as a logged in user. Editing of workouts, exercises, and workouts logs can only be done by the users that created them. Deleting of workouts and workout logs can only be done by the users that created them.
