// const nodemailer = require('nodemailer');

// // Load environment variables from a .env file if you're using one
// require('dotenv').config();

// const sendEmail = async (to, subject, text) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER, // Use environment variables
//         pass: process.env.EMAIL_PASS  // Use environment variables
//       }
//     });

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: to,
//       subject: subject,
//       text: text
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent: ' + info.response);
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error;
//   }
// };

// module.exports = sendEmail;
const nodemailer = require('nodemailer');
const logger = require('../logger');

// Load environment variables from a .env file if you're using one
require('dotenv').config();

const sendEmail = async (to, subject, text) => {
  try {
    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Construct email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.response}`);

    return {
      meta: {
        statusCode: 200,
        
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
