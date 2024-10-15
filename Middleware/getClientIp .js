const axios = require('axios');
const requestIp = require('request-ip');
const logger = require('../logger'); // Adjust this path as necessary

async function getIp(req) {
    let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

    // If IP is localhost or private, try fetching the public IP
    if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
        try {
            const ipResponse = await axios.get('https://api.ipify.org?format=json');
            clientIp = ipResponse.data.ip;
        } catch (error) {
            logger.logWithMeta('error', 'Error fetching public IP', req, { error: error.message, errorCode: 971 });
            clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
        }
    }

    return clientIp;
}

module.exports = {
    getIp
};
