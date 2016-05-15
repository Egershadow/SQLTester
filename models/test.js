
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Test', {

            //primary key
            idTest: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},

            //group name
            testName: {type: DataTypes.STRING(128), allowNull: false, unique: true}
        })
};
