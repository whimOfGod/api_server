// Routes 

let express = require('express');
//let jwt = require('jsonwebtoken');
let usersController = require('./routes/usersController');

// Routers
exports.router = (function(){
    let apiRouter = express.Router();

    // Users routes
    apiRouter.route('/users/register/').post(usersController.register);
    apiRouter.route('/users/login/').post(usersController.login);

    return apiRouter ;
})();