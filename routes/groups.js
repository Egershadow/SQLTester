var express             = require('express');
var router              = express.Router();

//logging
var intel               = require('intel');
var log                 = require('../libs/log')('console', intel.DEBUG);

// database
var ConnectionFabric    = require('../libs/connection-fabric');
var User                = ConnectionFabric.defaultConnection.import('../models/user');
var Group               = ConnectionFabric.defaultConnection.import('../models/group');
var Test                = ConnectionFabric.defaultConnection.import('../models/test');
var GroupHasTest        = ConnectionFabric.defaultConnection.import('../models/group_has_test');

var sendResponse        = require('../libs/response-callback');


router.get('/',  function(req, res) {
    Group.findAll({}).then(function(groups) {
        res.json(groups);
    }, function(err) {
        log.error('Internal error(%d): %s', err.code, err.message);
        sendResponse(res, 500, 'Server error');
    })
});

router.param('id', function( req, res, next ) {
    next();
});

//router.get('/:id',  function(req, res) {
//
//    Detector.findById(req.params.id).then(function(detector) {
//        if(!detector) {
//            sendError(res, 400, 'Detector with passed id not found')
//        } else {
//            if(detector.creator != req.decoded.idUser) {
//                sendError(res, 401, 'Access denied')
//            }
//            res.json(detector);
//        }
//    }, function(err) {
//        log.error('Internal error(%d): %s', err.code, err.message);
//
//        sendError(res, 500, 'Server error')
//    })
//});


router.get('/:id/users',  function(req, res) {
    Group.findById(req.params.id).then(function(group) {
        if(!group) {
            sendResponse(res, 400, 'Group with passed id not found');
            return;
        }
        User.findAll({
            where: {
                group: req.params.id
            }
        }).then(function(users) {
            var usersPublicInfo = [];
            for(var index in users) {
                usersPublicInfo.push({
                    idUser : users[index].idUser,
                    username : users[index].username
                });
            }
            res.code = 200;
            res.json(usersPublicInfo);
        }, function(err) {
            log.error('Internal error(%d): %s', err.code, err.message);
            sendResponse(res, 500, 'Server error');
        });
    }, function(err) {
        log.error('Internal error(%d): %s', err.code, err.message);
        sendResponse(res, 500, 'Server error');
    })

});

router.get('/:id/tests',  function(req, res) {
    Group.findById(req.params.id).then(function(group) {
        if(!group) {
            sendResponse(res, 400, 'Group with passed id not found');
            return;
        }
        GroupHasTest.findAll({
            where: {
                idGroup: req.params.id
            }
        }).then(function(groupHasTests) {
            var idTests = [];
            for(var index in groupHasTests) {
                idTests.push(groupHasTests[index].idTest);
            }
            Test.findAll({
                where: {
                    idTest: idTests
                }
            }).then(function(tests) {
                res.json({
                        tests : tests
                    });
            }, function(err) {
                log.error('Internal error(%d): %s', err.code, err.message);
                sendResponse(res, 500, 'Server error');
            });
        }, function(err) {
            log.error('Internal error(%d): %s', err.code, err.message);
            sendResponse(res, 500, 'Server error');
        });
    }, function(err) {
        log.error('Internal error(%d): %s', err.code, err.message);
        sendResponse(res, 500, 'Server error');
    });

});

module.exports = router;