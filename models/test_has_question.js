
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TestHasQuestion', {

        //primary key
        idTestHasQuestion: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},

        //sql request
        correctRequest: {type: DataTypes.STRING(512), allowNull: false, unique: false}
    })
};