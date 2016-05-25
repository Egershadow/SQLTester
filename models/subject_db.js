module.exports = function(sequelize, DataTypes) {
    return sequelize.define('SubjectDB', {

        //primary key
        idSubjectDB: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},

        //path to image of subject db
        imagePath: {type: DataTypes.STRING(3072), allowNull: false, unique: true},

        //path to subject dbs like hotel, university, etc
        dbPath: {type: DataTypes.STRING(3072), allowNull: false, unique: true},

        //user of db
        username: {type: DataTypes.STRING(128), allowNull: false, unique: false},

        //user password
        password: {type: DataTypes.STRING(128), allowNull: false, unique: false},

        //db name
        dbName: {type: DataTypes.STRING(128), allowNull: false, unique: true},

        //initialization queries
        queries: {type: DataTypes.STRING(3072), allowNull: true, unique: false}

    });
};
