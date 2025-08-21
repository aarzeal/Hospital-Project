
const XLSX = require("xlsx");

function excelGenerator(data, filePath) {
  const rows = data.map(item => item.dataValues || item);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, filePath);
}

module.exports = excelGenerator;
