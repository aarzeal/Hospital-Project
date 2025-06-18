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

exports.updatLabFacultyByIdDAO = async (sequelize, id, updateData) => {
  const LabFaculty = require("../models/labFacultyModel")(sequelize);
  await LabFaculty.update(updateData, { where: { lab_faculty_id: id } });
  return await LabFaculty.findByPk(id);
};

exports.deleteLabFacultyByIdDAO = async (sequelize, id) => {
  const LabFaculty = require("../models/labFacultyModel")(sequelize);
  const product = await LabFaculty.findByPk(id);
  if (product) await product.destroy();
  return product;
};

exports.getLabFacultyDataAsPerQueryParamDAO = async (sequelize, options) => {
  const LabFaculty = require("../models/labFacultyModel")(sequelize);
  return await LabFaculty.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    raw: true,
  });
};
