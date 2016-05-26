angular.module('Index')
    .controller('TestController', TestController);

TestController.$inject = ['testService', 'socketService', '$location', '$filter'];

function TestController (testService, socketService, $location, $filter) {
    var testController = this;

    testController.questions = {};
    testController.currentIndex = 0;
    testController.answers = {};
    socketService.delegate = testController;

    socketService.establishConnectionToSocket(function (socket) {
        socketService.startTest(testService.getCurrentTest());
    }, function (err) {

    });

    testController.showNextQuestion = function () {
        if(testController.currentIndex != (testController.questions.length - 1)) {
            ++testController.currentIndex;
            testController.downloadImageIfNeeded();
        }
    };

    testController.showPreviousQuestion = function () {
        if(testController.currentIndex != 0) {
            --testController.currentIndex;
            testController.downloadImageIfNeeded();
        }
    };

    testController.onTestStarted = function (socket, msg) {
        testController.questions = msg.questions;
        socketService.getImage(testController.questions[currentIndex].idQuestion);
    };

    testController.onImageReceived = function (socket, msg) {

        //setting of image data source property to certain question
        for(var i = 0; i < testController.questions.length; ++i) {
            if(testController.questions[i].idQuestion == msg.idQuestion) {
                testController.questions[i].imageData = 'data:image/png;base64,' + msg.image;
            }
        }
        testController.questions = msg.questions;
    };

    testController.onTestFinished = function (socket, msg) {
        $location.path('/');
    };

    testController.downloadImageIfNeeded = function () {
        if(questions[currentIndex].imageData == undefined) {
            socketService.getImage(testController.questions[currentIndex].idQuestion);
        }
    }


}