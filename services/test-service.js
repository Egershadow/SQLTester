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
            var idTestHasQuestions = [];
            for(var index in testHasQuestions) {
                if (testHasQuestions.hasOwnProperty(index)) {
                    idQuestions.push(testHasQuestions[index].idQuestion);
                    idTestHasQuestions.push(testHasQuestions[index].idTestHasQuestion)
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
                    idTestHasQuestion : idTestHasQuestions
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
    async.eachSeries(rawTestDate, function (testInfo, callback) {

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
                        }, function (err) {
                            internalCallback(null, null);
                        });
                    },
                    function(internalCallback){
                        ServerApplication.subjectDBs[testInfo.question.idSubjectDB]
                            .connection.query(testInfo.question.correctRequest).then(function (results) {

                            //getting fetched data without meta
                            internalCallback(null, results);
                        }, function (err) {
                            internalCallback(null, null);
                        });
                    }
                ],
                function(err, results){

                    if(err) {
                        log.error('Query requests failed:', err);
                        callback();
                        return;
                    }

                    //check if there are no sql errors, if they are, resultPair will contain only one value
                    if(results[1] == undefined || results[1] == null) {
                        callback();
                        return;
                    }

                    //check if length of result arrays not equal
                    if(results[0].length != results[1].length) {
                        callback();
                        return;
                    }

                    //comparing gotten results
                    var equal = true;
                    for(var i = 0; i < results[0].length; ++i) {
                        var userAnsweredObject = results[0][0][i];
                        var rightAnswerObject = results[1][0][i];

                        //getting of property of answered object
                        for(var userAnsweredIndex in userAnsweredObject) {
                            var isPropertyEqual = false;
                            if (userAnsweredObject.hasOwnProperty(userAnsweredIndex)) {

                                //getting of property of right answer object
                                for(var rightAnswerIndex in rightAnswerObject) {
                                    if (rightAnswerObject.hasOwnProperty(rightAnswerIndex)) {

                                        //check if there are property in both data sets
                                        if(userAnsweredIndex == rightAnswerIndex) {

                                            //check if values are equal of both properties
                                            if(userAnsweredObject[userAnsweredIndex] == rightAnswerObject[rightAnswerIndex]) {
                                                isPropertyEqual = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                                if(!isPropertyEqual) {
                                    equal = false;
                                    break;
                                }
                            }
                        }
                        if(!equal) {
                            break;
                        }
                    }
                    if(equal) {
                        resultValue += testInfo.testHasQuestion.weight;
                    }
                    callback();
                });
        } else {
            callback();
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
                    for (var indexTestHasQuestion in testHasQuestions) {
                        if (testHasQuestions.hasOwnProperty(indexTestHasQuestion)) {
                            if (testHasQuestions[indexTestHasQuestion].idQuestion == questions[questionIndex].idQuestion) {
                                questionData.push({
                                    questionText: questions[questionIndex].questionText,
                                    idQuestion: questions[questionIndex].idQuestion,
                                    idTestHasQuestion: testHasQuestions[indexTestHasQuestion].idTestHasQuestion
                                });
                                break;
                            }
                        }
                    }
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

module.exports.setAnswerToQuestionInTest = function (answer) {

    var UserAnsweredQuestion    = ConnectionFabric.defaultConnection.import('../models/user_answered_question');
    UserAnsweredQuestion.destroy( {
        where : {
            idTestHasQuestion : answer.idTestHasQuestion,
            date : {
                $gt : answer.date
            }
        }
    }).then(function () {
        UserAnsweredQuestion.create(
            {
                idTestHasQuestion : answer.idTestHasQuestion,
                date : answer.date,
                answerRequest : answer.answerRequest,
                idUser : answer.idUser

            }).then(function (userAnsweredQuestion) {
            var i = 228;
        }, function(err) {
            log.error('Answer creation error(%d): %s', err.code, err.message);
        });
    });
};


