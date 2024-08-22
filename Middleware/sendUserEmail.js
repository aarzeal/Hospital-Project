
const nodemailer = require('nodemailer');
// const ejs = require('ejs');
const path = require('path');
const logger = require('../logger'); // Ensure you have a logger configured
require('dotenv').config(); // Load environment variables

const sendUserEmail = async (to, subject, text) => {
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
      text: text // Plain text email body
    };

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
        errorCode: 954, // Custom error code for email sending failure
        message: 'Error sending email',
        details: error.message // Include error details for debugging
      }
    };
  }
};

module.exports = sendUserEmail;
