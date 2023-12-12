// imports
let jwt =  require('jsonwebtoken');

const JWT_SIGN_SECRET = '85fjrt89f4zfj@4ser78Qops&fhX2k30Ykl@styx9S@lm0nCàrb0m4rGu3rit3Du8o1s'

// Expordted functions
module.exports = {
    generateTokenForUser: function(userData){
        return jwt.sign({
            userId: userData.id,
            isAdmin: userData.isAdmin
        },
        JWT_SIGN_SECRET,
        {
            expiresIn: '1h'
        })
    }
}
