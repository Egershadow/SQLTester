
angular.module('Index')
    .controller('ResultController', ResultController);

ResultController.$inject = ['testsService', '$location'];

function ResultController (testsService, $location) {
    var resultController = this;

    resultController.resultMessage = '';
    resultController.result = 0;
    var currentTest = testsService.getCurrentTest();
    testsService.getResult(currentTest, function (result) {
        resultController.result = result;
        if(resultController.result > 60) {
            resultController.resultMessage = 'Success!\nTest passed successfully!';
        } else {
            resultController.resultMessage = 'Failure!\nTest not passed!';
        }
    }, function (err) {

    });

    resultController.goHome = function () {

        testsService.setCurrentTest({});
        $location.path('/');
    };
}