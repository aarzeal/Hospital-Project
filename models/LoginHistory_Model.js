const { runAllChains } = require("express-validator/lib/utils");
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LoginHistory = sequelize.define(
    "LoginHistory",
    {
      loginHistory_Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      user_IDR:{
        type:DataTypes.INTEGER,
        allowNull:false,
      },

      loginTime:{
        type:DataTypes.timestamps,
        allowNull:false,
      },

      IP_Address:{
        type:DataTypes.STRING,
        allowNull:true,
      },

      computerName:{
        type:DataTypes.STRING,
        allowNull:true,
      },

      logoutTime:{
        type:DataTypes.timestamps,
        allowNull:false,
      },

      browserName:{
        type:DataTypes.STRING,
        allowNull:true
      }
    },
    {
      tableName: "tbl_loginHistory",
      timestamps: true,
    }
  );

  return LoginHistory;
};
