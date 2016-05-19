var express         = require('express');
var router          = express.Router();
var config          = require('../libs/config');

//logging
var intel           = require('intel');
var log             = require('../libs/log')('console', intel.DEBUG);

// database
var ServerApplication = require('../libs/server-application');
var User              = ServerApplication.defaultConnection.import('../models/user');
var Test              = ServerApplication.defaultConnection.import('../models/test');

var sendResponse     = require('../libs/response-callback');


router.get('/',  function(req, res) {

    Test.findAll({
        where: {
            creator: req.decoded.idUser
        }
    }).then(function(detectors) {

        res.json(detectors);
    }, function(err) {
        log.error('Internal error(%d): %s', err.code, err.message);

        sendError(res, 500, 'Server error')
    })
});

router.param('id', function( req, res, next ) {
    next();
});

router.get('/:id',  function(req, res) {

    Detector.findById(req.params.id).then(function(detector) {
        if(!detector) {
            sendError(res, 400, 'Detector with passed id not found')
        } else {
            if(detector.creator != req.decoded.idUser) {
                sendError(res, 401, 'Access denied')
            }
            res.json(detector);
        }
    }, function(err) {
        log.error('Internal error(%d): %s', err.code, err.message);

        sendError(res, 500, 'Server error')
    })
});


router.get('/:id/cameras',  function(req, res) {

    Detector.findById(req.params.id).then(function(detector) {
        if(!detector) {
            sendError(res, 400, 'Detector with passed id not found')
        } else {
            if(detector.creator != req.decoded.idUser) {
                sendError(res, 401, 'Access denied')
            }
            Camera.findAll({
                where: {
                    handler: req.params.id
                }
            }).then(function(cameras) {
                for(var index in cameras) {
                    if(cameras[index].settings == undefined) {
                        cameras[index].settings = Settings.get('cameraSettings');
                    } else {
                        var customSettings = detectors[index].settings;
                        cameras[index].settings = Settings.get('cameraSettings');
                        for(var key in customSettings) {
                            cameras[index].settings[key] = customSettings[key];
                        }
                    }
                }

                res.code = 200;
                res.json(cameras);
            }, function(err) {
                log.error('Internal error(%d): %s', err.code, err.message);

                sendError(res, 500, 'Server error')
            })
        }
    }, function(err) {
        log.error('Internal error(%d): %s', err.code, err.message);

        sendError(res, 500, 'Server error')
    })

});
