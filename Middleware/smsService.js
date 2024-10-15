// const axios = require('axios');
// const logger = require('../logger'); // Adjust the path to your logger
// const { error } = require('winston');

// /**
//  * Send a WhatsApp message using BhashSMS API
//  * @param {string} phone - The recipient's phone number.
//  * @param {string} message - The message template or text to send.
//  * @returns {Object} - Response object with statusCode and data.
//  */
// const sendSMS = async (phone, message) => {
//   // Define the BhashSMS API endpoint and parameters
//   const url = 'https://www.bhashsms.com/api/sendmsg.php'; 
//   const params = {
//     user: 'AarzealTechnologiesWAP', // Your BhashSMS username
//     pass: '123456', // Your BhashSMS password (replace with the actual password)
//     sender: 'BUZWAP', // Sender ID for WhatsApp
//     phone: phone, // Recipient's phone number
//     text: "arzeal_regs", // WhatsApp message or template
//     priority: 'wa', // Set to 'wa' for WhatsApp messages
//     stype: 'normal' // Set message type, adjust if using specific templates
//   };

//   try {
//     // Send the request to BhashSMS API
//     const response = await axios.get(url, { params });

//     // Check if the response indicates that the WhatsApp API is not activated
//     if (response.data.includes('API Not Activated')) {
//       logger.error('WhatsApp API not activated. Please contact BhashSMS support.',error);
//       return { statusCode: 500, data: 'WhatsApp API not activated.' };
//     }

//     // Log success response
//     logger.info('WhatsApp message sent successfully', { data: response.data });
//     return { statusCode: 200, data: response.data };

//   } catch (error) {
//     // Log detailed error information
//     logger.error('Error sending WhatsApp message', {
//       message: error.message,
//       stack: error.stack,
//     });

//     // Throwing custom error with statusCode and errorCode
//     throw { statusCode: 500, errorCode: 1073, data: { message: 'Failed to send WhatsApp message' } };
//   }
// };

// module.exports = { sendSMS };


// smsService.js
const axios = require('axios');
const logger = require('../logger'); 
const requestIp = require('request-ip');

async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 1083 });

      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

const sendSMS = async (phone,PatientFirstName,EMRNumber) => {
  const clientIp = await getClientIp(req);
  const start = Date.now();
  if (!phone & !EMRNumber & !PatientFirstName) {
    throw new Error('Phone number is required');
  }

  try {
    const apiUrl = 'http://bhashsms.com/api/sendmsg.php';
    
    const params = {
      user: 'AarzealTechnologiesWAP',
      pass: '123456',  // Avoid hardcoding sensitive information. Use environment variables.
      sender: 'BUZWAP',
      phone,
      text: 'arzeal_regs',
      // text: `Dear ${PatientFirstName}, Your registration was successful. Your EMR Number is ${EMRNumber}.`, // Construct the message
      priority: 'wa',
      stype: 'normal',
      // Params: '1,3',

        // Params: `${PatientFirstName},${EMRNumber}`,
        Params: `${EMRNumber},${PatientFirstName}`,

      htype: 'document',
      fname: 'PDFFile',
      url: 'https://smartping.live/trai/trai.pdf'
    };

    const response = await axios.get(apiUrl, { params });
    // logger.info(`SMS sent successfully to ${phone}. Response: ${response.data}`);
    
    console.log('Response:', response.data);

    return response.data; // Return the response for further processing
  } catch (error) {
    // logger.error(`Error sending SMS to ${phone}. Error: ${error.message}`);
    const end = Date.now();
          const executionTime = `${end - start}ms`;
          const errorCode = 1084;
      
          // Log the warning
    
          logger.logWithMeta("warn", `Error sending SMS to ${phone}. Error:${err.message}`, {
            errorCode,
            errorMessage: err.message,
            executionTime,
            hospitalId: req.hospitalId,
      
            ip: clientIp,
            apiName: req.originalUrl, // API name
            method: req.method    ,
            userAgent: req.headers['user-agent'],  
            data: { message: err.data?.message }   // HTTP method
          });
    console.error('Error sending message:', error);
    throw error; // Rethrow error for handling in the calling function
  }
};

module.exports = { sendSMS }; // Ensure you export the function



































// module.exports = { sendSMS };



// const axios = require('axios');
// const logger = require('../logger'); // Adjust the path to your logger

// const sendSMS = async (phone, message) => {
//   const url = 'https://www.bhashsms.com/api/sendmsg.php'; // BhashSMS API endpoint
//   const params = {
//     user: 'AarzealTechnologiesWAP', // Your BhashSMS username
//     pass: '123456', // Your BhashSMS password
//     sender: 'BHASH', // Your BhashSMS sender ID
//     phone: phone,
//     text: message,
//     priority: 'dnd', // Can be 'ndnd' or 'dnd'
//     stype: 'normal' // Can be 'normal' or 'flash'
//   };

//   try {
//     const response = await axios.get(url, { params });
//     logger.info('SMS sent successfully', { data: response.data });
//     return { statusCode: 200, data: response.data };
//   } catch (error) {
//     logger.error('Error sending SMS', { message: error.message, stack: error.stack });
//     throw { statusCode: 500, errorCode: 1073, data: { message: 'Failed to send SMS' } };
//   }
// };

// module.exports = { sendSMS };

