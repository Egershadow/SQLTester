angular.module('Index')
    .service('testsService', ['BASE_DOMAIN', 'DEFAULT_API_URL', '$http', '$cookies', 'userService',
        function(BASE_DOMAIN, DEFAULT_API_URL, $http, $cookies, userService) {
        var testsService = this;

            testsService.getTests = function (success, failure) {
                var testsUrl = BASE_DOMAIN + DEFAULT_API_URL + '/users/me/tests';

                $http.get(testsUrl, {
                    headers: {
                        'x-access-token': userService.getAccessToken()
                    }
                }).then(function (response) {
                    //returning user
                    success(response.data.tests);
                }, function (response) {
                    failure(response)
                });
            };

            testsService.getCurrentTest = function () {
                return JSON.parse($cookies.get('currentTest'));
            };

            testsService.setCurrentTest = function (currentTest) {
                $cookies.put('currentTest', JSON.stringify(currentTest));
            };

            testsService.getResult = function (test, success, failure) {
                var resultsUrl = BASE_DOMAIN + DEFAULT_API_URL + '/users/me/tests/' + test.idTest + '/results';

                $http.get(resultsUrl, {
                    headers: {
                        'x-access-token': userService.getAccessToken()
                    }
                }).then(function (response) {
                    //returning user
                    success(response.data.result);
                }, function (response) {
                    failure(response)
                });
            };

        }]);