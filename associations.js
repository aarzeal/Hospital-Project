const Module = require('./models/HospitalModules');
const Submodule = require('./models/hospitalsubmodule');
const UserRides = require('./models/hospitalUserRides');

Module.hasMany(Submodule, { foreignKey: 'module_id' });
Submodule.belongsTo(Module, { foreignKey: 'module_id' });

UserRides.belongsTo(Module, { foreignKey: 'module_id' });
UserRides.belongsTo(Submodule, { foreignKey: 'submodule_id' });

module.exports = { Module, Submodule, UserRides };
