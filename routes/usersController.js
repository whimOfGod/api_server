// imports
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let models = require('../models')

// Routes
module.exports = {
    register: function(request, response){

        // params
        let email    = request.body.email;
        let username = request.body.username;
        let password = request.body.password;
        let bio      = request.body.bio;

        // verifiry fields and catch error 
        if( email == null || username == null || password == null || bio == null ){
            return response.status(400).json({ 'error': 'missing parameters'});
        };

        // TODO verify pseudo length, mail regex, password etc
        models.User.findOne({
            attributes:['email'],
            where:{ email: email}
        })
        .then(function(userFound){
            if (!userFound){

                bcrypt.hash(password, 5, function(errorHash, bcryptedPassword){
                    let newUser = models.User.create({
                        email: email,
                        username: username,
                        password: bcryptedPassword,
                        bio: bio,
                        isAdmin: 0,
                    })
                    .then( function(newUser){
                        return response.status(201).json({
                            'userId': newUser.id
                        })
                    .catch(function(error){
                        return response.status(500).json({'error': 'cannot add user'})
                        });
                    });
                });

            } else {
                return response.status(409).json({'error': 'already exist'});
            }
        })
    },
    login: function(request, response){

    }
}