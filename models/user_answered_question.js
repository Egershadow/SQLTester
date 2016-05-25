
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UserPassedTest', {

        //primary key
        idUserPassedTest: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        //sql request
        answerRequest: {
            type: DataTypes.STRING(512),
            allowNull: false,
            unique: false},
        idUser: {
            type: DataTypes.INTEGER,
            unique: 'compositeIndex'
        },
        idTestHasQuestion: {
            type: DataTypes.INTEGER,
            unique: 'compositeIndex'
        }
    })
};