const Currency = require('../models/CurrencyModel');

const logger = require('../logger'); // Assuming you have a logger utility


// POST: Create new currency
exports.createCurrency = async (req, res) => {
  const { currencyName, currencyCode } = req.body;

  try {
    if (!currencyName || !currencyCode) {
      const errorCode = 1107;
      logger.error(`Error creating currency: Missing currency name or code, errorCode: ${errorCode}`, { currencyName, currencyCode });
      return res.status(400).json({ errorCode: 1107, message: 'Currency name and code are required' });
  }
  

    const newCurrency = await Currency.create({
      currencyName,
      currencyCode
    });

    logger.info('Currency created successfully', { data: newCurrency });
    return res.status(201).json({
      errorCode: 1108,
      message: 'Currency created successfully',
      data: newCurrency
    });
  }catch (error) {
    const errorCode = 1109;
    logger.error(`Error creating currency:`, error, { errorCode });
    return res.status(500).json({ errorCode: 1109, message: 'Internal server error' });
}
};

// GET: Get all currencies
exports.getAllCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.findAll();
    logger.info('Currencies retrieved successfully', { data: currencies });
    return res.status(200).json({
      errorCode: 1110,
      message: 'Currencies retrieved successfully',
      data: currencies
    });
  } catch (error) {
    const  errorCode = 1111 
    logger.error('Error fetching currencies:', error,{ errorCode });
    return res.status(500).json({ errorCode: 1111, message: 'Internal server error' });
  }
};

// GET: Get currency by code
exports.getCurrencyByCode = async (req, res) => {
  const { currencyCode } = req.params;

  try {
    const currency = await Currency.findOne({
      where: { currencyCode }
    });

    if (!currency) {
      const errorCode = 1112
      logger.warn('Currency not found', { currencyCode },{ errorCode });
      return res.status(404).json({ errorCode: 1112, message: 'Currency not found' });
    }
const errorCode = 1113
    logger.info('Currency retrieved successfully', { data: currency },{ errorCode });
    return res.status(200).json({
      errorCode: 1113,
      message: 'Currency retrieved successfully',
      data: currency
    });
  } catch (error) {
    const errorCode = 1114;
    logger.error('Error fetching currency:', error,{ errorCode });
    return res.status(500).json({ errorCode: 1114, message: 'Internal server error' });
  }
};
