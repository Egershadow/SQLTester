angular.module('Index')
    .service('socketService', ['BASE_DOMAIN', 'DEFAULT_API_URL', '$http', 'userService',
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
                        //'reconnect': true,
                        //'reconnection delay': 500,
                        //'max reconnection attempts': 10
                    });

                    socketService.socket.on('connect_error', function(err){
                        console.log('Connection Failed');
                    });

                    socketService.socket.on('teststarted', function (msg) {
                        socketService.delegate.onTestStarted(socketService.socket, msg);
                    });

                    socketService.socket.on('testfinished', function (msg) {
                        socketService.delegate.onTestFinished(socketService.socket, msg);
                    });

                    socketService.socket.on('imagereceived', function (msg) {
                        socketService.delegate.onImageReceived(socketService.socket, msg);
                    });

                    //returning socket to user
                    success(socketService.socket);
                }, function (response) {
                    failure(response)
                });
            };

            socketService.startTest = function (test) {
                socketService.socket.emit('starttest', {
                    test : {
                        idTest : test.idTest,
                        idUser : userService.getUserProfile().idUser
                    }
                });
            };

            socketService.finishTest = function () {
                socketService.socket.emit('finishtest', {});
            };
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth();
            var day = now.getDay();
            var hours = now.getHours();
            var minutes = now.getMinutes();
            var seconds = now.getSeconds();

            socketService.sendAnswer = function (answer) {
                socketService.socket.emit('sendanswer', {
                    idTestHasQuestion : answer.idTestHasQuestion,
                    date : year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds,
                    answerRequest : answer.answerRequest,
                    idUser : userService.getUserProfile().idUser
                });
            };

            socketService.getImage = function (idQstion) {
                socketService.socket.emit('getimage', {
                    idQuestion : idQstion
                });
            };

        }]);