angular.module('Auth')
    .service('userService', ['BASE_DOMAIN', 'DEFAULT_API_URL', '$http', '$cookies',
        function(BASE_DOMAIN, DEFAULT_API_URL, $http, $cookies) {
    var authService = this;

    authService.setAccessToken = function (accessToken) {
        $cookies.put('accessToken', accessToken);
    };

    authService.getAccessToken = function () {
        return $cookies.get('accessToken');
    };

    authService.signIn = function (user, success, failure) {
        //request sending
        var signInUrl = BASE_DOMAIN + DEFAULT_API_URL + '/auth/signin';
        var requestBody = {
            email : user.email,
            password : user.password
        };
        $http.post(signInUrl, requestBody).then(function (response) {
            //saving access token
            authService.setAccessToken(response.data.token);
            authService.setUserProfile(response.data.user);
            success(response.data.token);
        }, function (response) {
            failure(response)
        });
    };

    authService.signOut = function () {
        $cookies.remove('accessToken');
    };

    authService.isSigned = function () {
        return $cookies.get('accessToken') == "";
    };

    authService.getCurrentUserProfile = function (success, failure) {
        //request sending
        var userProfileUrl = BASE_DOMAIN + DEFAULT_API_URL + '/users/me';

        $http.get(userProfileUrl, {
            headers: {
                'x-access-token': authService.getAccessToken
            }
        }).then(function (response) {
            //returning user
            success(response.data);
        }, function (response) {
            failure(response)
        });
    };

    authService.getUserProfile = function () {
        return JSON.parse($cookies.get('userProfile'));
    };

    authService.setUserProfile = function (userProfile) {
        $cookies.put('userProfile', JSON.stringify(userProfile));
    };

}]);