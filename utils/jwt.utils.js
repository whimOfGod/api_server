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
    },
    parseAuthorization: function(authorization) {
        return (authorization != null) ? authorization.replace('Bearer', '') : null;
    },
    getUserId: function(authorization) {
        let userId = -1;
        let token = module.exports.parseAuthorization(authorisation);
        if(token != null) {
            try {
                let jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
                if(jwtToken != null){
                    userId = jwtToken.userId;
                }
            }
            catch(error){
                
            }
            return userId
        }
    }
}
