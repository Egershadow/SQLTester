
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Topic', {

            //primary key
            idTopic: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},

            //topic name
            topicName: {type: DataTypes.STRING(128), allowNull: false, unique: true}
        })
};
