
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Role', {

            //primary key
            idRole: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},

            //role name
            roleName: {type: DataTypes.STRING(128), allowNull: false, unique: true}
        },
        {
            // don't add the timestamp attributes (updatedAt, createdAt)
            timestamps: false
        })
};
