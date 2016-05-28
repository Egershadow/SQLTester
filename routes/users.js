var express             = require('express');
var router              = express.Router();
var config              = require('../libs/config');

//logging
var intel               = require('intel');
var log                 = require('../libs/log')('console', intel.DEBUG);

// database
var ConnectionFabric    = require('../libs/connection-fabric');
var User                = ConnectionFabric.defaultConnection.import('../models/user');
var UserPassedTest      = ConnectionFabric.defaultConnection.import('../models/user_passed_test');
var Test                = ConnectionFabric.defaultConnection.import('../models/test');
var GroupHasTest        = ConnectionFabric.defaultConnection.import('../models/group_has_test');
var TestHasQuestion     = ConnectionFabric.defaultConnection.import('../models/test_has_question');
var Question            = ConnectionFabric.defaultConnection.import('../models/question');
var UserAnsweredQuestion= ConnectionFabric.defaultConnection.import('../models/user_answered_question');

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
                    idGroup : user.idGroup
                }
            };
            res.json(userProfile);
        }
    }, function(err) {
        log.error('Internal error(%d): %s', err.code, err.message);
        sendResponse(res, 500, 'Server error')
    });
});

router.get('/:id/tests/:testId/questions',  function(req, res) {
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
            TestHasQuestion.findAll({
                where: {
                    idUser : req.params.testId
                }
            }).then(function(testHasQuestions) {
                var idQuestions = [];
                var idTestHasQuestions = [];
                for(var index in testHasQuestions) {
                    idQuestions.push(testHasQuestions[index].idQuestion);
                    idTestHasQuestions.push(testHasQuestions[index].idTestHasQuestion);
                }
                Question.findAll({
                    where : {
                        idTest : idQuestions
                    },
                    order : '`createdAt` DESC'
                }).then(function(questions) {
                    UserAnsweredQuestion.findAll({
                        where : {
                            idTest : idQuestions
                        },
                        order : '`createdAt` DESC'
                    }).then(function(userAnsweredQuestions) {

                        res.json(questions);
                    }, function (error) {
                        log.error('Internal error(%d): %s', err.code, err.message);
                        sendResponse(res, 500, 'Server error')
                    });

                    res.json(questions);
                }, function (error) {
                    log.error('Internal error(%d): %s', err.code, err.message);
                    sendResponse(res, 500, 'Server error')
                });
            }, function(error) {
                log.error('Internal error(%d): %s', err.code, err.message);
                sendResponse(res, 500, 'Server error')
            });
        }
    }, function(err) {
        log.error('Internal error(%d): %s', err.code, err.message);
        sendResponse(res, 500, 'Server error')
    });
});

router.get('/:id/tests',  function(req, res) {

    var userId = req.params.id;
    if(userId == 'me') {
        userId = req.decoded.idUser;
    }

    User.findById(userId).then(function(user) {
        if(!user) {
            sendResponse(res, 400, 'User with passed id not found');
        } else {
            UserPassedTest.findAll({
                where: {
                    idUser : userId
                }
            }).then(function(userPassedTests) {
                var idTests = [];
                for(var index in userPassedTests) {
                    idTests.push(userPassedTests[index].idTest);
                }
                var groupHasTestCondition = {
                    idGroup : user.idGroup,
                };
                if(idTests.length > 0) {
                    groupHasTestCondition.idTest = {
                        $notIn : idTests
                    }
                }
                GroupHasTest.findAll({
                    where: groupHasTestCondition
                }).then(function(groupHasTests) {
                    for(var index in groupHasTests) {
                        if(!idTests.indexOf(groupHasTests[index].idTest) != -1) {
                            idTests.push(groupHasTests[index].idTest);
                        }
                    }

                    Test.findAll({
                        where : {
                            idTest : idTests
                        },
                        order : '`createdAt` DESC'
                    }).then(function(tests) {
                        var testsInfo = [];

                        for(var index in tests) {
                            var found = false;
                            for(var passedTestIndex in userPassedTests) {
                                if(userPassedTests[passedTestIndex].idTest == tests[index].idTest) {
                                    found = true;
                                }
                            }
                            if(!found) {
                                var testInfo = {
                                    idTest : tests[index].idTest,
                                    testName : tests[index].testName,
                                    createdAt : tests[index].createdAt,
                                    updatedAt : tests[index].updatedAt,
                                    status : 'new',
                                    passAvailable : 'yes'
                                };
                                testsInfo.push(testInfo);
                            }
                        }

                        var passedTests = [];


                        for(var passedTestIndex in userPassedTests) {
                            for(var index in tests) {
                                if(userPassedTests[passedTestIndex].idTest == tests[index].idTest) {
                                    if(passedTests[tests[index].idTest] == undefined) {
                                        passedTests[tests[index].idTest] = 1;
                                    } else {
                                        ++passedTests[tests[index].idTest];
                                    }
                                    var testInfo = {
                                        idTest : tests[index].idTest,
                                        testName : tests[index].testName,
                                        createdAt : tests[index].createdAt,
                                        updatedAt : tests[index].updatedAt
                                    };
                                    if(userPassedTests[passedTestIndex].testResult >= 60) {
                                        testInfo.status = 'passed';
                                    } else {
                                        testInfo.status = 'failed';
                                    }
                                    if(passedTests[tests[index].idTest] > 2) {
                                        testInfo.passAvailable = 'no';
                                    } else {
                                        testInfo.passAvailable = 'yes';
                                    }
                                    testsInfo.push(testInfo);
                                    break;
                                }
                            }
                        }

                        res.json({
                            tests : testsInfo
                        });
                    }, function (error) {
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
        }
    }, function(err) {
        log.error('Internal error(%d): %s', err.code, err.message);
        sendResponse(res, 500, 'Server error')
    });

});


module.exports = router;