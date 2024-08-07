// const nodemailer = require('nodemailer');
// const schedule = require('node-schedule');
// const path = require('path');
// const fs = require('fs');
// const sequelize = require('../database/connection');
// const Report = require('../models/AutoEmilsendmodel');

// // Configure the email transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail', // Replace with your email service
//   auth: {
//     user: 'sudhir.kale@aarzeal.com', // Replace with your email
//     pass: 'bujaybhcbhtbgyis', // Replace with your email password or an app-specific password
//   },
// });

// // Function to send an email with a PDF attachment
// const sendEmail = async () => {
//   const directoryPath = path.join(__dirname, 'programfile'); // Path to the directory

//   // List files in the directory
//   fs.readdir(directoryPath, (err, files) => {
//     if (err) {
//       console.error('Error reading the directory:', err);
//       return;
//     }

//     // Filter for PDF files
//     const pdfFiles = files.filter(file => file.endsWith('.pdf'));
//     if (pdfFiles.length === 0) {
//       console.log('No PDF files found, skipping email sending.');
//       return;
//     }

//     // Select the first available PDF file
//     const fileName = pdfFiles[0];
//     const filePath = path.join(directoryPath, fileName);

//     // Read the PDF file
//     fs.readFile(filePath, async (err, data) => {
//       if (err) {
//         console.error('Error reading the PDF file:', err);
//         return;
//       }

//       // Set up email data with Unicode symbols
//       const mailOptions = {
//         from: 'sudhir.kale@aarzeal.com', // Replace with your email
//         // to: 'test@mailinator.com', // Replace with the recipient's email
//         to: 'sudhirkale8188@gmail.com', // Replace with the recipient's email
//         subject: 'Scheduled Report PDF',
//         text: 'Please find the attached report PDF.',
//         attachments: [
//           {
//             filename: fileName,
//             content: data,
//             contentType: 'application/pdf',
//           },
//         ],
//       };

//       // Save initial report entry in the database
//       const report = await Report.create({
//         fileName,
//         email: mailOptions.to,
//         time: new Date(),
//       });

//       // Send the email
//       transporter.sendMail(mailOptions, async (error, info) => {
//         if (error) {
//           console.error('Error sending email:', error);
//         } else {
//           console.log('Email sent:', info.response);

//           // Update the send status in the database
//           await report.update({ sent: true });

//           // Delete the file after sending the email successfully
//           fs.unlink(filePath, (err) => {
//             if (err) {
//               console.error('Error deleting the PDF file:', err);
//             } else {
//               console.log('PDF file deleted successfully');
//             }
//           });
//         }
//       });
//     });
//   });
// };

// // Schedule the email to be sent every 60 minutes (*/60)
// const job = schedule.scheduleJob('*/1* * * *', () => {
//   console.log('Sending scheduled email...');
//   sendEmail();
// });

// module.exports = job;




const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const path = require('path');
const fs = require('fs');
const sequelize = require('../database/connection');
const Report = require('../models/AutoEmilsendmodel');
const emailConfig = require('../config/emailCofig.json'); // Load email configuration

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sudhir.kale@aarzeal.com',
    pass: 'bujaybhcbhtbgyis',
  },
});

// Function to send an email with a PDF attachment
const sendEmail = async () => {
  const directoryPath = path.join(__dirname, 'programfile'); // Path to the directory

  // List files in the directory
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading the directory:', err);
      return;
    }

    // Filter for PDF files
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    if (pdfFiles.length === 0) {
      console.log('No PDF files found, skipping email sending.');
      return;
    }

    // Select the first available PDF file
    const fileName = pdfFiles[0];
    const filePath = path.join(directoryPath, fileName);

    // Read the PDF file
    fs.readFile(filePath, async (err, data) => {
      if (err) {
        console.error('Error reading the PDF file:', err);
        return;
      }

      // Set up email data with Unicode symbols
      const mailOptions = {
        from: 'sudhir.kale@aarzeal.com',
        to: emailConfig.emails.join(','), // Use email addresses from configuration
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
    });
  });
};

// Schedule the email to be sent every 60 minutes (0 * * * *)
const job = schedule.scheduleJob('0 * * * *', () => {
  console.log('Sending scheduled email...');
  sendEmail();
});

module.exports = job;

