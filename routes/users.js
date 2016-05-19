var express         = require('express');
var router          = express.Router();
var config          = require('../libs/config');

//logging
var intel           = require('intel');
var log             = require('../libs/log')('console', intel.DEBUG);

// database
var ServerApplication = require('../libs/server-application');
var User              = ServerApplication.defaultConnection.import('../models/user');

var sendResponse     = require('../libs/response-callback');

router.param('id', function( req, res, next ) {
    next();
});

router.get('/:id',  function(req, res) {
    var userId = 0;
    if(req.params.id == 'me') {
        userId = req.decoded.idUser;
    } else {
        userId = req.params.id;
    }
    User.findById(userId).then(function(user) {
        if(!user) {
            sendResponse(res, 400, 'User with passed id not found');
        } else {
            var userProfile = {
                profile : {
                    idUser : user.idUser,
                    email : user.email,
                    username : user.username,
                    idGroup : user.group
                }
            };
            res.json(userProfile);
        }
    }, function(err) {
        log.error('Internal error(%d): %s', err.code, err.message);
        sendResponse(res, 500, 'Server error')
    });
});


//router.get('/:id/cameras',  function(req, res) {
//
//    Detector.findById(req.params.id).then(function(detector) {
//        if(!detector) {
//            sendError(res, 400, 'Detector with passed id not found')
//        } else {
//            if(detector.creator != req.decoded.idUser) {
//                sendError(res, 401, 'Access denied')
//            }
//            Camera.findAll({
//                where: {
//                    handler: req.params.id
//                }
//            }).then(function(cameras) {
//                for(var index in cameras) {
//                    if(cameras[index].settings == undefined) {
//                        cameras[index].settings = Settings.get('cameraSettings');
//                    } else {
//                        var customSettings = detectors[index].settings;
//                        cameras[index].settings = Settings.get('cameraSettings');
//                        for(var key in customSettings) {
//                            cameras[index].settings[key] = customSettings[key];
//                        }
//                    }
//                }
//
//                res.code = 200;
//                res.json(cameras);
//            }, function(err) {
//                log.error('Internal error(%d): %s', err.code, err.message);
//
//                sendError(res, 500, 'Server error')
//            })
//        }
//    }, function(err) {
//        log.error('Internal error(%d): %s', err.code, err.message);
//
//        sendError(res, 500, 'Server error')
//    })
//
//});


module.exports = router;