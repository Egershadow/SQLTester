
var ServerApplication               = require('../libs/server-application');
var TestService                     = require('./test-service');
var io                              = require('socket.io');

module.exports.onConnect = function (socket) {

    socket.on('disconnect', module.exports.onDisconnect);

    socket.on('starttest',function (msg) {
        module.exports.onStartTest(socket, msg)
    });

    socket.on('finishtest', function (msg) {
        module.exports.onFinishTest(socket, msg)
    });

    socket.on('sendanswer', function (msg) {
        module.exports.onAnswer(socket, msg)
    });

    socket.on('getimage', function (msg) {
        module.exports.onGetImage(socket, msg)
    });
};

module.exports.onDisconnect = function () {
    //clear existing socket from app list
};

module.exports.onStartTest = function (socket, msg) {

    TestService.getQuestionsOfTest(msg.idTest, function (questions) {
        TestService.getTimeForTest(msg.idTest, function (seconds) {
            var started = new Date();
            var testAttempt = {
                idTest : msg.test.idTest,
                idUser : msg.test.idUser,
                startDate : started,
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
                started : started,
                questions : questions
            });
        }, function (err) {
        });
    }, function(err) {
    });
};

module.exports.onFinishTest = function (socket, msg) {
    var testAttempt = ServerApplication.networkConnections[socket.id.toString()];
    module.exports.finishTest(testAttempt.idUser, testAttempt.idTest, testAttempt.startDate, function (result) {
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
    //TODO: Save answer to db
};

module.exports.finishTest = function (idUser, idTest, startDate, success, failure) {
    TestService.getTestResult(idUser, idTest, startDate, success, failure)
};

module.exports.onGetImage = function (socket, msg) {

    TestService.getQuestionsImage(msg.idQuestion, function (imageData) {
        socket.emit('imagereceived', {
            image : imageData
        });
    }, function (err) {

    });
};
