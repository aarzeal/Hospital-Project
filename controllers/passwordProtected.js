const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { PDFDocument, rgb } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');

exports.generatePDF = async (req, res) => {
  try {
    const { password } = req.body;

    // Generate a unique filename
    const uniqueId = uuidv4();
    const tempFileName = `temp_document_${uniqueId}.pdf`;
    const protectedFileName = `protected_document_${uniqueId}.pdf`;

    const tempFilePath = path.resolve(__dirname, '../FileWithOutProtected', tempFileName);
    const protectedDir = path.resolve(__dirname, '../FileWithProtected');
    const protectedFilePath = path.join(protectedDir, protectedFileName);

    // Ensure directories exist
    if (!fs.existsSync(path.dirname(tempFilePath))) fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    if (!fs.existsSync(protectedDir)) fs.mkdirSync(protectedDir, { recursive: true });

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { height } = page.getSize();
    page.drawText('Hello, this is a generated PDF!', {
      x: 50,
      y: height - 100,
      size: 20,
      color: rgb(0, 0, 0),
    });

    // Save the generated PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(tempFilePath, pdfBytes);
    console.log('Generated PDF saved:', tempFilePath);

    // If password is not provided, return unprotected PDF
    if (!password) {
      return res.status(200).json({
        message: 'Document generated successfully (without password protection)',
        filePath: tempFilePath,
      });
    }

    // QPDF path
    const qpdfPath = "C:\\Program Files\\qpdf 11.9.1\\bin\\qpdf.exe"; 
    const command = `"${qpdfPath}" --encrypt "${password}" "${password}" 256 -- "${tempFilePath}" "${protectedFilePath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error applying password protection:', error);
        return res.status(500).json({ message: 'Error applying password protection', error: error.message });
      }

      if (fs.existsSync(protectedFilePath)) {
        console.log('Protected PDF saved:', protectedFilePath);
        res.status(200).json({
          message: 'Document generated and password protected successfully',
          filePath: protectedFilePath,
        });

        // Delete the temporary file after protection
        fs.unlinkSync(tempFilePath);
      } else {
        console.error('Failed to save protected PDF.');
        res.status(500).json({ message: 'Failed to save protected PDF' });
      }
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ message: 'Error processing the document', error: error.message });
  }
};


