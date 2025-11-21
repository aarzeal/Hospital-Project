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
         

        }, {
        tableName: "permissions",
         timestamps: false,       // <-- Enable createdAt / updatedAt
    });

    return Permission;
};


