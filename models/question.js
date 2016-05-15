
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Question', {

            //primary key
            idQuestion: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},

            //full question text
            questionText: {type: DataTypes.STRING(128), allowNull: false, unique: true}
        })
};
