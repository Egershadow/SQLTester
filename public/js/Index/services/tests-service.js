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

            testsService.sendTestPassingResult = function (testPassedInfo, failure) {
                ////request sending
                //var signInUrl = BASE_DOMAIN + DEFAULT_API_URL + '/auth/signin';
                //var requestBody = {
                //    email : user.email,
                //    password : user.password
                //};
                //$http.post(signInUrl, requestBody).then(function (response) {
                //    //saving access token
                //    authService.setAccessToken(response.data.token);
                //    success(response.data.token);
                //}, function (response) {
                //    failure(response)
                //});
            };

            testsService.getQuestions = function (testId, success, failure) {
                //request sending
                var questionsUrl = BASE_DOMAIN + DEFAULT_API_URL + '/users/me/tests/' + testId + '/questions';

                $http.get(questionsUrl, {
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

            testsService.setUserInfo = function (success, failure) {
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

            testsService.setUserInfo = function (userInfo) {
                $cookies.put('userInfo', userInfo);
            };

            testsService.getUserInfo = function () {
                return $cookies.get('userInfo');
            };

            testsService.getCurrentTest = function () {
                return JSON.parse($cookies.get('currentTest'));
            };

            testsService.setCurrentTest = function (currentTest) {
                $cookies.put('currentTest', JSON.stringify(currentTest));
            };

        }]);