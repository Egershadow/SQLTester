
angular.module('sqlTesterApp', ['ngRoute', 'phonecatControllers'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: '/',
            controller: 'IndexController'
        }).
        when('/auth', {
            templateUrl: '/auth',
            controller: 'AuthController'
        }).
        otherwise({
            redirectTo: '/'
        });
    }]);