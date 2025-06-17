exports.createLabFacultyDAO = async (sequelize, data) => {
  const LabFaculty = require("../models/labFacultyModel")(sequelize);
  await LabFaculty.sync({ force: false });
  return await LabFaculty.create(data);
};

exports.getAllLabFacultiesDAO = async (sequelize) => {
  const LabFaculty = require("../models/labFacultyModel")(sequelize);
  return await LabFaculty.findAll();
};

exports.getLabFacultyByIdDAO = async (sequelize, id) => {
  const LabFaculty = require("../models/labFacultyModel")(sequelize);
  return await LabFaculty.findByPk(id);
};
