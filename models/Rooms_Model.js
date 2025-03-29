
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rooms = sequelize.define( "Rooms",
     {
        room_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    room_Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roomType_IDR: {
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
    tableName: 'tbl_rooms',
    timestamps: false
  });

  return Rooms;
};

