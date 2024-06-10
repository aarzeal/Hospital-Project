// const createDynamicConnection = require('../database/dynamicConnection');
// const createModuleModel = require('../models/HospitalModules');
// const logger = require('../logger');

// // Create a function to get the module model
// const getModuleModel = async () => {
//     const { sequelize, testConnection } = createDynamicConnection();
//     await testConnection();

//     const Module = createModuleModel(sequelize);
//     await sequelize.sync(); // Ensure the table is created

//     return Module;
// };

// // Create a new module
// exports.createModule = async (req, res) => {
//     const { module_name } = req.body;
//     try {
//         const Module = await getModuleModel();
//         const module = await Module.create({ module_name });
//         res.status(200).json({
//             meta: {
//                 status: 200,
//                 errorCode: null
//             },
//             data: module
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             meta: {
//                 status: 500,
//                 errorCode: 935
//             },
//             message: 'Error creating module',
//             error: error.message
//         });
//     }
// };

// // Get all modules
// exports.getModules = async (req, res) => {
//     try {
//         const Module = await getModuleModel();
//         const modules = await Module.findAll();
//         res.status(200).json(modules);
//     } catch (error) {
//         console.error('Error retrieving modules:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// // Get a module by ID
// exports.getModuleById = async (req, res) => {
//     const { id } = req.params;
//     try {
//         const Module = await getModuleModel();
//         const module = await Module.findByPk(id);
//         if (module) {
//             res.status(200).json(module);
//         } else {
//             res.status(404).json({ error: 'Module not found' });
//         }
//     } catch (error) {
//         console.error('Error retrieving module:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// // Update a module
// exports.updateModule = async (req, res) => {
//     const { id } = req.params;
//     const { module_name } = req.body;
//     try {
//         const Module = await getModuleModel();
//         const module = await Module.findByPk(id);
//         if (module) {
//             module.module_name = module_name;
//             await module.save();
//             res.status(200).json({
//                 meta: {
//                     status: 200,
//                     errorCode: null
//                 },
//                 data: module
//             });
//         } else {
//             res.status(404).json({ error: 'Module not found' });
//         }
//     } catch (error) {
//         console.error('Error updating module:', error);
//         res.status(500).json({
//             meta: {
//                 status: 500,
//                 errorCode: 927
//             },
//             message: 'Error updating module',
//             error: error.message
//         });
//     }
// };

// // Delete a module
// exports.deleteModule = async (req, res) => {
//     const { id } = req.params;
//     try {
//         const Module = await getModuleModel();
//         const module = await Module.findByPk(id);
//         if (module) {
//             await module.destroy();
//             res.status(200).json({
//                 meta: {
//                     status: 200,
//                     errorCode: null
//                 },
//                 message: 'Module deleted successfully'
//             });
//         } else {
//             res.status(404).json({ error: 'Module not found' });
//         }
//     } catch (error) {
//         console.error('Error deleting module:', error);
//         res.status(500).json({
//             meta: {
//                 status: 500,
//                 errorCode: 927
//             },
//             message: 'Error deleting module',
//             error: error.message
//         });
//     }
// };

const createDynamicConnection = require('../database/dynamicConnection');
const createModuleModel = require('../models/HospitalModules');
const logger = require('../logger');

// Create a function to get the module model
const getModuleModel = async () => {
    const { sequelize, testConnection } = createDynamicConnection();
    await testConnection();

    const Module = createModuleModel(sequelize);
    await sequelize.sync(); // Ensure the table is created

    return Module;
};

// Create a new module
exports.createModule = async (req, res) => {
    const { module_name } = req.body;
    try {
        const Module = await getModuleModel();
        const module = await Module.create({ module_name });
        logger.info('Module created successfully');
        res.status(200).json({
            meta: {
                status: 200,
                errorCode: null
            },
            data: module
        });
    } catch (error) {
        logger.error('Error creating module:', error);
        res.status(500).json({
            meta: {
                status: 500,
                errorCode: 927
            },
            error: {
                message: 'Error creating module',
                details: error.message
            }
        });
    }
};

// Get all modules
exports.getModules = async (req, res) => {
    try {
        const Module = await getModuleModel();
        const modules = await Module.findAll();
        logger.info('All modules retrieved successfully');
        res.status(200).json({
            meta: {
                status: 200,
                errorCode: null
            },
            data: modules
        });
    } catch (error) {
        logger.error('Error retrieving modules:', error);
        res.status(500).json({
            meta: {
                status: 500,
                errorCode: 928
            },
            error: {
                message: 'Internal Server Error',
                details: error.message
            }
        });
    }
};

// Get a module by ID
exports.getModuleById = async (req, res) => {
    const { id } = req.params;
    try {
        const Module = await getModuleModel();
        const module = await Module.findByPk(id);
        if (module) {
            logger.info('Module retrieved successfully');
            res.status(200).json({
                meta: {
                    status: 200,
                    errorCode: null
                },
                data: module
            });
        } else {
            logger.error('Module not found');
            res.status(404).json({
                meta: {
                    status: 404,
                    errorCode: 929
                },
                error: {
                    message: 'Module not found'
                }
            });
        }
    } catch (error) {
        logger.error('Error retrieving module:', error);
        res.status(500).json({
            meta: {
                status: 500,
                errorCode: 930
            },
            error: {
                message: 'Internal Server Error',
                details: error.message
            }
        });
    }
};

// Update a module
exports.updateModule = async (req, res) => {
    const { id } = req.params;
    const { module_name } = req.body;
    try {
        const Module = await getModuleModel();
        const module = await Module.findByPk(id);
        if (module) {
            module.module_name = module_name;
            await module.save();
            logger.info('Module updated successfully');
            res.status(200).json({
                meta: {
                    status: 200,
                    errorCode: null
                },
                data: module
            });
        } else {
            logger.error('Module not found');
            res.status(404).json({
                meta: {
                    status: 404,
                    errorCode: 931
                },
                error: {
                    message: 'Module not found'
                }
            });
        }
    } catch (error) {
        logger.error('Error updating module:', error);
        res.status(500).json({
            meta: {
                status: 500,
                errorCode: 932
            },
            error: {
                message: 'Error updating module',
                details: error.message
            }
        });
    }
};

// Delete a module
exports.deleteModule = async (req, res) => {
    const { id } = req.params;
    try {
        const Module = await getModuleModel();
        const module = await Module.findByPk(id);
        if (module) {
            await module.destroy();
            logger.info('Module deleted successfully');
            res.status(200).json({
                meta: {
                    status: 200,
                    errorCode: null
                },
                message: 'Module deleted successfully'
            });
        } else {
            logger.error('Module not found');
            res.status(404).json({
                meta: {
                    status: 404,
                    errorCode: 933
                },
                error: {
                    message: 'Module not found'
                }
            });
        }
    } catch (error) {
        logger.error('Error deleting module:', error);
        res.status(500).json({
            meta: {
                status: 500,
                errorCode: 934
            },
            error: {
                message: 'Error deleting module',
                details: error.message
            }
        });
    }
};
