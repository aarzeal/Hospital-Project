const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {

  const SubmoduleFields = sequelize.define(
    "SubmoduleFields",   
    {
      field_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

        field_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      submodule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "userSubModules",
          key: "submodule_id",
        },
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
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
    },
    {

       tableName: "submodule_fields_table",
    timestamps: true,
    }
  );

  SubmoduleFields.associate = (models) => {

    SubmoduleFields.belongsTo(models.UserSubModules, {
      foreignKey: "submodule_id",
      as: "submodule",
    });
  };

  return SubmoduleFields;
};
