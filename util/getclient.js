const axios = require('axios');
const logger = require('../logger'); // Ensure logger is correctly imported

async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;

  // Normalize if clientIp is an array (x-forwarded-for may return multiple IPs)
  if (Array.isArray(clientIp)) {
    clientIp = clientIp[0];
  }

  // Convert IPv6 loopback to IPv4
  if (clientIp === '::1') {
    clientIp = '127.0.0.1';
  }

  // Check for private/local IP ranges
  if (!clientIp || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.') || clientIp === '127.0.0.1') {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {
      logger.logWithMeta('Error fetching public IP', { error: error.message, errorCode: 1233 });
      clientIp = '127.0.0.1'; // Fallback
    }
  }

  return clientIp;
}

module.exports = getClientIp;
