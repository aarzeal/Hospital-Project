// const { Op } = require('sequelize');
// const Submodule = require('../models/hospitalsubmodule');
// const Module = require('../models/HospitalModules'); // Adjust the path as per your file structure


// // Controller functions

// // GET all submodules
// const getAllSubmodules = async (req, res) => {
//   try {
//     const submodules = await Submodule.findAll();
//     res.json({
//       meta: {
//         status: 'success',
//         message: 'Retrieved all submodules successfully',
//         count: submodules.length
//       },
//       data: submodules
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: {
//         status: 'error',
//         message: 'Failed to retrieve submodules',
//         error: error.message
//       }
//     });
//   }
// };

// // POST a new submodule
// const createSubmodule = async (req, res) => {
//   try {
//     const submodule = await Submodule.create(req.body);
//     res.status(201).json({
//       meta: {
//         status: 'success',
//         message: 'Submodule created successfully'
//       },
//       data: submodule
//     });
//   } catch (error) {
//     res.status(400).json({
//       meta: {
//         status: 'error',
//         message: 'Failed to create submodule',
//         error: error.message
//       }
//     });
//   }
// };

// // GET a submodule by ID
// const getSubmoduleById = async (req, res) => {
//   try {
//     const submodule = await Submodule.findByPk(req.params.id);
//     if (!submodule) {
//       return res.status(404).json({
//         meta: {
//           status: 'error',
//           message: 'Submodule not found'
//         }
//       });
//     }
//     res.json({
//       meta: {
//         status: 'success',
//         message: 'Retrieved submodule successfully'
//       },
//       data: submodule
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: {
//         status: 'error',
//         message: 'Failed to retrieve submodule',
//         error: error.message
//       }
//     });
//   }
// };

// // Update a submodule
// const updateSubmodule = async (req, res) => {
//   try {
//     const [updated] = await Submodule.update(req.body, {
//       where: { submodule_id: req.params.id }
//     });
//     if (!updated) {
//       return res.status(404).json({
//         meta: {
//           status: 'error',
//           message: 'Submodule not found'
//         }
//       });
//     }
//     const submodule = await Submodule.findByPk(req.params.id);
//     res.json({
//       meta: {
//         status: 'success',
//         message: 'Submodule updated successfully'
//       },
//       data: submodule
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: {
//         status: 'error',
//         message: 'Failed to update submodule',
//         error: error.message
//       }
//     });
//   }
// };

// // Delete a submodule
// const deleteSubmodule = async (req, res) => {
//   try {
//     const deleted = await Submodule.destroy({
//       where: { submodule_id: req.params.id }
//     });
//     if (!deleted) {
//       return res.status(404).json({
//         meta: {
//           status: 'error',
//           message: 'Submodule not found'
//         }
//       });
//     }
//     res.json({
//       meta: {
//         status: 'success',
//         message: 'Submodule deleted successfully'
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: {
//         status: 'error',
//         message: 'Failed to delete submodule',
//         error: error.message
//       }
//     });
//   }
// };

// // GET submodules by module_id
// const getSubmodulesByModuleId = async (req, res) => {
//   try {
//     const submodules = await Submodule.findAll({
//       where: {
//         module_id: req.params.module_id
//       }
//     });
//     res.json({
//       meta: {
//         status: 'success',
//         message: `Retrieved submodules for module_id ${req.params.module_id} successfully`,
//         count: submodules.length
//       },
//       data: submodules
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: {
//         status: 'error',
//         message: 'Failed to retrieve submodules by module_id',
//         error: error.message
//       }
//     });
//   }
// };

// // const getSubmodulesByModuleId = async (req, res) => {
// //     try {
// //       const submodules = await Submodule.findAll({
// //         where: {
// //           module_id: req.params.module_id
// //         },
// //         include: [Module] // Include the Module model to retrieve module details
// //       });
  
// //       const submoduleNames = submodules.map(submodule => submodule.submodule_name);
  
// //       res.json({
// //         meta: {
// //           status: 'success',
// //           message: `Retrieved submodules for module_id ${req.params.module_id} successfully`,
// //           count: submodules.length
// //         },
// //         data: {
// //           module_name: submodules.length > 0 ? submodules[0].Module.module_name : null,
// //           submodule_names: submoduleNames
// //         }
// //       });
// //     } catch (error) {
// //       res.status(500).json({
// //         meta: {
// //           status: 'error',
// //           message: 'Failed to retrieve submodules by module_id',
// //           error: error.message
// //         }
// //       });
// //     }
// // }


// module.exports = {
//   getAllSubmodules,
//   createSubmodule,
//   getSubmoduleById,
//   updateSubmodule,
//   deleteSubmodule,
//   getSubmodulesByModuleId
// };
const { Op } = require('sequelize');
const Submodule = require('../models/hospitalsubmodule');
const Module = require('../models/HospitalModules');
const logger = require('../logger');

// GET all submodules
const getAllSubmodules = async (req, res) => {
    try {
        const submodules = await Submodule.findAll();
        logger.info('Retrieved all submodules successfully');
        res.json({
            meta: {
                status: 'success',
                message: 'Retrieved all submodules successfully'
            },
            data: submodules
        });
    } catch (error) {
        logger.error('Failed to retrieve submodules:', error);
        res.status(500).json({
            meta: {
                status: 'error',
                errorCode: 935,
                message: 'Failed to retrieve submodules',
                error: error.message
            }
        });
    }
};

// POST a new submodule
const createSubmodule = async (req, res) => {
    try {
        const submodule = await Submodule.create(req.body);
        logger.info('Submodule created successfully');
        res.status(201).json({
            meta: {
                status: 'success',
                message: 'Submodule created successfully'
            },
            data: submodule
        });
    } catch (error) {
        logger.error('Failed to create submodule:', error);
        res.status(400).json({
            meta: {
                status: 'error',
                errorCode: 936,
                message: 'Failed to create submodule',
                error: error.message
            }
        });
    }
};

// GET a submodule by ID
const getSubmoduleById = async (req, res) => {
    try {
        const submodule = await Submodule.findByPk(req.params.id);
        if (!submodule) {
            logger.error('Submodule not found');
            return res.status(404).json({
                meta: {
                    status: 'error',
                    errorCode: 937,
                    message: 'Submodule not found'
                }
            });
        }
        logger.info('Retrieved submodule successfully');
        res.json({
            meta: {
                status: 'success',
                message: 'Retrieved submodule successfully'
            },
            data: submodule
        });
    } catch (error) {
        logger.error('Failed to retrieve submodule:', error);
        res.status(500).json({
            meta: {
                status: 'error',
                errorCode: 938,
                message: 'Failed to retrieve submodule',
                error: error.message
            }
        });
    }
};

// Update a submodule
const updateSubmodule = async (req, res) => {
    try {
        const [updated] = await Submodule.update(req.body, {
            where: { submodule_id: req.params.id }
        });
        if (!updated) {
            logger.error('Submodule not found');
            return res.status(404).json({
                meta: {
                    status: 'error',
                    errorCode: 939,
                    message: 'Submodule not found'
                }
            });
        }
        const submodule = await Submodule.findByPk(req.params.id);
        logger.info('Submodule updated successfully');
        res.json({
            meta: {
                status: 'success',
                message: 'Submodule updated successfully'
            },
            data: submodule
        });
    } catch (error) {
        logger.error('Failed to update submodule:', error);
        res.status(500).json({
            meta: {
                status: 'error',
                errorCode: 940,
                message: 'Failed to update submodule',
                error: error.message
            }
        });
    }
};

// Delete a submodule
const deleteSubmodule = async (req, res) => {
    try {
        const deleted = await Submodule.destroy({
            where: { submodule_id: req.params.id }
        });
        if (!deleted) {
            logger.error('Submodule not found');
            return res.status(404).json({
                meta: {
                    status: 'error',
                    errorCode: 941,
                    message: 'Submodule not found'
                }
            });
        }
        logger.info('Submodule deleted successfully');
        res.json({
            meta: {
                status: 'success',
                message: 'Submodule deleted successfully'
            }
        });
    } catch (error) {
        logger.error('Failed to delete submodule:', error);
        res.status(500).json({
            meta: {
                status: 'error',
                errorCode: 942,
                message: 'Failed to delete submodule',
                error: error.message
            }
        });
    }
};

// GET submodules by module_id
const getSubmodulesByModuleId = async (req, res) => {
    try {
        const submodules = await Submodule.findAll({
            where: {
                module_id: req.params.module_id
            }
        });
        logger.info(`Retrieved submodules for module_id ${req.params.module_id} successfully`);
        res.json({
            meta: {
                status: 'success',
                message: `Retrieved submodules for module_id ${req.params.module_id} successfully`
            },
            data: submodules
        });
    } catch (error) {
        logger.error('Failed to retrieve submodules by module_id:', error);
        res.status(500).json({
            meta: {
                status: 'error',
                errorCode: 943,
                message: 'Failed to retrieve submodules by module_id',
                error: error.message
            }
        });
    }
};

module.exports = {
    getAllSubmodules,
    createSubmodule,
    getSubmoduleById,
    updateSubmodule,
    deleteSubmodule,
    getSubmodulesByModuleId
};

