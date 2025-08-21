module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Service1",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      serviceName: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      status: DataTypes.STRING,
    },
    { timestamps: false, freezeTableName: true }
  );
};
