const axios = require('axios');
// const requestIp = require('request-ip');
const { getIp } = require('./getClientIp ');
const logger = require('../logger'); // Adjust this to your actual logger module

const logWithMeta = (level, message, additionalMeta = {}, responseData = null) => {
    // Common metadata extracted from the request
    const metaData = {
    
        ...additionalMeta // Include executionTime, errorCode, and other custom metadata
    };

    // Include response data if provided
    if (responseData) {
        metaData.responseData = responseData; // Add response data to the metadata
    }

    // Log the message with metadata
    logger.logWithMeta(level, message, metaData);
};

// async function getIp(req) {
//     let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

//     // If IP is localhost or private, try fetching the public IP
//     if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
//         try {
//             const ipResponse = await axios.get('https://api.ipify.org?format=json');
//             clientIp = ipResponse.data.ip;
//         } catch (error) {
//             logWithMeta('error', 'Error fetching public IP', req, { error: error.message, errorCode: 971 });
//             clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
//         }
//     }

//     return clientIp;
// }

module.exports = {
    logWithMeta,
    getIp
};


// const logWithMeta = (level, message, req, additionalMeta = {}, responseData = null) => {
//     // Common metadata extracted from the request
//     const metaData = {
//         hospitalId: req.hospitalId,
//         userId: req.userId,
//         ip: req.clientIp || req.headers['x-forwarded-for'] || req.connection.remoteAddress, // Handling client IP
//         userAgent: req.headers['user-agent'],
//         apiName: req.originalUrl,
//         method: req.method,
//         ...additionalMeta // Include executionTime, errorCode, and other custom metadata
//     };

//     // Include response data if provided
//     if (responseData) {
//         metaData.responseData = responseData; // Add response data to the metadata
//     }

//     // Log the message with metadata
//     logger.logWithMeta(level, message, metaData);
// };

// module.exports = {
//     logWithMeta
// };
