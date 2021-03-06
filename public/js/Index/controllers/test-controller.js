angular.module('Index')
    .controller('TestController', TestController);

TestController.$inject = ['testsService', 'socketService', '$location', 'userService', '$scope', '$timeout'];

function TestController (testService, socketService, $location, userService, $scope, $timeout) {
    var testController = this;

    testController.questions = [];
    testController.currentIndex = 0;
    socketService.delegate = testController;

    testController.minutes = 0;
    testController.seconds = 0;
    testController.onTimeout = function(){
        if(testController.seconds == 0 && testController.minutes == 0) {
            return;
        }
        if(testController.seconds == 0 && testController.minutes > 0) {
            testController.seconds = 59;
            testController.minutes--;
        } else {
            testController.seconds--;
        }
        //testController.seconds--;
        //if(testController.seconds == 59) {
        //    if(testController.minutes > 0) {
        //        testController.minutes--;
        //    }
        //}
        mytimeout = $timeout(testController.onTimeout,1000);
    };
    var mytimeout = $timeout(testController.onTimeout,1000);

    socketService.establishConnectionToSocket(function (socket) {
        socketService.startTest(testService.getCurrentTest());
    }, function (err) {

    });

    testController.showNextQuestion = function () {
        if(testController.currentIndex != (testController.questions.length - 1)) {
            testController.sendAnswerToCurrentQuestion();
            testController.downloadImageIfNeeded();
            ++testController.currentIndex;
        }
    };

    testController.showPreviousQuestion = function () {
        if(testController.currentIndex != 0) {
            testController.sendAnswerToCurrentQuestion();
            testController.downloadImageIfNeeded();
            --testController.currentIndex;
        }
    };

    testController.finishTest = function () {
        testController.sendAnswerToCurrentQuestion();
        socketService.finishTest();
    };

    testController.onTestStarted = function (socket, msg) {
        $scope.$apply(function(){
            testController.questions = msg.questions;
            for(var i = 0; i < testController.questions[i]; ++i) {
                testController.questions[i].answer = {
                    previous : ''
                };
            }
            testController.minutes = msg.minutes;
            testController.seconds = msg.seconds;
        });
        socketService.getImage(testController.questions[testController.currentIndex].idQuestion);
    };

    testController.onImageReceived = function (socket, msg) {
        $scope.$apply(function(){

            //setting of image data source property to certain question
            for(var i = 0; i < testController.questions.length; ++i) {
                if (testController.questions[i].idQuestion == msg.idQuestion) {
                    testController.questions[i].imageData = 'images/' + msg.image;
                }
            }
        });
    };

    testController.onTestFinished = function (socket, msg) {
        $scope.$apply(function(){
            $location.path('/result');
        });
    };

    testController.downloadImageIfNeeded = function () {
        if(testController.questions[testController.currentIndex].imageData == undefined) {
            socketService.getImage(testController.questions[testController.currentIndex].idQuestion);
        }
    };

    testController.sendAnswerToCurrentQuestion = function () {


        var question = testController.questions[testController.currentIndex];
        if (question.answer == undefined || question.answer.answerRequest == undefined) {
            return;
        }
        if(testController.questions[testController.currentIndex].answer.answerRequest.length < 1) {
            return;
        }

        //storing of previous request helps to reduce count of requests to server
        if(question.answer.previous == question.answer.answerRequest) {
            return;
        } else {
            question.answer.previous = question.answer.answerRequest;
        }
        testController.questions[testController.currentIndex].answer = {
            idUser: userService.getUserProfile().idUser,
            answerRequest: testController.questions[testController.currentIndex].answer.answerRequest,
            idTestHasQuestion: testController.questions[testController.currentIndex].idTestHasQuestion,
            previous : testController.questions[testController.currentIndex].answer.answerRequest
        };
        socketService.sendAnswer(testController.questions[testController.currentIndex].answer);

    }


}
