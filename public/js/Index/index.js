
angular.module('Index', ['ngRoute', 'ngCookies', 'Auth'])
    .config(['$routeProvider', function($routeProvider) {
        // route for the home page
        $routeProvider
            .when('/',  {
                templateUrl : '/views/partials/home',
                controller  : ''
            });
        $routeProvider
            .when('/test',  {
                templateUrl : '/views/partials/test',
                controller  : ''
            });
        $routeProvider
            .when('/result',  {
                templateUrl : '/views/partials/result',
                controller  : ''
            });
    }]).constant('BASE_DOMAIN', 'http://localhost:1337')
    .constant('DEFAULT_API_URL', '/api/v1');