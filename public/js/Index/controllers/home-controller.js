
angular.module('Index')
    .controller('HomeController', HomeController);

HomeController.$inject = ['testsService', '$location', '$filter'];

function HomeController (testService, $location, $filter) {
    var homeController = this;

    homeController.tests = [{testName:"test1", createdAt:Date.now()}, {testName:"test2", createdAt:Date.now()}];

    homeController.getFormattedDate = function (date) {
        return $filter('date')(date, "dd.MM.yyyy H:mm");
    };

    homeController.startTest = function (test) {
//      $location.path('/test/%s/question/', test.idTest) = '/';
//        userService.signIn(authController.user, function(accessToken) {
//            $location.path('/test/%s/question/', test.idTest) = '/';
//        }, function(response) {
//            authController.signInResultMessage = response.data.message;
//        });
    };
}