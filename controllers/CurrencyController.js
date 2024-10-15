const Currency = require('../models/CurrencyModel');


const logger = require('../logger'); // Assuming you have a logger utility
const requestIp = require('request-ip');

async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 1115 });

      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

// POST: Create new currency
exports.createCurrency = async (req, res) => {

  const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
  const { currencyName, currencyCode } = req.body;

  try {
    if (!currencyName || !currencyCode) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1116;
  
      // Log the warning
      logger.logWithMeta("warn", `Error creating currency: Missing currency name or code, ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.error(`Error creating currency: Missing currency name or code, errorCode: ${errorCode}`, { currencyName, currencyCode });
      return res.status(400).json({ errorCode: 1116, message: 'Currency name and code are required' });
  }
  

    const newCurrency = await Currency.create({
      currencyName,
      currencyCode
    });

    // logger.info('Currency created successfully', { data: newCurrency });
    const end = Date.now();
      const executionTime = `${end - start}ms`;
    
      // Log the warning
      logger.logWithMeta("warn", `Currency created successfully`, {
        executionTime,
        data: newCurrency,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method   ,  
        userAgent: req.headers['user-agent'],    // HTTP method
      });
    return res.status(200).json({
  
      message: 'Currency created successfully',
      data: newCurrency
    });
  }catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1117;

    // Log the warning
    logger.logWithMeta("warn", `Error creating currency: ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error(`Error creating currency:`, error, { errorCode });
    return res.status(500).json({ errorCode: 1117, message: 'Internal server error' });
}
};

// GET: Get all currencies
exports.getAllCurrencies = async (req, res) => {
  const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
  try {
    const currencies = await Currency.findAll();
    // logger.info('Currencies retrieved successfully', { data: currencies });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
  
    // Log the warning
    logger.logWithMeta("warn", `Currencies retrieved successfully`, {
      executionTime,
      data: currencies,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });
    return res.status(200).json({
    
      message: 'Currencies retrieved successfully',
      data: currencies
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1118;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching currencies: ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error('Error fetching currencies:', error,{ errorCode });
    return res.status(500).json({ errorCode: 1118, message: 'Internal server error' });
  }
};

// GET: Get currency by code
exports.getCurrencyByCode = async (req, res) => {
  const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
  const { currencyCode } = req.params;

  try {
    const currency = await Currency.findOne({
      where: { currencyCode }
    });

    if (!currency) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1119;
  
      // Log the warning
      logger.logWithMeta("warn", `Currency not found: ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.warn('Currency not found', { currencyCode },{ errorCode });
      return res.status(404).json({ errorCode: 1119, message: 'Currency not found' });
    }
    const end = Date.now();
    const executionTime = `${end - start}ms`;
  
    // Log the warning
    logger.logWithMeta("warn", `Currency retrieved successfully`, {
      executionTime,
      data: currency,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });
    // logger.info('Currency retrieved successfully', { data: currency },{ errorCode });
    return res.status(200).json({
      
      message: 'Currency retrieved successfully',
      data: currency
    });
  } catch (error) {
    const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1120;
  
      // Log the warning
      logger.logWithMeta("warn", `Error fetching currency: ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
    // logger.error('Error fetching currency:', error,{ errorCode });
    return res.status(500).json({ errorCode: 1120, message: 'Internal server error' });
  }
};
