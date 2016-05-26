
angular.module('Index', ['ngRoute', 'ngCookies', 'Auth'])
    .config(['$routeProvider', function($routeProvider) {
        // route for the home page
        $routeProvider
            .when('/',  {
                templateUrl : '/views/partials/home',
                controller  : 'HomeController'
            });
        $routeProvider
            .when('/test',  {
                templateUrl : '/views/partials/test',
                controller  : 'TestController'
            });
    }]).constant('BASE_DOMAIN', 'http://localhost:1337')
    .constant('DEFAULT_API_URL', '/api/v1');