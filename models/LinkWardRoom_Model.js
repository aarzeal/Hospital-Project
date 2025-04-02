const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const WardRoomLink = sequelize.define("WardRoomLink",
    {
      wardRoomLink_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ward_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      room_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      hospital_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      hospitalGroup_IDR: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      UpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "tbl_linkwardroom",
      timestamps: false,
    }
  );

  return WardRoomLink;
};
