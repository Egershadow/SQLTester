
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UserAnsweredQuestion', {

        //sql request
        answerRequest: {
            type: DataTypes.STRING(512),
            allowNull: false,
            unique: false
        },

        idUser : {type: DataTypes.INTEGER, primaryKey: true},

        idTestHasQuestion : {type: DataTypes.INTEGER, primaryKey: true},

        date: {primaryKey: true, type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.NOW}
    })
};