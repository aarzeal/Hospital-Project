const axios = require("axios");
const logger = require("../logger");

async function getLocationData(clientIp) {
    let locationData = { city: "Unknown" };

    try {
        const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
        locationData = locationResponse.data;
    } catch (error) {
        logger.error("Error fetching location data", { error: error.message });
    }

    return locationData;
}

module.exports = getLocationData;
