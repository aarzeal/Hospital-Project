// const axios = require('axios');
// const requestIp = require('request-ip');
// const logger = require('../logger');

// async function getClientIp(req) {
//   let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

//   // If IP is localhost or private, try fetching the public IP
//   if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
//     try {
//       const ipResponse = await axios.get('https://api.ipify.org?format=json');
//       clientIp = ipResponse.data.ip;
//     } catch (error) {
//       logger.logWithMeta('Error fetching public IP', { error: error.message, errorCode: 971 });
//     }
//   }

//   return clientIp;
// }

// module.exports = getClientIp;

const requestIp = require("request-ip");

function getClientIp(req) {
  let clientIp = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || requestIp.getClientIp(req);

  // If multiple IPs exist in `x-forwarded-for`, take the first one (real client IP)
  if (clientIp && clientIp.includes(",")) {
    clientIp = clientIp.split(",")[0].trim();
  }

  return clientIp;
}

module.exports = getClientIp;
