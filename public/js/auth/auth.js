angular.module('Auth', ['ngRoute', 'ngCookies'])
    .config(['$routeProvider', function($routeProvider) {
    // route for the home page
    $routeProvider
        .otherwise( {
            templateUrl : '/views/partials/signin',
            controller  : 'AuthorizationController'
        });
}]).constant('BASE_DOMAIN', 'http://localhost:1337')
    .constant('DEFAULT_API_URL', '/api/v1')
    .constant('EMAIL_REGEXP', '/api/v1');