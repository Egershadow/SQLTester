
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Question', {

        //primary key
        idQuestion: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},

        //full question text
        questionText: {type: DataTypes.STRING(128), allowNull: false, unique: true},

        //sql request
        correctRequest: {type: DataTypes.STRING(512), allowNull: false, unique: false},

        //key words like EXISTS, LIKE, sub queries
        keyWords: {type: DataTypes.STRING(3072), allowNull: false, unique: false}
    })
};
