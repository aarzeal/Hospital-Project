const { createProductSchema } = require("../validators/productSchema");
const { toProductEntity } = require("../dtos/productDTO");
const logger = require("../logger");
const productDAO = require("../Dao/productDAO");
const dto = require("../dtos/productDTO");
const getLocationData = require("../util/locationHelper");
const getClientIp = require("../util/clientip");

exports.createProduct = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  try {
    const { error } = createProductSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const productData = dto.toProductEntityPOST(req.body);
    const result = await productDAO.createProduct(req.sequelize, productData);

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Product created successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      message: "Product created",
      meta: {
        statusCode: 200,
        executionTime,
      },
      data: dto.toProductEntity(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 2;

    logger.logWithMeta("error", "Error creating Product", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error creating Product: " + error.message },
    });
  }
};

exports.getAllProducts = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1) {
      return res
        .status(400)
        .json({ error: "Page and limit must be positive integers" });
    }

    const result = await productDAO.getAllProducts(req.sequelize, {
      page,
      limit,
    });
    const transformedRows = result.rows.map((row) => toProductEntity(row));
    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Products Fetched successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        page: page,
        limit: limit,
        totalRecords: result.count,
        totalPages: Math.ceil(result.count / limit),
      },
      data: transformedRows,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1;

    logger.logWithMeta("error", "Error creating Product", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error Fetching Products: " + error.message },
    });
  }
};

exports.getProductAsPerQueryParam = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);

  try {
    const aliasToDbFieldMap = {
      productName: "product_Name",
      productPrice: "product_Price",
      productCategory: "product_Category",
      productQuality:"product_Quality"
    };

    const queryKeys = Object.keys(req.query).filter(
      (key) => !["page", "limit"].includes(key)
    );

    let fields = ["product_Id"];
    if (queryKeys.length > 0) {
      const requestedFields = queryKeys
        .map((key) => aliasToDbFieldMap[key])
        .filter(Boolean);
      fields.push(...new Set(requestedFields));
    } else {
      fields = null;
    }

    // Check if both page and limit are provided
    const hasPagination = req.query.page && req.query.limit;

    let pagination = null;
    let page = null;
    let limit = null;

    if (hasPagination) {
      page = parseInt(req.query.page);
      limit = parseInt(req.query.limit);

      if (page < 1 || limit < 1 || isNaN(page) || isNaN(limit)) {
        return res
          .status(400)
          .json({ error: "Page and limit must be positive integers" });
      }

      pagination = { page, limit };
    }

    const result = await productDAO.getProductAsPerQueryParam(req.sequelize, {
      ...(pagination || {}), // Only adds pagination if defined
      fields,
    });

    const transformedRows = result.rows.map((row) => toProductEntity(row));
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Products Fetched successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    const meta = {
      statusCode: 200,
      executionTime,
    };

    if (pagination) {
      meta.page = page;
      meta.limit = limit;
      meta.totalRecords = result.count;
      meta.totalPages = Math.ceil(result.count / limit);
    }

    res.status(200).json({
      meta,
      data: transformedRows,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1;

    logger.logWithMeta("error", "Error Fetching Products", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error Fetching Products: " + error.message },
    });
  }
};

// exports.updateProduct = async (req, res) => {
//   const start = Date.now();
//   const id = req.params.product_id;
//   const updateData = req.body;

//   try {
//     const product = await productDAO.findById(req.sequelize, id);
//     if (!product) {
//       return res.status(404).json({
//         meta: { statusCode: 404 },
//         error: { message: "Product not found" },
//       });
//     }

//     await productDAO.updateProduct(req.sequelize, id, updateData);
//     const updatedProduct = await productDAO.findById(req.sequelize, id);

//     const executionTime = `${Date.now() - start}ms`;
//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime,
//         message: "Product updated successfully",
//       },
//       data: updatedProduct,
//     });
//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     res.status(500).json({
//       meta: { statusCode: 500, executionTime },
//       error: { message: "Error updating product: " + error.message },
//     });
//   }
// };



// exports.getProductAsPerQueryParam = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const locationData = await getLocationData(clientIp);

//   try {
//     let page = parseInt(req.query.page) || 1;
//     let limit = parseInt(req.query.limit) || 10;

//     if (page < 1 || limit < 1) {
//       return res
//         .status(400)
//         .json({ error: "Page and limit must be positive integers" });
//     }

//     const aliasToDbFieldMap = {
//       Name: "productName",
//       product_price: "price",
//     };
//     const queryKeys = Object.keys(req.query).filter(
//       (key) => !["page", "limit"].includes(key)
//     );

//     let fields = ["id"];

//     if (queryKeys.length > 0) {
//       const requestedFields = queryKeys
//         .map((key) => aliasToDbFieldMap[key])
//         .filter(Boolean);
//       fields.push(...new Set(requestedFields));
//     } else {
//       fields = null;
//     }
//     const result = await productDAO.getProductAsPerQueryParam(req.sequelize, {
//       page,
//       limit,
//       fields,
//     });

//     const transformedRows = result.rows.map((row) => toProductEntity(row));
//     const executionTime = `${Date.now() - start}ms`;
//     logger.logWithMeta("info", "Products Fetched successfully", {
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       ip: clientIp,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//     });

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime,
//         page,
//         limit,
//         totalRecords: result.count,
//         totalPages: Math.ceil(result.count / limit),
//       },
//       data: transformedRows,
//     });
//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 1;

//     logger.logWithMeta("error", "Error Fetching Products", {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       createdBy: req.username,
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime },
//       error: { message: "Error Fetching Products: " + error.message },
//     });
//   }
// };

// exports.getProductAsPerQueryParam = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const locationData = await getLocationData(clientIp);

//   try {
//     let page = parseInt(req.query.page) || 1;
//     let limit = parseInt(req.query.limit) || 10;

//     const allowedFields = ['id', 'productName'];
//     const fields = req.query.fields
//       ? req.query.fields.split(',').map(field => field.trim()).filter(field => allowedFields.includes(field))
//       : null;

//     if (page < 1 || limit < 1) {
//       return res.status(400).json({ error: "Page and limit must be positive integers" });
//     }

//     const result = await productDAO.getProductAsPerQueryParam(req.sequelize, { page, limit, fields });

//     const transformedRows = result.rows.map(row => toProductEntity(row));

//     const executionTime = `${Date.now() - start}ms`;
//     logger.logWithMeta("info", "Products Fetched successfully", {
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       ip: clientIp,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//     });

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime,
//         page,
//         limit,
//         totalRecords: result.count,
//         totalPages: Math.ceil(result.count / limit),
//       },
//       data: transformedRows,
//     });

//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 1;

//     logger.logWithMeta("error", "Error Fetching Products", {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       createdBy: req.username,
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime },
//       error: { message: "Error Fetching Products: " + error.message },
//     });
//   }
// };

// exports.getProductAsPerQueryParam = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const locationData = await getLocationData(clientIp);

//   try {
//     let page = parseInt(req.query.page) || 1;
//     let limit = parseInt(req.query.limit) || 10;

//     if (page < 1 || limit < 1) {
//       return res.status(400).json({ error: "Page and limit must be positive integers" });
//     }

//     const aliasToDbFieldMap = {
//       Name: "productName",
//       product_price:"price"
//     };

//     const requestedFields = Object.keys(req.query)
//       .filter(key => !['page', 'limit'].includes(key))
//       .map(key => aliasToDbFieldMap[key])
//       .filter(Boolean);

//     const fields = ['id', ...new Set(requestedFields)];

//     const result = await productDAO.getProductAsPerQueryParam(req.sequelize, { page, limit, fields });

//     const transformedRows = result.rows.map(row => toProductEntity(row));

//     const executionTime = `${Date.now() - start}ms`;
//     logger.logWithMeta("info", "Products Fetched successfully", {
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       ip: clientIp,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//     });

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime,
//         page,
//         limit,
//         totalRecords: result.count,
//         totalPages: Math.ceil(result.count / limit),
//       },
//       data: transformedRows,
//     });

//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 1;

//     logger.logWithMeta("error", "Error Fetching Products", {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       createdBy: req.username,
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime },
//       error: { message: "Error Fetching Products: " + error.message },
//     });
//   }
// };
