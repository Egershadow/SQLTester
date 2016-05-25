
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TestHasQuestion', {

        //primary key
        idTestHasQuestion: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},

        //weight of question in test
        weight: {type: DataTypes.REAL, allowNull: false, unique: false}

    })
};