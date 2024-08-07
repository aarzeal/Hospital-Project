const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const sequelize = require('../database/connection');
const Report = require('../models/AutoEmilsendmodel');
const emailConfig = require('../config/emailCofig.json');

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Replace with your email service
  auth: {
    user: 'sudhir.kale@aarzeal.com', // Replace with your email
    pass: 'bujaybhcbhtbgyis', // Replace with your email password or an app-specific password
  },
});

// Function to send an email with a PDF attachment
const sendEmail = async (filePath, fileName) => {
  const maxRetries = 5;
  const retryDelay = 1000; // 1 second

  const readFileWithRetry = async (retries) => {
    try {
      // Read the PDF file
      const data = fs.readFileSync(filePath);

      // Set up email data with Unicode symbols
      const mailOptions = {
        from: 'sudhir.kale@aarzeal.com', // Replace with your email
        to: emailConfig.emails.join(','), // Replace with the recipient's email
        // to: 'sudhirkale8188@gmail.com', // Replace with the recipient's email
        subject: 'Scheduled Report PDF',
        text: 'Please find the attached report PDF.',
        attachments: [
          {
            filename: fileName,
            content: data,
            contentType: 'application/pdf',
          },
        ],
      };

      // Save initial report entry in the database
      const report = await Report.create({
        fileName,
        email: mailOptions.to,
        time: new Date(),
      });

      // Send the email
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);

          // Update the send status in the database
          await report.update({ sent: true });

          // Delete the file after sending the email successfully
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting the PDF file:', err);
            } else {
              console.log('PDF file deleted successfully');
            }
          });
        }
      });
    } catch (err) {
      if (err.code === 'EBUSY' && retries > 0) {
        console.log(`File is busy, retrying in ${retryDelay}ms...`);
        setTimeout(() => readFileWithRetry(retries - 1), retryDelay);
      } else {
        console.error('Error reading the PDF file:', err);
      }
    }
  };

  readFileWithRetry(maxRetries);
};

// Watch for new files in the directory
const directoryPath = path.join(__dirname, 'programfile'); // Path to the directory

fs.watch(directoryPath, (eventType, fileName) => {
  if (eventType === 'rename' && fileName.endsWith('.pdf')) {
    const filePath = path.join(directoryPath, fileName);
    if (fs.existsSync(filePath)) {
      console.log('New PDF file detected:', fileName);
      sendEmail(filePath, fileName);
    }
  }
});

module.exports = { sendEmail };

