// imports
let bcrypt = require('bcrypt');
let jwtUtils = require('../utils/jwt.utils');
let models = require('../models');
let asynclib = require('async');

// variables
const EMAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;

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
         }
        
        if (username.length >= 13 || username.length <= 4){
            return response.status(400).json({ 'error': 'wrong username you (length must be 5-12)'});
        }

        if (!EMAIL_REGEX.test(email)){
            return response.status(400).json({ 'error': 'this email is not valid ! '});
        }

        if (!PASSWORD_REGEX.test(password)){
            return response.status(400).json({ 'error': 'the password must lenth 4 - 8 and include 1 number'});
        }
        ;

        asynclib.waterfall([
            function (done) {
                models.User.findOne({
                    attributes: ['email'],
                    where: { email: email }
                })
                .then(function(userFound){
                    done(null, userFound);
                })
                .catch(function(error){
                    done(error);
                });
            },
            function(userFound, done) {
                if (!userFound) {
                    bcrypt.hash(password, 5, function(error, bcryptedPassword){
                        
                        if (error) {
                            done(error);
                        } else {
                            done(null, userFound, bcryptedPassword);
                        }
                    });
                } else {
                    return response.status(409).json({'error': 'already exist'});
                }
            },
            function(userFound, bcryptedPassword, done) {
                const newUser = models.User.create({
                    email: email,
                    username: username,
                    password: bcryptedPassword,
                    bio: bio,
                    isAdmin: 0,
                })
                .then(function(newUser){
                    done(newUser);
                })
                .catch(function(error){
                    return response.status(500).json({'error':'cannot add user'});
                });
            }
        ],
        function(error, newUser) {
            if (error) {
                return response.status(500).json({'error': error.message || 'cannot add user'});
            } else {
                return response.status(201).json({
                    'userId': newUser.id
                });
            }
        });
    },

    login: function(request, response) {
        let email = request.body.email;
        let password = request.body.password;

        asynclib.waterfall([
            function(done) {
                models.User.findOne({
                    where: { email: email }
                })
                .then(function(userFound) {
                    done(null, userFound);
                })
                .catch(function(error) {
                    done(error);
                });
            },
            function(userFound, done) {
                if (userFound) {
                    bcrypt.compare(password, userFound.password, function(errorBycript, responsesBycript){
                        if (errorBycript) {
                            done(errorBycript);
                        } else {
                            done(null, userFound, responsesBycript);
                        }
                    });
                } else {
                    done(new Error('User not found'));
                }
            }
        ],
            function(error, userFound, responsesBycript) {
                if (error) {
                    return response.status(500).json({'error': error.message || 'unknown error'});
                } else if (!responsesBycript) {
                    return response.status(403).json({"error":"invalid password"});
                } else {
                    return response.status(200).json({
                        'userId': userFound.id,
                        'token': jwtUtils.generateTokenForUser(userFound)
                    });
                }
        });
    },

    getUserProfile: function(request, response){
        // Getting auth header
        const headerAuth = req.headers['authorization'];
        const userId     = jwtUtils.getUserId(headerAuth);

        if ( userId <0 )
        return response.status(201).json({'error':'wrong Token'});

        models.Users.findOne({
            attributes: ['id', 'email', 'username', 'bio'],
            where: { id: userId }
        }).then(function(user){
            if (user) {
                response.status(201).json(user)
            } else {
                response.status(404).json({'error':'user not found'}) ;              
            }
        }).catch(function(error){
            response.status(500).json({'error':'cannot fetch'});
        })
    }
};

