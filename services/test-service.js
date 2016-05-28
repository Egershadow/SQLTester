var ServerApplication       = require('../libs/server-application');
var ConnectionFabric        = require('../libs/connection-fabric');
var config                  = require('../libs/config');
var async                   = require('async');

//logging
var intel           = require('intel');
var log             = require('../libs/log')('console', intel.DEBUG);




module.exports.getTimeForTest = function (idTest, success, failure) {

    var TestHasQuestion         = ConnectionFabric.defaultConnection.import('../models/test_has_question');

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
        var totalTime = testHasQuestions.length * config.get('minutesForSingleQuestion') * 60;

        success(totalTime);
    }, function(err) {
        failure(err);
    });
};

module.exports.getTestResult = function (idUser, idTest, startDate, success, failure) {

    var TestHasQuestion         = ConnectionFabric.defaultConnection.import('../models/test_has_question');
    var UserPassedTest          = ConnectionFabric.defaultConnection.import('../models/user_passed_test');
    var UserAnsweredQuestion    = ConnectionFabric.defaultConnection.import('../models/user_answered_question');
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
                        UserPassedTest.create(
                            {
                                testResult : result,
                                idUser : idUser,
                                idTest : idTest,
                                date : new Date()

                            }).then(function (userPassedTest) {
                                success(result);
                        }, function(err) {
                            log.error('Internal error when creating camera(%d): %s', err.code, err.message);
                            failure(err);
                        });
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

        var len = parsedKeyWords.length, i;

        for(i = 0; i < len; i++ )
            parsedKeyWords[i] && parsedKeyWords.push(parsedKeyWords[i]);  // copy non-empty values to the end of the array

        parsedKeyWords.splice(0 , len);

        for (var keyWord in parsedKeyWords) {
            if (parsedKeyWords.hasOwnProperty(keyWord)) {
                if(testInfo.userAnsweredQuestion.answerRequest.indexOf(parsedKeyWords[keyWord]) == -1) {
                    contains = false;
                    break;
                }
            }
        }
        if(contains) {

            //performing multiple requests and returns array of results
            async.series([
                    function(internalCallback){
                        ServerApplication.subjectDBs[testInfo.question.idSubjectDB]
                            .connection.query(testInfo.userAnsweredQuestion.answerRequest).then(function (results) {
                            internalCallback(null, results);
                        });
                    },
                    function(internalCallback){
                        ServerApplication.subjectDBs[testInfo.question.idSubjectDB]
                            .connection.query(testInfo.question.correctRequest).then(function (results) {
                            internalCallback(null, results);
                        });
                    }
                ],
                function(err, results){

                    if(err) {
                        log.error('Query chainer requests failed:', err);
                        callback();
                        return;
                    }
                    //compare results

                    //TODO: Implement comparation logic
                    resultValue += rawTestDate.testHasQuestion.weight;
                    callback();
                });
        }
    }, function () {

        result(resultValue);
    });
};

module.exports.getQuestionsOfTest = function (idTest, success, failure) {
    var TestHasQuestion                = ConnectionFabric.defaultConnection.import('../models/test_has_question');
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
        var Question                = ConnectionFabric.defaultConnection.import('../models/question');
        Question.findAll( {
            where : {
                idQuestion : idQuestions
            }
        }).then(function(questions) {

            var questionData = [];
            for (var questionIndex in questions) {
                if (questions.hasOwnProperty(questionIndex)) {
                    questionData.push({
                        questionText : questions[questionIndex].questionText,
                        idQuestion : questions[questionIndex].idQuestion
                    });
                }
            }
            success(questionData);
        }, function(err) {
            failure(err);
        });
    }, function (err) {
        failure(err);
    });
};

//module.exports.getQuestionsImage = function (idQuestion, success, failure) {
//
//    var Question                = ConnectionFabric.defaultConnection.import('../models/question');
//    var SubjectDB               = ConnectionFabric.defaultConnection.import('../models/subject_db');
//    Question.findById(idQuestion).then(function(question) {
//
//        //getting subject db that contains schema image path
//        SubjectDB.findById(question.idSubjectDB).then(function(subjectDB) {
//
//            //reading image from storage
//            require('fs').readFile(subjectDB.imagePath, function(err, data) {
//                if (err) {
//                    log.error('Image reading fail:', err);
//                    failure(err);
//                } else {
//                    success(new Buffer(data).toString('base64'));
//                }
//            });
//        }, function (err) {
//            failure(err);
//        });
//    }, function(err) {
//        failure(err);
//    });
//};

module.exports.getQuestionsImage = function (idQuestion, success, failure) {

    var Question                = ConnectionFabric.defaultConnection.import('../models/question');
    var SubjectDB               = ConnectionFabric.defaultConnection.import('../models/subject_db');
    Question.findById(idQuestion).then(function(question) {

        //getting subject db that contains schema image path
        SubjectDB.findById(question.idSubjectDB).then(function(subjectDB) {

            var image = subjectDB.imagePath.substring(subjectDB.imagePath.lastIndexOf('/') + 1);

            success(image);

        }, function (err) {
            failure(err);
        });
    }, function(err) {
        failure(err);
    });
};


