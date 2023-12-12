// imports
let bcrypt = require('bcrypt');
let jwtUtils = require('../utils/jwt.utils');
let models = require('../models');

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

        // TODO verify pseudo length, mail regex, password etc
        models.User.findOne({
            attributes:['email'],
            where:{ email: email}
        })
        .then(function(userFound){
            if (!userFound){
                bcrypt.hash(password, 5, function(errorHash, bcryptedPassword){
                    if(errorHash) {
                        return response.status(500).json({'error': 'bcrypt error'});
                    }
                    models.User.create({
                        email: email,
                        username: username,
                        password: bcryptedPassword,
                        bio: bio,
                        isAdmin: 0,
                    })
                    .then(function(newUser){
                        return response.status(201).json({
                            'userId': newUser.id
                        });
                    })
                    .catch(function(error){
                        return response.status(500).json({'error': 'cannot add user'});
                    });
                });
            } else {
                return response.status(409).json({'error': 'already exist'});
            }
        })
        .catch(function(error){
            return response.status(500).json({'error': 'database error'});
        });
    },
    login: function(request, response){

        // getting params
        let email = request.body.email;
        let password = request.body.password;

        // verify params
        if ( email == null || password == null ){
            return response.status(400).mjson({'error': 'missing parameters'});
        };

        // TODO verify email regex & password lenght
        models.User.findOne({
            where: { email: email }
        })
        .then(function(userFound) {
            if (userFound){
                bcrypt.compare(password, userFound.password, function(errorBycript, responsesBycript){
                    if (responsesBycript){
                        return response.status(200).json({
                            'userId': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound)
                        })
                    } else {
                        return response.status(403).json({"error":"invalid password"});
                    }
                })
            } else {
                return response.status(404).json({'error':'user not exist in database'});
            }
        })
        .catch( function(error) {
            return response.status(500).json({'error':''})
        })
    }
}
