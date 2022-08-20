const commentRoutes = require('./comments');
const exerciseRoutes = require('./exercises');
const userRoutes = require('./users');
const workoutLogRoutes = require('./workoutLogs');
const workoutRoutes = require('./workouts');
const workoutSearchRoutes = require('./workoutSearch');

const constructorMethod = (app) => {
    app.use('/', userRoutes);
    app.use('/', exerciseRoutes);
    app.use('/', commentRoutes);
    app.use('/', workoutLogRoutes);
    app.use('/', workoutRoutes);
    app.use('/', workoutSearchRoutes);
    app.use('*', (req, res) => {
        res.sendStatus(404); //TODO render "not found" page
    })
}

module.exports = constructorMethod;