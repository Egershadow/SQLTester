
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('User', {

        //primary key
        idUser: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},

        //user email
        email: {type: DataTypes.STRING(128), allowNull: false, unique: true},

        //encrypted password
        password: {type: DataTypes.STRING(512), allowNull: false, unique: false},

        //user name
        username: {type: DataTypes.STRING(128), allowNull: false, unique: true}
    });
};
