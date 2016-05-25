angular.module('Index')
    .controller('TestController', TestController);

TestController.$inject = ['testService', '$location', '$filter'];

function TestController (testService, $location, $filter) {
    var testController = this;

    testController.questionsInTest = {};
    testController.currentIndex = 0;
    testController.answers = {};

    testController.getQuestions = function () {
        testController.currentIndex = 0;
    };

    testController.showNextQuestion = function () {
        ++testController.currentIndex;
    };

    testController.showPreviousQuestion = function () {
        --testController.currentIndex;
    };


}