
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UserHasRole', {},
        {
            // don't add the timestamp attributes (updatedAt, createdAt)
            timestamps: false
        })
};