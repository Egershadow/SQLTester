angular.module('Index')
    .service('testsService', ['BASE_DOMAIN', 'DEFAULT_API_URL', '$http', '$cookies', 'userService',
        function(BASE_DOMAIN, DEFAULT_API_URL, $http, $cookies, userService) {
        var testsService = this;

            testsService.getTests = function (success, failure) {
                //getting user info
                var userProfile = userService.getUserProfile();

                var testsUrl = BASE_DOMAIN + DEFAULT_API_URL + '/groups/' + userProfile.idGroup + '/tests';

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

            testsService.setUserInfo = function (userInfo) {
                $cookies.put('userInfo', userInfo);
            };

            testsService.getUserInfo = function () {
                return $cookies.get('userInfo');
            };

        }]);