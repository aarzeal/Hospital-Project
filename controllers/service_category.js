const { ensureSequelizeInstance } = require('../Middleware/ensureSequelizeInstance'); // Dynamic DB Middleware
const logger = require('../logger'); // Ensure you have a logger setup

// exports.createServiceCategory = async (req, res) => {
//   const sequelize = ensureSequelizeInstance(req);

//   // Import models with the correct Sequelize instance
//   const ServiceCategory = require('../models/servicecategory')(sequelize);
//   const HospitalGroup = require('../models/HospitalGroup')(sequelize);

//   try {
//     const { service_category_name, hospital_group_IDR } = req.body;

//     // Validate required fields
//     if (!service_category_name) {
//       return res.status(400).json({ error: 'Service category name is required' });
//     }

//     // Check if hospital_group_IDR exists
//     if (hospital_group_IDR) {
//       const hospitalGroupExists = await HospitalGroup.findByPk(hospital_group_IDR);
//       if (!hospitalGroupExists) {
//         return res.status(404).json({ error: 'Hospital group not found' });
//       }
//     }

//     // Create service category
//     const newCategory = await ServiceCategory.create({ service_category_name, hospital_group_IDR });

//     logger.info(`Service category created successfully: ${newCategory.service_category_id}`);
//     return res.status(201).json({ message: 'Service category created successfully', data: newCategory });

//   } catch (error) {
//     logger.error(`Error creating service category: ${error.message}`);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

exports.createServiceCategory = async (req, res) => {
  try {
    const sequelize = ensureSequelizeInstance(req);
    // const sequelize = req.sequelize; // ✅ Use dynamic Sequelize instance
    if (!sequelize) {
      return res.status(500).json({ error: "Database connection not established" });
    }

    const ServiceCategory = require('../models/servicecategory')(sequelize); // ✅ Pass sequelize

    const { service_category_name, hospital_group_IDR } = req.body;

    // Validate required fields
    if (!service_category_name) {
      return res.status(400).json({ error: 'Service category name is required' });
    }

    // Create service category
    const newCategory = await ServiceCategory.create({ service_category_name, hospital_group_IDR });

    return res.status(201).json({ message: 'Service category created successfully', data: newCategory });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
