
var ServerApplication               = require('../libs/server-application');
var TestService                     = require('./test-service');
var io                              = require('socket.io');

module.exports.onConnect = function (socket) {

    socket.on('disconnect', module.exports.onDisconnect);

    socket.on('starttest',function (msg) {
        module.exports.onStartTest(socket, msg)
    });

    socket.on('stoptest', function (msg) {
        module.exports.onEndTest(socket, msg)
    });

    socket.on('sendanswer', function (msg) {
        module.exports.onAnswer(socket, msg)
    });
};

module.exports.onDisconnect = function () {
    //clear existing socket from app list
};

module.exports.onStartTest = function (socket, msg) {

    TestService.getTimeForTest(msg.idTest, function (seconds) {
        var testAttempt = {
            idTest : msg.test.idTest,
            idUser : msg.test.idUser,
            startDate : new Date(),
            timer : setTimeout(function() {
                module.exports.finishTest(testAttempt.idUser, testAttempt.idTest, testAttempt.startDate, function (result) {
                    socket.emit('testfinished', {
                        result : result
                    });
                }, function (error) {
                    socket.emit('testfinished', {
                        error : error
                    });
                });

            }, seconds * 1000)
        };
        ServerApplication.networkConnections.push(testAttempt);
    }, function (err) {

    });

};

module.exports.onEndTest = function (socket, msg) {

};

module.exports.onAnswer = function (socket, msg) {

};

module.exports.finishTest = function (idUser, idTest, startDate, success, failure) {
    TestService.getTestResult(idUser, idTest, startDate, success, failure)
};
