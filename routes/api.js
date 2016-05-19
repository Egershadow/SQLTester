var express = require('express');
var router = express.Router();

var jwt              = require('jsonwebtoken');
var sendResponse     = require('../libs/response-callback');
var config           = require('../libs/config');

var auth = require('./auth');
router.use('/auth', auth);

//all api actions requires authorization
router.use(function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.headers['x-access-token'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.get('secret'), function(err, decoded) {
            if (err) {
                sendResponse(res, 400, 'Token verification failed');
            } else {
                //request saving for usage in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        sendResponse(res, 400, 'Token not provided');
    }
});

var groups = require('./groups');
router.use('/groups', groups);

var users = require('./users');
router.use('/users', users);


module.exports = router;