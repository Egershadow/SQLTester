
var ServerApplication               = require('../libs/server-application');
var TestService                     = require('./test-service');
var io                              = require('socket.io');

module.exports.onConnect = function (socket) {

    socket.on('disconnect', module.exports.onDisconnect);

    socket.on('starttest',function (msg) {
        module.exports.onStartTest(this, msg)
    });

    socket.on('finishtest', function (msg) {
        module.exports.onFinishTest(this, msg)
    });

    socket.on('sendanswer', function (msg) {
        module.exports.onAnswer(this, msg)
    });

    socket.on('getimage', function (msg) {
        module.exports.onGetImage(this, msg)
    });
};

module.exports.onDisconnect = function () {
    //clear existing socket from app list
    var i = 25;
};

module.exports.onStartTest = function (socket, msg) {

    TestService.getQuestionsOfTest(msg.test.idTest, function (questions) {
        TestService.getTimeForTest(msg.test.idTest, function (seconds) {
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth();
            //month = ("0" + month).slice(-2);
            var day = now.getDay();
            //day = ("0" + day).slice(-2);
            var hours = now.getHours();
            //var hours = '23';
            //hours = ("0" + hours).slice(-2);
            var minutes = now.getMinutes();
            //minutes = ("0" + minutes).slice(-2);
            var resSeconds = now.getSeconds();
            //resSeconds = ("0" + resSeconds).slice(-2);

            var started = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + resSeconds;

            var testAttempt = {
                idTest : msg.test.idTest,
                idUser : msg.test.idUser,
                started : now,
                timer : setTimeout(function() {
                    module.exports.finishTest(testAttempt.idUser, testAttempt.idTest, testAttempt.startDate, function (result) {

                        socket.emit('testfinished', {});
                    }, function (error) {
                        socket.emit('testfinished', {
                            error : error
                        });
                    });

                }, seconds * 1000)
            };
            ServerApplication.networkConnections[socket.id.toString()] = testAttempt;
            socket.emit('teststarted', {
                started : now,
                questions : questions
            });
        }, function (err) {
        });
    }, function(err) {
    });
};

module.exports.onFinishTest = function (socket, msg) {
    var testAttempt = ServerApplication.networkConnections[socket.id.toString()];
    module.exports.finishTest(testAttempt.idUser, testAttempt.idTest, testAttempt.started, function (result) {
        socket.emit('testfinished', {
            result : result
        });

        //invalidating of timer
        clearTimeout(testAttempt.timer);

        //removing of old socket
        delete ServerApplication.networkConnections[socket.id.toString()];
    }, function (error) {
        socket.emit('testfinished', {
            error : error
        });
    });
};

module.exports.onAnswer = function (socket, msg) {
    var testAttempt = ServerApplication.networkConnections[socket.id.toString()];
    TestService.setAnswerToQuestionInTest(msg, testAttempt.idUser, testAttempt.idTest);
};

module.exports.finishTest = function (idUser, idTest, startDate, success, failure) {
    TestService.getTestResult(idUser, idTest, startDate, success, failure)
};


module.exports.onGetImage = function (socket, msg) {

    TestService.getQuestionsImage(msg.idQuestion, function (imageData) {
        socket.emit('imagereceived', {
            idQuestion : msg.idQuestion,
            image : imageData
        });
    }, function (err) {

    });
};
