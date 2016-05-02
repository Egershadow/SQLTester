var express         = require('express');
var router          = express.Router();
var config          = require('../libs/config');

//security
var crypto          = require('crypto');
var jwt             = require('jsonwebtoken');

// database
var mysqlDBConnection = require('../models/mysqlDBConnection');
var User              = mysqlDBConnection.import('../models/user');

//logging
var intel           = require('intel');
var log             = require('../libs/log')('console', intel.DEBUG);

var sendResponse     = require('../libs/response-callback');

router.post('/signin', function(req, res) {

    // find user
    User.findOne({ where:
    {
        email: req.body.email
    }
    }).then(function(user) {

        // check if password matches
        var hash = crypto
            .createHash("sha1")
            .update(req.body.password)
            .digest('hex');
        if (user.password != hash) {
            log.info('Authentication failed. Wrong password.');
            sendError(res, 400, 'Wrong password');
            return;
        }

        // if user is found and password is right
        var tokenString = jwt.sign({
            idUser: user.idUser
        }, config.get('secret'), {
            expiresIn: 60*60 // expires in 60 minutes
        });

        res.code = 200;
        res.json({
            token: tokenString
        });
    }, function(err) {
        log.error('Internal error(%d): %s', err.code, err.message);
        sendResponse(res, 500, 'Server error')
    });
});

router.post('/signin/refresh', function(req, res) {
    var token = req.headers['x-access-token'];
    jwt.verify(token, config.get('secret'), function(err, decoded) {
        if (err) {
            log.error('Internal error(%d): %s', err.code, err.message);
            sendError(res, 400, 'Token prolongation failed')
            return;
        }

        var tokenString = ''
        if(decoded.idUser != undefined) {

            log.info('Refreshing token for user with id %s', decoded.idUser)
            tokenString = jwt.sign({
                idUser: decoded.idUser
            }, config.get('secret'), {
                expiresIn: 60*60 // expires in 60 minutes
            });
        } else {

            log.info('Refreshing token for detector with id %s',decoded.idDetector)
            tokenString = jwt.sign({
                idDetector: decoded.idDetector
            }, config.get('secret'), {
                expiresIn: 60*60 // expires in 60 minutes
            });
        }
        res.code = 200;
        res.json({
            token: tokenString
        });
    });
})

router.post('/signup',  function(req, res) {

    User.findOne({ where:
    {
        email: req.body.email
    }
    }).then(function(user) {

        //check if user already exists
        if(user) {
            log.info('User with email %s already exists', req.body.email)
            sendError(res, 400, 'User with this email already exists')
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
                password: hash

            }).then(function (user) {

            log.info('User with email %s successfully created!', user.email);
            res.code = 200;
            res.json(user);
        }, function(err) {
            log.error('Internal error when creating user(%d): %s', err.code, err.message);

            sendError(res, 500, 'Server error')
        });
    }, function(err) {
        log.error('Internal error(%d): %s', err.code, err.message);

        sendError(res, 500, 'Server error')
    });

});

module.exports = router;