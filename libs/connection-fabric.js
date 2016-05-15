
var Sequelize = require('sequelize');
var config  = require('./config');
var connectionFabric = new Object();

connectionFabric.establishDefaultConnection = function (success, failure) {
// initialize database connection
    var emptyQuerisArray = new Array();
    this.initConnection(config.get('mysql:db'),
        config.get('mysql:username'),
        config.get('mysql:password'),
        emptyQuerisArray,
        function (sequelize) {
            //model definition
            var User                = sequelize.import('../models/user');
            var Role                = sequelize.import('../models/role');
            var UserHasRole         = sequelize.import('../models/user_has_role');
            var Topic               = sequelize.import('../models/topic');
            var Question            = sequelize.import('../models/question');
            var TopicHasQuestion    = sequelize.import('../models/topic_has_question');
            var Test                = sequelize.import('../models/test');
            var TestHasQuestion     = sequelize.import('../models/test_has_question');
            var Group               = sequelize.import('../models/group');
            var UserPassedTest      = sequelize.import('../models/user_passed_test');
            //definition of relations between models
            //user has role relationship
            User.belongsToMany(Role, {
                as: 'users',
                through: UserHasRole,
                foreignKey: 'idUser'
            });
            Role.belongsToMany(User, {
                as: 'roles',
                through: UserHasRole,
                foreignKey: 'idRole'
            });
            //topic has question relationship
            Topic.belongsToMany(Question, {
                as: 'topics',
                through: TopicHasQuestion,
                foreignKey: 'idTopic'
            });
            Question.belongsToMany(Topic, {
                as: 'questions',
                through: TopicHasQuestion,
                foreignKey: 'idQuestion'
            });
            //test has question relationship
            Test.belongsToMany(Question, {
                as: 'tests',
                through: TestHasQuestion,
                foreignKey: 'idTopic'
            });
            Question.belongsToMany(Test, {
                as: 'questions',
                through: TestHasQuestion,
                foreignKey: 'idQuestion'
            });
            //group relationship
            Group.hasMany(User, {
                as: 'groups',
                foreignKey: 'group'
            });
            //user passed test
            UserPassedTest.hasMany(TestHasQuestion, {
                as: 'testHasQuestions',
                foreignKey: 'idTestHasQuestion'
            });
            UserPassedTest.hasMany(User, {
                as: 'users',
                foreignKey: 'idUser'
            });

            sequelize.authenticate().then(function(err) {
                if (!err) {
                    sequelize.sync().then(function() {
                        success(sequelize);
                    })
                } else {
                    failure(err);
                }
            });

        }
    );
};

connectionFabric.establishConnection = function (dbname, username, password, queries, success, failure) {
    this.initConnection(dbname, username, password, queries, function (sequelize) {
        sequelize.authenticate().then(function(err) {
            if (!err) {
                sequelize.sync().then(function() {
                    success(sequelize);
                })
            } else {
                failure(err);
            }
        });
    });
};

connectionFabric.initConnection = function (dbname, username, password, queries, done) {
    var sequelize = new Sequelize(dbname, username, password,
        {
            host: 'localhost',
            dialect: 'mysql',

            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        }
    );
    var currentIndex = 0;
    if(queries.length > 0) {
        this.executeQuery(sequelize, queries, currentIndex, done);
    } else {
        done(sequelize);
    }
};

connectionFabric.executeQuery = function executePassedQuery(sequelize, queries, currentIndex, done) {
    sequelize.query(queries[currentIndex]).spread(function(results, metadata) {
        ++currentIndex;
        if(currentIndex == queries.length) {
            done(sequelize);
        } else {
            executePassedQuery(sequelize, queries, currentIndex, done);
        }
    });
};

module.exports = connectionFabric;
