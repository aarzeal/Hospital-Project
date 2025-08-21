module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Service3", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    taskName: DataTypes.STRING,        // pehle serviceName tha
    assignedTo: DataTypes.STRING,      // pehle status tha
    priority: DataTypes.STRING,        // naya field
    startTime: DataTypes.DATE,         // pehle startDate tha
    endTime: DataTypes.DATE,           // pehle endDate tha
    remarks: DataTypes.TEXT,           // naya field
  }, { timestamps: false });
};