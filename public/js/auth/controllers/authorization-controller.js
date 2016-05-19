angular.module('Auth').controller('AuthorizationController', AuthorizationController);

AuthorizationController.$inject = ['$window', 'userService'];

function AuthorizationController ($window, userService) {
    var authController = this;

    authController.user = {
        email : 'vadym.voitenko@nure.ua',
        password : 'password11'
    };
    authController.signInResultMessage = '';

    authController.signin = function () {
        authController.signInResultMessage = authController.getValidationErrorMessage(authController.user.email, authController.user.password);
        if(authController.signInResultMessage != '') {
            return;
        }
        //getting of user profile
        userService.signIn(authController.user, function(accessToken) {
            $window.location.href = '/';
        }, function(response) {
            authController.signInResultMessage = response.data.message;
        });
    };

    authController.singnout = function () {
        userService.signOut();
    };

    authController.getValidationErrorMessage = function (email, password) {
        var emailRegex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        var foundEmail = emailRegex.exec(email);
        if(!foundEmail) {
            return 'Invalid email format';
        }

        var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[a-z])[0-9a-zA-Z]{8,}$/;
        var foundPassword = passwordRegex.exec(password);
        if(!foundPassword) {
            return 'Invalid password format';
        }
        return '';
    };
}