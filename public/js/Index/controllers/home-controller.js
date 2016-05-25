
angular.module('Index')
    .controller('HomeController', HomeController);

HomeController.$inject = ['testsService', '$location', '$filter'];

function HomeController (testService, $location, $filter) {
    var homeController = this;

    homeController.tests = [];
    testService.getTests(function (tests) {
        homeController.tests = tests;
    }, function () {

    });

    homeController.getFormattedDate = function (date) {
        return $filter('date')(date, "dd.MM.yyyy H:mm");
    };

    homeController.startTest = function (test) {

        testsService.setCurrentTest(test);
        //TODO:change current ng-view
    };
}