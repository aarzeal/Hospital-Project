const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
    const Permission = sequelize.define(
        "Permission",
        {
            permission_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },

            permission_name: {
                type: DataTypes.STRING(50),
                allowNull: false
            },

            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            hospital_IDR: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            hospital_group_IDR: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

            created_by: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            updated_by: {
                type: DataTypes.STRING,
                allowNull: true,
            },

        }, {
        tableName: "permissions",
        timestamps: true,       // <-- Enable createdAt / updatedAt
    });

    return Permission;
};


