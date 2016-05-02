var Sequelize       = require('sequelize');
var config          = require('../libs/config');

// initialize database connection
var sequelize = new Sequelize(
    config.get('mysql:db'),
    config.get('mysql:username'),
    config.get('mysql:password'),
    {
        host: 'localhost',
        dialect: 'mysql',

        pool: {
            max: 5,
            min: 0,
            idle: 10000
        }
});

var User            = sequelize.import('./user');
var Role            = sequelize.import('./role');
var UserHasRole     = sequelize.import('./user_has_role');

//relations
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
// export connection
module.exports = sequelize;