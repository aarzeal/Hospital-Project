exports.createLabFacultyDAO = async (sequelize, data) => {
  const LabFaculty = require("../models/labFacultyModel")(sequelize);
  await LabFaculty.sync({ force: false });
  return await LabFaculty.create(data);
};
