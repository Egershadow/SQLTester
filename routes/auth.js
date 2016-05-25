var express         = require('express');
var router          = express.Router();
var config          = require('../libs/config');

//security
var crypto          = require('crypto');
var jwt             = require('jsonwebtoken');

//logging
var intel           = require('intel');
var log             = require('../libs/log')('console', intel.DEBUG);

// database
var ConnectionFabric= require('../libs/connection-fabric');
var User            = ConnectionFabric.defaultConnection.import('../models/user');

var sendResponse     = require('../libs/response-callback');


router.post('/signin', function(req, res) {

    // find user
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(function(user) {
        if(!user) {
            log.info('Authentication failed. User not found');
            sendResponse(res, 400, 'User not found');
            return;
        }
        // check if password matches
        var hash = crypto
            .createHash("sha1")
            .update(req.body.password)
            .digest('hex');
        if (user.password != hash) {
        //if (user.password != req.body.password) {
            log.info('Authentication failed. Wrong password');
            sendResponse(res, 400, 'Wrong password');
            return;
        }
        // if user is found and password is right
        var tokenString = jwt.sign({
            idUser: user.idUser
        }, config.get('secret'), {
            expiresIn: 60*60*24 // expires in 24 hours
        });
        //get user profile
        User.findById(user.idUser).then(function(user) {
            if(!user) {
                sendResponse(res, 400, 'User with passed id not found');
            } else {
                res.code = 200;
                res.json({
                    token: tokenString,
                    user : {
                        idUser : user.idUser,
                        email : user.email,
                        username : user.username,
                        idGroup : user.group
                    }
                });
            }
        }, function(err) {
            log.error('Internal error(%d): %s', err.code, err.message);
            sendResponse(res, 500, 'Server error')
        });
    }, function(err) {
        log.error('Internal error(%d): %s', err.code, err.message);
        sendResponse(res, 500, 'Server error')
    });
});

router.post('/refresh', function(req, res) {
    var token = req.headers['x-access-token'];
    jwt.verify(token, config.get('secret'), function(err, decoded) {
        if (err) {
            log.error('Internal error(%d): %s', err.code, err.message);
            sendResponse(res, 400, 'Token prolongation failed');
            return;
        }

        log.info('Refreshing token for user with id %s', decoded.idUser);
        var tokenString = jwt.sign({
            idUser: decoded.idUser
        }, config.get('secret'), {
            expiresIn: 60*60 // expires in 60 minutes
        });
        res.code = 200;
        res.json({
            token: tokenString
        });
    });
});

router.post('/signup',  function(req, res) {

    User.findOne({ where:
    {
        email: req.body.email
    }
    }).then(function(user) {

        //check if user already exists
        if(user) {
            log.info('User with email %s already exists', req.body.email);
            sendResponse(res, 400, 'User with this email already exists');
            return;
        }
        var hash = crypto
            .createHash("sha1")
            .update(req.body.password)
            .digest('hex');

        //it's okay, save user
        User.create(
            {
                email: req.body.email,
                password: hash,
                username: req.body.username

            }).then(function (user) {

            log.info('User with email %s successfully created!', user.email);
            res.code = 200;
            res.json({
                idUser : user.idUser
            });
        }, function(err) {
            log.error('Internal error when creating user(%d): %s', err.code, err.message);

            sendResponse(res, 500, 'Server error')
        });
    }, function(err) {
        log.error('Internal error(%d): %s', err.code, err.message);

        sendResponse(res, 500, 'Server error')
    });

});

module.exports = router;