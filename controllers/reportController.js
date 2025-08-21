const reportDao = require("../Dao/reportDao");
const path = require("path");
const pdfGenerator = require("../util/pdfGenerator");
const excelGenerator = require("../util/excelGenerator");

exports.getReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate, ...filters  } = req.query;
    if (!reportType || !startDate || !endDate)
      return res.status(400).json({ error: "Provide reportType, startDate, endDate" });

    const data = await reportDao.getReportData(reportType, startDate, endDate,filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate, format,filters  } = req.query;
    if (!reportType || !startDate || !endDate)
      return res.status(400).json({ error: "Provide reportType, startDate, endDate" });

    const data = await reportDao.getReportData(reportType, startDate, endDate,filters );

    const fileName = `report.${format === "excel" ? "xlsx" : "pdf"}`;
    const filePath = path.join(__dirname, "../reports", fileName);
    
    if (format === "excel") {
      excelGenerator(data, filePath);
      res.download(filePath);
    } else {
      pdfGenerator(data, filePath, () => {
        res.download(filePath);
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
