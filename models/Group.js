
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Group', {

            //primary key
            idGroup: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},

            //group name
            groupName: {type: DataTypes.STRING(128), allowNull: false, unique: true}
        })
};
