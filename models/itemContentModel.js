const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const itemContent = sequelize.define(
        "itemContent",
        {
            ItemContentIDP: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            ItemContentName: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            NonActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            HospitalIDF: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: false,
            },
            HospitalGroupIDF: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            CreatedBy: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            UpdatedBy: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            UpdatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            CreatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "tblitemContent",
            timestamps: false,
        }
    );
    return itemContent;
};
