
// const { Op } = require("sequelize");
// const ServiceSOR = require("../models/ServiceSOR");

// const modelMap = {
//   ServiceSOR,
// //   Service1,
//   // aur models add kar sakte ho
// };

// const columnsMap = {
// //   Service1: { start: "startDate", end: "endDate", search: ["serviceName", "status"] },
// //   Service2: { start: "startDate", end: "endDate", search: ["serviceName", "status"] },
// //   Service3: { start: "startTime", end: "endTime", search: ["taskName", "assignedTo"] },
//   ServiceSOR:{start: "fromDate", end: "toDate",search: ["versionNumber", "createdBy","serviceRate","firstEmergancyRate","secondEmergancyRate", "hospital_IDR","serviceSOR_ID"] // jo fields search karna chahte ho
// }
// };

// exports.getReportData = async (reportType, startDate, endDate, searchTerm) => {
// //   const { Op } = db;
//   const Model = modelMap[reportType];
//   if (!Model) throw new Error("Invalid reportType");

//   const columnMapping = columnsMap[reportType];
//   if (!columnMapping) throw new Error(`Column mapping not defined for ${reportType}`);

//   const { start, end, search } = columnMapping;

//   // Basic date filter
//   const whereClause = {
//     [start]: { [Op.gte]: new Date(startDate) },
//     [end]: { [Op.lte]: new Date(endDate) },
//   };

//   // Apply searchTerm if provided
//   if (searchTerm && search && search.length > 0) {
//     whereClause[Op.or] = search.map((field) => ({
//       [field]: { [Op.like]: `%${searchTerm}%` },
//     }));
//   }

//   const data = await Model.findAll({
//     where: whereClause,
//     order: [[start, "ASC"]],
//   });

//   // Convert to plain JSON to avoid Sequelize metadata in PDF/Excel
//   return data.map((item) => item.get({ plain: true }));
// };

const { Op } = require("sequelize");
const ServiceSOR = require("../models/ServiceSOR");

const modelMap = {
  ServiceSOR,
  // aur models yahan add kar sakte ho
};

const columnsMap = {
  ServiceSOR: { start: "fromDate", end: "toDate" }
};

exports.getReportData = async (reportType, startDate, endDate, filters = {}) => {
  const Model = modelMap[reportType];
  if (!Model) throw new Error("Invalid reportType");

  const columnMapping = columnsMap[reportType];
  if (!columnMapping) throw new Error(`Column mapping not defined for ${reportType}`);

  const { start, end } = columnMapping;

  // Base date filter
  const whereClause = {
    [start]: { [Op.gte]: new Date(startDate) },
    [end]: { [Op.lte]: new Date(endDate) }
  };

  // Apply dynamic filters (exact match)
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== undefined) {
      // Numeric fields ko number me convert kar sakte ho
      const value = isNaN(filters[key]) ? filters[key] : Number(filters[key]);
      whereClause[key] = value;
    }
  });

  const data = await Model.findAll({
    where: whereClause,
    order: [[start, "ASC"]]
  });

  return data.map((item) => item.get({ plain: true }));
};
