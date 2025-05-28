const Currency = require("../models/CurrencyModel");

const logger = require("../logger"); // Assuming you have a logger utility
const requestIp = require("request-ip");
const getLocationData = require("../util/locationHelper");

async function getClientIp(req) {
  let clientIp =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (
    clientIp === "::1" ||
    clientIp === "127.0.0.1" ||
    clientIp.startsWith("192.168") ||
    clientIp.startsWith("10.") ||
    clientIp.startsWith("172.")
  ) {
    try {
      const ipResponse = await axios.get("https://api.ipify.org?format=json");
      clientIp = ipResponse.data.ip;
    } catch (error) {
      logger.logWithMeta("Error fetching public IP", {
        error: error.message,
        erroerCode: 1115,
      });

      clientIp = "127.0.0.1"; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

// POST: Create new currency
exports.createCurrency = async (req, res) => {
  const clientIp = await getClientIp(req); // Get the HospitalIDR from the decoded token
  const start = Date.now();
  const { currencyName, currencyCode } = req.body;

  try {
    if (!currencyName || !currencyCode) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1116;
      const statusCode = 400;
      // Log the warning
      logger.logWithMeta(
        "warn",
        `Error creating currency: Missing currency name or code, ${error.message}`,
        {
          errorCode,
          errorMessage: error.message,
          executionTime,
          hospitalId: req.hospitalId,
          statusCode,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );
      // logger.error(`Error creating currency: Missing currency name or code, errorCode: ${errorCode}`, { currencyName, currencyCode });
      return res
        .status(400)
        .json({
          errorCode: 1116,
          message: "Currency name and code are required",
        });
    }

    const newCurrency = await Currency.create({
      currencyName,
      currencyCode,
    });

    // logger.info('Currency created successfully', { data: newCurrency });
    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log the warning
    logger.logWithMeta("warn", `Currency created successfully`, {
      executionTime,
      statusCode: 200,
      data: newCurrency,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    return res.status(200).json({
      message: "Currency created successfully",
      data: newCurrency,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1117;
    const statusCode = 500;

    // Log the warning
    logger.logWithMeta("warn", `Error creating currency: ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      statusCode,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // logger.error(`Error creating currency:`, error, { errorCode });
    return res
      .status(500)
      .json({ errorCode: 1117, message: "Internal server error" });
  }
};

// GET: Get all currencies
exports.getAllCurrencies = async (req, res) => {
  const clientIp = await getClientIp(req); // Get the HospitalIDR from the decoded token
  const start = Date.now();
  try {
    const currencies = await Currency.findAll();
    // logger.info('Currencies retrieved successfully', { data: currencies });
    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log the warning
    logger.logWithMeta("warn", `Currencies retrieved successfully`, {
      executionTime,
      statusCode: 200,
      data: currencies,

      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    return res.status(200).json({
      message: "Currencies retrieved successfully",
      data: currencies,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1118;
    const statusCode = 500;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching currencies: ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      statusCode,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // logger.error('Error fetching currencies:', error,{ errorCode });
    return res
      .status(500)
      .json({ errorCode: 1118, message: "Internal server error" });
  }
};

exports.getAllCurrenciesbypagination = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
   // const currency = require("../models/CurrencyModel")(req.sequelize);
    const { id, page, limit,...queryColumns } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let attributes = Object.keys(queryColumns);
    if (!attributes.includes("id")) {
      attributes.push("id");
    }

   if (attributes.length === 1 && attributes[0] === "id") {
      attributes = undefined;
    }
    let data, totalRecords;
    const queryKeys = Object.keys(req.query);
    const filterKeys = queryKeys.filter(
      (key) => key !== "page" && key !== "limit"
    );

   if (id) {
         data = await Currency.findOne({
           where: { id },
           attributes,
         });
         if (!data) {
           const executionTime = `${Date.now() - start}ms`;
           const errorCode = 2123;
           logger.logWithMeta("error", "Currencies not found", {
             errorCode,
             executionTime,
             hospitalId: req.hospitalName,
             apiName: req.originalUrl,
             city: locationData?.city,
             country: locationData?.country,
             method: req.method,
             userAgent: req.headers["user-agent"],
             createdBy: req.username,
             updatedBy: req.username,
           });
            return res
          .status(404)
          .json({ errorCode, message: "Currencies Not Found" });
      }
    } else{
        const isPagination=req.query.page && req.query.limit;
      if(filterKeys.length===0){
        if(isPagination){
          totalRecords=await Currency.count();
          data= await Currency.findAll({
            offset,
            limit: limitNum,
            attributes,
            order:[['id','ASC']],
          });
        }else{
          data=await Currency.findAll({
            attributes,
            order:[['id','ASC']],
          });
          totalRecords=data.length;
        }
      }else{
         if(isPagination){
          totalRecords=await Currency.count();
          data= await Currency.findAll({
            offset,
            limit: limitNum,
            attributes,
            order:[['id','ASC']],
          });
        }else{
          data=await Currency.findAll({
            attributes,
            order:[['id','ASC']],
          });
          totalRecords=data.length;
        }
      }
    }

const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Currencies Successfully",{
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });

    const formatData = (record) => {
      const obj = record.toJSON();
      const { id, ...rest } = obj;
      return {id, ...rest };
    };

    const formattedData = Array.isArray(data)
      ? data.map(formatData)
      : data
      ? formatData(data)
      : null;

    const meta = {
      statusCode: 200,
      executionTime,
      hospitalDatabase,
    };

    if (!id && req.query.page && req.query.limit) {
      meta.pagination = {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
      };
    }

    res.status(200).json({
      meta,
      data: formattedData,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1263;

    logger.logWithMeta("error", "Error fetching Currencies data", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching Currencies: " + error.message },
    });
  }
};  

// GET: Get Currency by code
exports.getCurrencyByCode = async (req, res) => {
  const clientIp = await getClientIp(req); // Get the HospitalIDR from the decoded token
  const start = Date.now();
  const { currencyCode } = req.params;

  try {
    const currency = await Currency.findOne({
      where: { currencyCode },
    });

    if (!currency) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1119;
      const statusCode = 404;

      // Log the warning
      logger.logWithMeta("warn", `Currency not found: ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        statusCode,

        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      // logger.warn('Currency not found', { currencyCode },{ errorCode });
      return res
        .status(404)
        .json({ errorCode: 1119, message: "Currency not found" });
    }
    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log the warning
    logger.logWithMeta("warn", `Currency retrieved successfully`, {
      executionTime,
      statusCode: 200,
      data: currency,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // logger.info('Currency retrieved successfully', { data: currency },{ errorCode });
    return res.status(200).json({
      message: "Currency retrieved successfully",
      data: currency,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1120;
    const statusCode = 500;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching currency: ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      statusCode,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // logger.error('Error fetching currency:', error,{ errorCode });
    return res
      .status(500)
      .json({ errorCode: 1120, message: "Internal server error" });
  }
};
