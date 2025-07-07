

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


// const nodemailer = require('nodemailer');
// const ejs = require('ejs');
// const path = require('path');
// const logger = require('../logger'); // Ensure you have a logger configured
// require('dotenv').config(); // Load environment variables

// const sendEmail = async (to, subject, templateName, templateData, attachment) => {
//   try {
//     // Create Nodemailer transporter
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });

//     // Render the EJS template
//     const templatePath = path.join(__dirname, '../templates', templateName);
//     const html = await ejs.renderFile(templatePath, templateData);

//     // Debug: log attachment details
//     if (attachment) {
//       logger.info('Attachment details:', {
//         filename: attachment.originalname,
//         size: attachment.size,
//         contentType: attachment.mimetype
//       });
//     }

//     // Construct email options
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: to,
//       subject: subject,
//       html: html,
//       attachments: []
//     };

//     // Add attachment if provided
//     if (attachment) {
//       mailOptions.attachments.push({
//         filename: attachment.originalname,
//         content: attachment.buffer,
//         encoding: 'base64'
//       });
//     }

//     // Send email
//     const info = await transporter.sendMail(mailOptions);
//     logger.info(`Email sent: ${info.response}`);

//     return {
//       meta: {
//         statusCode: 200
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

// module.exports = sendEmail;

const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const logger = require('../logger'); // Ensure you have a logger configured
require('dotenv').config(); // Load environment variables

const sendEmail = async (to, subject, templateName, templateData, attachment) => {
  try {
    // Log initial request details
    logger.info('Preparing to send email', { to, subject, templateName });

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "asad94758@gmail.com",
        pass: "nysg fofo uppg drvz"
      }
    });

    // Ensure environment variables are set
    if (!"asad94758@gmail.com" || !"nysg fofo uppg drvz") {
      throw new Error('Missing email credentials in environment variables');
    }

    // Render the EJS template
    const templatePath = path.join(__dirname, '../templates', templateName);
    const html = await ejs.renderFile(templatePath, templateData);

    // Log template rendering details
    logger.info('Rendered email template', { templatePath });

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
      from: "asad94758@gmail.com",
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
    // Log detailed error for troubleshooting
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
