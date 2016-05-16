angular.module('Index')
    .service('testsService', ['BASE_DOMAIN', 'DEFAULT_API_URL', '$http', '$cookies',
        function(BASE_DOMAIN, DEFAULT_API_URL, $http, $cookies) {
        var testsService = this;

            testsService.getTests = function (success, failure) {
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

        }]);