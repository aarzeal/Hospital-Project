exports.createLabTestNotesDAO = async (sequelize, data) => {
  const LabTestNotes = require("../models/tblLabTestNotesModel")(sequelize);
  await LabTestNotes.sync({ force: false });
  return await LabTestNotes.create(data);
};

exports.getAllLabTestNotessDAO = async (sequelize) => {
  const LabTestNotes = require("../models/tblLabTestNotesModel")(sequelize);
  return await LabTestNotes.findAll();
};

exports.getLabTestNotesByIdDAO = async (sequelize, id) => {
  const LabTestNotes = require("../models/tblLabTestNotesModel")(sequelize);
  return await LabTestNotes.findByPk(id);
};

exports.updatLabTestNotesByIdDAO = async (sequelize, id, updateData) => {
  const LabTestNotes = require("../models/tblLabTestNotesModel")(sequelize);
  await LabTestNotes.update(updateData, { where: { lab_test_notes_id: id } });
  return await LabTestNotes.findByPk(id);
};

exports.deleteLabTestNotesByIdDAO = async (sequelize, id) => {
  const LabTestNotes = require("../models/tblLabTestNotesModel")(sequelize);
  const product = await LabTestNotes.findByPk(id);
  if (product) await product.destroy();
  return product;
};

exports.getLabTestNotesDataAsPerQueryParamDAO = async (sequelize, options) => {
  const LabTestNotes = require("../models/tblLabTestNotesModel")(sequelize);
  return await LabTestNotes.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    raw: true,
  });
};
