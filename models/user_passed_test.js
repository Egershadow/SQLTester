module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UserPassedTest', {

        //sql request
        testResult: {type: DataTypes.INTEGER, allowNull: false, unique: false},

        idUser : {type: DataTypes.INTEGER, primaryKey: true},

        idTest : {type: DataTypes.INTEGER, primaryKey: true},

        date: {primaryKey: true, type: DataTypes.DATE, allowNull: false, unique: false, defaultValue: sequelize.NOW}
    })
};