
var Sequelize               = require('sequelize');
var config                  = require('./config');
var async                   = require('async');


module.exports.establishDefaultDBConnection = function (success, failure) {

    // initialize database connection
    var sequelize = new Sequelize(config.get('mysql:db'), config.get('mysql:username'), config.get('mysql:password'),
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
    var User                    = sequelize.import('../models/user');
    var Role                    = sequelize.import('../models/role');
    var UserHasRole             = sequelize.import('../models/user_has_role');
    var Topic                   = sequelize.import('../models/topic');
    var Question                = sequelize.import('../models/question');
    var TopicHasQuestion        = sequelize.import('../models/topic_has_question');
    var Test                    = sequelize.import('../models/test');
    var TestHasQuestion         = sequelize.import('../models/test_has_question');
    var Group                   = sequelize.import('../models/group');
    var UserAnsweredQuestion    = sequelize.import('../models/user_answered_question');
    var GroupHasTest            = sequelize.import('../models/group_has_test');
    var UserPassedTest          = sequelize.import('../models/user_passed_test');
    var SubjectDB               = sequelize.import('../models/subject_db');
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
        foreignKey: 'idTest'
    });
    Question.belongsToMany(Test, {
        as: 'questions',
        through: TestHasQuestion,
        foreignKey: 'idQuestion'
    });
    //group relationship
    Group.hasMany(User, {
        as: 'groups',
        foreignKey: 'idGroup'
    });

    //user passed test relationship
    User.belongsToMany(Test,{
        as: 'users',
        through: UserPassedTest,
        foreignKey: 'idUser'
    });
    Test.belongsToMany(User, {
        as: 'tests',
        through: UserPassedTest,
        foreignKey: 'idTest'
    });

    //user answered question relationship
    User.belongsToMany(TestHasQuestion,{
        as: 'users',
        through: UserAnsweredQuestion,
        foreignKey: 'idUser'
    });
    TestHasQuestion.belongsToMany(User, {
        as: 'testHasQuestions',
        through: UserAnsweredQuestion,
        foreignKey: 'idTestHasQuestion'
    });

    //group has test relationship
    Group.belongsToMany(Test, {
        as: 'groups',
        through: GroupHasTest,
        foreignKey: 'idGroup'
    });
    Test.belongsToMany(Group, {
        as: 'tests',
        through: GroupHasTest,
        foreignKey: 'idTest'
    });

    //subject db relation
    SubjectDB.hasMany(Question, {
        as: 'subjectdbs',
        foreignKey: 'idSubjectDB'
    });

    module.exports.defaultConnection = sequelize;

    sequelize.authenticate().then(function(err) {
        if (!err) {
            sequelize.sync().then(function() {
                success(sequelize);
            })
        } else {
            failure(err);
        }
    });
};

module.exports.establishConnection = function (dbInfo, success, failure) {
    module.exports.initConnection(
        dbInfo.dbName,
        dbInfo.username,
        dbInfo.password,
        dbInfo.dbPath,
        dbInfo.queries.split(';'),
        function (sequelize) {
            sequelize.authenticate().then(function(err) {
                if (!err) {
                    //sequelize.sync().then(function() {
                    success(dbInfo, sequelize);
                    //})
                } else {
                    failure(err);
                }
            });
    });
};

module.exports.initConnection = function (dbname, username, password, dbpath, queries, done) {
    var sequelize = new Sequelize(dbname, username, password,
        {
            dialect: 'sqlite',
            storage: dbpath,

            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        }
    );
    var currentIndex = 0;
    if(queries.length > 0) {

        var chain = new Sequelize.Utils.QueryChainer();
        for (var queryIndex in queries) {
            if (queries.hasOwnProperty(queryIndex)) {
                chain.add(sequelize.query(queries[queryIndex]))
            }
        }
        chain.run()
                    .success(function(results) {
                        done(sequelize);
                    }).error(function(err) {

                    log.error('Query chainer requests failed:', err);
                });


    //        //query chainer performes multiple requests and returns array of results
    //        var chain = new Sequelize.Utils.QueryChainer();
    //
    //        chain
    //            .add(ServerApplication.subjectDBs[testInfo.question.idSubjectDB]
    //                .connection.query(testInfo.userAnsweredQuestion.answerRequest))
    //            .add(ServerApplication.subjectDBs[testInfo.question.idSubjectDB]
    //                .connection.query(testInfo.question.correctRequest))
    //            .run()
    //            .success(function(results) {
    //
    //                //compare results
    //
    //                //TODO: Implement comparation logic
    //                resultValue += rawTestDate.testHasQuestion.weight;
    //
    //                callback();
    //            }).error(function(err) {
    //
    //            log.error('Query chainer requests failed:', err);
    //            callback();
    //        });
    //
    //    }, function () {
    //
    //        result(resultValue);
    //    });
    //} else {
    //    done(sequelize);
    }
};

module.exports.executeQuery = function executePassedQuery(sequelize, queries, currentIndex, done) {
    sequelize.query(queries[currentIndex]).spread(function(results, metadata) {
        ++currentIndex;
        if(currentIndex == queries.length) {
            done(sequelize);
        } else {
            executePassedQuery(sequelize, queries, currentIndex, done);
        }
    });
};


