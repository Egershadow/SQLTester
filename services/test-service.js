var ServerApplication       = require('../libs/server-application');
var ConnectionFabric        = require('../libs/connection-fabric');
var config                  = require('../libs/config');
var Sequelize               = require('sequelize');
var async                   = require('async');

//logging
var intel           = require('intel');
var log             = require('../libs/log')('console', intel.DEBUG);




module.exports.getTimeForTest = function (idTest, success, failure) {

    var TestHasQuestion         = ConnectionFabric.defaultConnection.import('../models/test-has-question');

    TestHasQuestion.findAll({
        where: {
            idTest : idTest
        }
    }).then(function(testHasQuestions) {
        if(!testHasQuestions) {
            //returning empty error object
            failure({});
            return;
        }
        //calculating of total time for test in seconds
        var totalTime = TestHasQuestion.length * config.get('minutesForSingleQuestion') * 60;

        success(totalTime);
    }, function(err) {
        failure(err);
    });
};

module.exports.getTestResult = function (idUser, idTest, startDate, success, failure) {

    var TestHasQuestion         = ConnectionFabric.defaultConnection.import('../models/test-has-question');
    var UserPassedTest          = ConnectionFabric.defaultConnection.import('../models/user-passed-test');
    var UserAnsweredQuestion    = ConnectionFabric.defaultConnection.import('../models/user-answered-question');
    var Question                = ConnectionFabric.defaultConnection.import('../models/question');

    UserPassedTest.findAll({
        where: {
            idUser : idUser,
            idTest : idTest
        }
    }).then(function(userPassedTests) {
        TestHasQuestion.findAll({
            where: {
                idTest : idTest
            }
        }).then(function(testHasQuestions) {
            var idQuestions = [];
            for(var index in testHasQuestions) {
                if (testHasQuestions.hasOwnProperty(index)) {
                    idQuestions.push(testHasQuestions[index].idQuestion);
                }
            }
            Question.findAll({
                where : {
                    idQuestion : idQuestions
                }
            }).then(function(questions) {
                //check if user passes test first time
                var whereParams = {
                    idUser : idUser,
                    idTest : idTest
                };
                if(userPassedTests.length > 0) {
                    whereParams.date =  {
                        $gt : startDate
                    };
                }
                UserAnsweredQuestion.findAll({
                    where: whereParams
                }).then(function(userAnsweredQuestions) {

                    var rawTestData = [];
                    //setting question to rawTestData item
                    for (var questionIndex in questions) {
                        if (questions.hasOwnProperty(questionIndex)) {
                            rawTestData.push({
                                question : questions[questionIndex]
                            });
                        }
                    }
                    //setting up test has question data
                    for (var testHasQuestionIndex in testHasQuestions) {
                        if (testHasQuestions.hasOwnProperty(testHasQuestionIndex)) {
                            for (var itemIndex in rawTestData) {
                                if (rawTestData.hasOwnProperty(itemIndex)) {
                                    if (rawTestData[itemIndex].question.idQuestion == testHasQuestions[testHasQuestionIndex].idQuestion) {
                                        rawTestData[itemIndex].testHasQuestion = testHasQuestions[testHasQuestionIndex];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    //setting up user answered question data
                    for (var userAnsweredQuestionsIndex in userAnsweredQuestions) {
                        if (userAnsweredQuestions.hasOwnProperty(userAnsweredQuestionsIndex)) {
                            for (var anotherItemIndex in rawTestData) {
                                if (rawTestData.hasOwnProperty(anotherItemIndex)) {
                                    if (rawTestData[anotherItemIndex].testHasQuestion.idTestHasQuestion == userAnsweredQuestions[userAnsweredQuestionsIndex].idTestHasQuestion) {
                                        rawTestData[anotherItemIndex].userAnsweredQuestion = userAnsweredQuestions[userAnsweredQuestionsIndex];
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    module.exports.calculateTestResult(rawTestData, function (result) {
                        success(result);
                    });
                }, function(err) {
                    failure(err);
                });
            }, function(err) {
                failure(err);
            });
        }, function(err) {
            failure(err);
        });
    }, function(err) {
        failure(err);
    });
};

module.exports.calculateTestResult = function (rawTestDate, result) {

    var resultValue = 0.0;
    async.each(rawTestDate, function (testInfo, callback) {

        //searching for key words
        var contains = true;
        //keyWord - comma separated values

        var parsedKeyWords = testInfo.question.keyWords.split(',');

        for (var keyWord in parsedKeyWords) {
            if (parsedKeyWords.hasOwnProperty(keyWord)) {
                if(testInfo.userAnsweredQuestion.answerRequest.indexOf(parsedKeyWords[keyWord]) == -1) {
                    contains = false;
                    break;
                }
            }
        }
        if(contains) {

            //query chainer performes multiple requests and returns array of results
            var chain = new Sequelize.Utils.QueryChainer();
            chain
                .add(ServerApplication.subjectDBs[testInfo.question.idSubjectDB]
                    .connection.query(testInfo.userAnsweredQuestion.answerRequest))
                .add(ServerApplication.subjectDBs[testInfo.question.idSubjectDB]
                    .connection.query(testInfo.question.correctRequest))
                .run()
                .success(function(results) {

                    //compare results

                    //TODO: Implement comparation logic
                    resultValue += rawTestDate.testHasQuestion.weight;

                    callback();
                }).error(function(err) {

                log.error('Query chainer requests failed:', err);
                callback();
            });
        }
    }, function () {

        result(resultValue);
    });
};


