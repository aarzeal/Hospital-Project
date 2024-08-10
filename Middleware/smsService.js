// const axios = require('axios');

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
//     console.log('SMS sent successfully:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Error sending SMS:', error.message);
//     throw new Error('Failed to send SMS');
//   }
// };

// module.exports = { sendSMS };


const axios = require('axios');
const logger = require('../logger'); // Adjust the path to your logger

const sendSMS = async (phone, message) => {
  const url = 'https://www.bhashsms.com/api/sendmsg.php'; // BhashSMS API endpoint
  const params = {
    user: 'AarzealTechnologiesWAP', // Your BhashSMS username
    pass: '123456', // Your BhashSMS password
    sender: 'BHASH', // Your BhashSMS sender ID
    phone: phone,
    text: message,
    priority: 'dnd', // Can be 'ndnd' or 'dnd'
    stype: 'normal' // Can be 'normal' or 'flash'
  };

  try {
    const response = await axios.get(url, { params });
    logger.info('SMS sent successfully', { data: response.data });
    return { statusCode: 200, data: response.data };
  } catch (error) {
    logger.error('Error sending SMS', { message: error.message, stack: error.stack });
    throw { statusCode: 500, errorCode: 1073, data: { message: 'Failed to send SMS' } };
  }
};

module.exports = { sendSMS };

