angular.module('Index')
    .service('socketService', ['BASE_DOMAIN', 'DEFAULT_API_URL', '$http', userService,
        function(BASE_DOMAIN, DEFAULT_API_URL, $http, userService) {
            var socketService = this;

            socketService.delegate = {};

            socketService.establishConnectionToSocket = function (success, failure) {
                var testsUrl = BASE_DOMAIN + DEFAULT_API_URL + '/sockets';

                $http.get(testsUrl, {
                    headers: {
                        'x-access-token': userService.getAccessToken()
                    }
                }).then(function (response) {

                    //establishing connection to server
                    socketService.socket = io.connect(response.data.socket, {
                        'reconnect': true,
                        'reconnection delay': 500,
                        'max reconnection attempts': 10
                    });

                    socketService.socket.on('teststarted', function (msg) {
                        socketService.delegate.onTestStarted(socket, msg);
                    });

                    socketService.socket.on('testfinished', function (msg) {
                        socketService.delegate.onTestFinished(socket, msg);
                    });

                    socketService.socket.on('imagereceived', function (msg) {
                        socketService.delegate.onImageReceived(socket, msg);
                    });

                    //returning socket to user
                    success(socketService.socket);
                }, function (response) {
                    failure(response)
                });
            };

            socketService.startTest = function (test) {
                socket.emit('starttest', {
                    test : {
                        idTest : test.idTest,
                        idUser : userService.getUserProfile().idUser
                    }
                });
            };

            socketService.finishTest = function () {
                socket.emit('finishtest', {});
            };

            socketService.getImage = function (idQuestion) {
                socket.emit('getimage', {
                    idQuestion : idQuestion
                });
            };

        }]);