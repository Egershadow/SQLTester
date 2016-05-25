var config              = require('./config');
var ConnectionFabric    = require('./connection-fabric');
var SocketService       = require('../services/socket-service');
var async               = require('async');


module.exports.networkConnections = {};
module.exports.subjectDBs = {};

module.exports.startListenPollingSocket = function () {

    var io = require('socket.io').listen(config.get('socketPort'));
    io.sockets.on('connection', SocketService.onConnect);
};

module.exports.establishConnectionToSubjectDBs = function (success, failure) {
    var SubjectDB           = ConnectionFabric.defaultConnection.import('../models/subject_db');
    SubjectDB.findAll({}).then(function(subjectDBs) {

        //process each db record
        async.each(subjectDBs, function (dbInfo, callback) {

            //storing info about each subject db in property of server application
            module.exports.subjectDBs[dbInfo.idSubjectDB] = dbInfo;

            //connecting will be performed later
            ConnectionFabric.establishConnection(dbInfo, function (dbInfo, sequelize) {

                //setting up connection property to each subject db
                module.exports.subjectDBs[dbInfo.idSubjectDB].connection = sequelize;
                callback();
            }, function (err) {
                callback(err)
            });
        }, function (err) {

            //error returned by callback function
            if(err) {
                failure(err);
                return;
            }

            success();
        });

    }, function(err) {
        failure(err);
    });
};
