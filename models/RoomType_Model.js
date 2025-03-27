
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RoomType = sequelize.define( "RoomType",
     {
        roomType_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roomType_Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roomType_Code: {
      type: DataTypes.STRING,
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
  }, {
    tableName: 'tbl_roomtype',
    timestamps: false
  });

  return RoomType;
};

