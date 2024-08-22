

// module.exports = sendEmail;
// const multer = require('multer');
// const nodemailer = require('nodemailer');
// const logger = require('../logger');
// const ejs = require('ejs');
// const path = require('path');
// // Load environment variables from a .env file if you're using one
// require('dotenv').config();

// const sendUserEmail = async (to, subject) => {
//   try {
//     // Create Nodemailer transporter
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });


//      // Render the EJS template
//     //  const templatePath = path.join(__dirname, '../templates', templateName);
//     //  const html = await ejs.renderFile(templatePath, templateData);


//        // Debug: log attachment details
//     // if (attachment) {
//     //   logger.info('Attachment details:', {
//     //     filename: attachment.originalname,
//     //     size: attachment.buffer.length,
//     //     contentType: attachment.mimetype // Make sure the content type is correct
//     //   });
//     // }

//     // Construct email options
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: to,
//       subject: subject,
//       // html: html,
//       attachments: []

//     //   attachments: attachment ? [{
//     //     filename: attachment.originalname, // Filename as it will appear in the email
//     //     content: attachment.buffer, // Buffer of the file
//     //     encoding: 'base64' // Ensure the file is correctly encoded
//     //   }] : []
//     };

//     // if (attachment) {
//     //   mailOptions.attachments.push({
//     //     filename: attachment.originalname,
//     //     content: attachment.buffer,
//     //     encoding: 'base64'
//     //   });
//     // }

//   //   if (file) {
//   //     mailOptions.attachments.push({
//   //         filename: file.originalname,
//   //         path: file.path
//   //     });
//   // }

//     // Send email
//     const info = await transporter.sendMail(mailOptions);
//     logger.info(`Email sent: ${info.response}`);

//     return {
//       meta: {
//         statusCode: 200,
        
//       },
//       data: {
//         message: 'Email sent successfully'
//       }
//     };
//   } catch (error) {
//     logger.error('Error sending email:', error);

//     throw {
//       meta: {
//         statusCode: 500,
//         errorCode: 954 // Custom error code for email sending failure
//       },
//       error: {
//         message: 'Error sending email',
//         details: error.message // Include error details for debugging
//       }
//     };
//   }
// };

// module.exports = sendUserEmail;


const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const logger = require('../logger'); // Ensure you have a logger configured
require('dotenv').config(); // Load environment variables

const sendEmail = async (to, subject, templateName, templateData, attachment) => {
  try {
    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Render the EJS template
    const templatePath = path.join(__dirname, '../templates', templateName);
    const html = await ejs.renderFile(templatePath, templateData);

    // Debug: log attachment details
    if (attachment) {
      logger.info('Attachment details:', {
        filename: attachment.originalname,
        size: attachment.size,
        contentType: attachment.mimetype
      });
    }

    // Construct email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html,
      attachments: []
    };

    // Add attachment if provided
    if (attachment) {
      mailOptions.attachments.push({
        filename: attachment.originalname,
        content: attachment.buffer,
        encoding: 'base64'
      });
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.response}`);

    return {
      meta: {
        statusCode: 200
      },
      data: {
        message: 'Email sent successfully'
      }
    };
  } catch (error) {
    logger.error('Error sending email:', error);

    throw {
      meta: {
        statusCode: 500,
        errorCode: 954 // Custom error code for email sending failure
      },
      error: {
        message: 'Error sending email',
        details: error.message // Include error details for debugging
      }
    };
  }
};

module.exports = sendEmail;

