const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define("fin_group", {
      fin_group_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fin_group_name: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      
      group_category: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      
      types_of_group: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_primary_group: {
        type: DataTypes.BOOLEAN
        ,
        allowNull: false,
      },
      under_group_IDR: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      master_group_IDR: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      group_level: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      is_system_group: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      for_jv_settelment: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      remark: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      hospitalIDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      hospitalGroupIDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: true,
     
      },
      updatedBy: {
        type: DataTypes.STRING,
        allowNull: true,
     
      },
      updatedAt: {  // ✅ Override Sequelize default behavior
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {  // ✅ Manually set createdAt as a timestamp
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      
      
      
    }, {
      tableName: "tbl_fin_group",
      timestamps: false,
    });
  };