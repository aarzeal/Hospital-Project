const PDFDocument = require("pdfkit");
const fs = require("fs");

function pdfGenerator(data, filePath, callback) {
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(18).text("Report", { align: "center" });
  doc.moveDown();

  data.forEach((item, i) => {
    const fields = Object.keys(item.dataValues || item);
    const row = fields.map(f => `${f}: ${item[f] ?? item.dataValues?.[f] ?? ""}`).join(" | ");
    doc.fontSize(12).text(`${i + 1}. ${row}`);
  });

  doc.end();
  stream.on("finish", callback);
}

module.exports = pdfGenerator;