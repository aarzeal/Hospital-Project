const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const path = require('path');
const fs = require('fs');
const sequelize = require('../database/connection');
const Report = require('../models/AutoEmilsendmodel');
const emailConfig = require('../config/emailCofig.json'); // Load email configuration
const logger = require('../logger'); // Adjust the path as needed
const mime = require('mime-types');

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sudhir.kale@aarzeal.com',
    pass: 'bujaybhcbhtbgyis',
  },
});

// Function to send an email with an attachment
const sendEmail = async () => {
  const directoryPath = path.join(__dirname, 'programfile'); // Path to the directory

  return new Promise((resolve, reject) => {
    // List files in the directory
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        logger.error('Error reading the directory', { message: err.message, stack: err.stack });
        reject({ statusCode: 500, errorCode: 1064, data: { message: 'Error reading the directory' } });
        return;
      }

      logger.info('Files in directory:', files);

      // Filter for files with specific extensions
      const filteredFiles = files.filter(file => ['.pdf', '.xlsx', '.jpg'].includes(path.extname(file)));
      if (filteredFiles.length === 0) {
        logger.info('No files found, skipping email sending.');
        resolve({ statusCode: 200, data: { message: 'No files found, skipping email sending' } });
        return;
      }

      // Select the first available file
      const fileName = filteredFiles[0];
      const filePath = path.join(directoryPath, fileName);

      logger.info('Selected file for sending:', fileName);

      // Read the file
      fs.readFile(filePath, async (err, data) => {
        if (err) {
          logger.error('Error reading the file', { message: err.message, stack: err.stack });
          reject({ statusCode: 500, errorCode: 1065, data: { message: 'Error reading the file' } });
          return;
        }

        // Determine the content type based on the file extension
        const contentType = mime.lookup(fileName) || 'application/octet-stream';
        logger.info('Determined content type:', contentType);

        // Set up email data with Unicode symbols
        const mailOptions = {
          from: 'sudhir.kale@aarzeal.com',
          to: emailConfig.emails.join(','),
          subject: 'Scheduled Report',
          text: 'Please find the attached report.',
          attachments: [
            {
              filename: fileName,
              content: data,
              contentType: contentType,
            },
          ],
        };

        try {
          // Save initial report entry in the database
          const report = await Report.create({
            fileName,
            email: mailOptions.to,
            time: new Date(),
          });

          // Send the email
          transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
              logger.error('Error sending email', { message: error.message, stack: error.stack });
              reject({ statusCode: 500, errorCode: 1066, data: { message: 'Error sending email' } });
              return;
            } else {
              logger.info('Email sent successfully', { response: info.response });

              // Update the send status in the database
              await report.update({ sent: true });

              // Delete the file after sending the email successfully
              fs.unlink(filePath, (err) => {
                if (err) {
                  logger.error('Error deleting the file', { message: err.message, stack: err.stack });
                  reject({ statusCode: 500, errorCode: 1067, data: { message: 'Error deleting the file' } });
                } else {
                  logger.info('File deleted successfully');
                  resolve({ statusCode: 200, data: { message: 'Email sent and file deleted successfully' } });
                }
              });
            }
          });
        } catch (error) {
          logger.error('Error in processing email sending', { message: error.message, stack: error.stack });
          reject({ statusCode: 500, errorCode: 1068, data: { message: 'Error in processing email sending' } });
        }
      });
    });
  });
};

// Schedule the email to be sent every 60 minutes
const job = schedule.scheduleJob('*/20 * * * *', () => {
  logger.info('Scheduled email job started');
  sendEmail()
    .then(response => {
      logger.info(response.data.message);
    })
    .catch(err => {
      logger.error('Error occurred', {
        statusCode: err.statusCode || 500,
        errorCode: err.errorCode || 1069,
        data: { message: err.data?.message || 'An unexpected error occurred' }
      });
    });
});

module.exports = job;



// const nodemailer = require('nodemailer');
// const schedule = require('node-schedule');
// const path = require('path');
// const fs = require('fs');
// const sequelize = require('../database/connection');
// const Report = require('../models/AutoEmilsendmodel');
// const emailConfig = require('../config/emailCofig.json'); // Load email configuration

// // Configure the email transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'sudhir.kale@aarzeal.com',
//     pass: 'bujaybhcbhtbgyis',
//   },
// });

// // Function to send an email with a PDF attachment
// const sendEmail = async () => {
//   const directoryPath = path.join(__dirname, 'programfile'); // Path to the directory

//   return new Promise((resolve, reject) => {
//     // List files in the directory
//     fs.readdir(directoryPath, (err, files) => {
//       if (err) {
//         console.error('Error reading the directory:', err);
//         reject({ statusCode: 500, errorCode: 1064, data: { message: 'Error reading the directory' } });
//         return;
//       }

//       // Filter for PDF files
//       const pdfFiles = files.filter(file => file.endsWith('.pdf'));
//       if (pdfFiles.length === 0) {
//         console.log('No PDF files found, skipping email sending.');
//         resolve({ statusCode: 200, data: { message: 'No PDF files found, skipping email sending' } });
//         return;
//       }

//       // Select the first available PDF file
//       const fileName = pdfFiles[0];
//       const filePath = path.join(directoryPath, fileName);

//       // Read the PDF file
//       fs.readFile(filePath, async (err, data) => {
//         if (err) {
//           console.error('Error reading the PDF file:', err);
//           reject({ statusCode: 500, errorCode: 1065, data: { message: 'Error reading the PDF file' } });
//           return;
//         }

//         // Set up email data with Unicode symbols
//         const mailOptions = {
//           from: 'sudhir.kale@aarzeal.com',
//           to: emailConfig.emails.join(','), // Use email addresses from configuration
//           subject: 'Scheduled Report PDF',
//           text: 'Please find the attached report PDF.',
//           attachments: [
//             {
//               filename: fileName,
//               content: data,
//               contentType: 'application/pdf',
//             },
//           ],
//         };

//         try {
//           // Save initial report entry in the database
//           const report = await Report.create({
//             fileName,
//             email: mailOptions.to,
//             time: new Date(),
//           });

//           // Send the email
//           transporter.sendMail(mailOptions, async (error, info) => {
//             if (error) {
//               console.error('Error sending email:', error);
//               reject({ statusCode: 500, errorCode: 1066, data: { message: 'Error sending email' } });
//               return;
//             } else {
//               console.log('Email sent:', info.response);

//               // Update the send status in the database
//               await report.update({ sent: true });

//               // Delete the file after sending the email successfully
//               fs.unlink(filePath, (err) => {
//                 if (err) {
//                   console.error('Error deleting the PDF file:', err);
//                   reject({ statusCode: 500, errorCode: 1067, data: { message: 'Error deleting the PDF file' } });
//                 } else {
//                   console.log('PDF file deleted successfully');
//                   resolve({ statusCode: 200, data: { message: 'Email sent and PDF file deleted successfully' } });
//                 }
//               });
//             }
//           });
//         } catch (error) {
//           console.error('Error in processing email sending:', error);
//           reject({ statusCode: 500, errorCode: 1068, data: { message: 'Error in processing email sending' } });
//         }
//       });
//     });
//   });
// };

// // Schedule the email to be sent every 60 minutes (0 * * * *)
// const job = schedule.scheduleJob('/1 * * * *', () => {
//   console.log('Sending scheduled email...');
//   sendEmail().then(response => {
//     console.log(response);
//   }).catch(err => {
//     console.error(err);
//   });
// });

// module.exports = job;
