// exports.createHospital = async (req, res) => {
//   const start = Date.now(); // Initialize start time at the beginning

//   // Ensure the res object is correctly defined
//   if (!res || typeof res.status !== 'function') {
//     console.error('Response object is not properly defined at the start of the function');
//     return;
//   }

//   // Validation Check
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     logger.info('Validation errors occurred', errors);
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 912,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Validation errors occurred',
//         details: errors.array().map(err => ({
//           field: err.param,
//           message: err.msg
//         }))
//       }
//     });
//   }

//   try {
//     // Check for existing hospital by ManagingCompanyEmail
//     const existingHospital = await Hospital.findOne({ where: { ManagingCompanyEmail: req.body.ManagingCompanyEmail } });
//     if (existingHospital) {
//       const end = Date.now();
//       return res.status(400).json({
//         meta: {
//           statusCode: 400,
//           errorCode: 956,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Managing Company Email already exists'
//         }
//       });
//     }

//     // Create Hospital
//     const hospital = await Hospital.create(req.body);
//     logger.info('Hospital created successfully', {
//       hospitalId: hospital.HospitalID,
//       executionTime: `${Date.now() - start}ms`
//     });

//     // Generate database name from HospitalDatabase field
//     const databaseName = hospital.HospitalDatabase.replace(/\s+/g, '_').toLowerCase();
//     logger.info(`Generated database name: ${databaseName}`);

//     // Create new database
//     await sequelize.query(`CREATE DATABASE \`${databaseName}\``);
//     logger.info(`Database ${databaseName} created successfully`);

//     // Create dynamic connection to the new database
//     const { sequelize: dynamicDb, testConnection } = createDynamicConnection(databaseName);

//     // Test the connection to the new database
//     await testConnection();
//     logger.info(`Connected to database ${databaseName} successfully`);

//     // Define and sync the UserMaster model in the new database
//     const UserMaster = createUserMasterModel(dynamicDb);
//     await dynamicDb.sync();
//     logger.info(`Models synchronized successfully in database ${databaseName}, executionTime: ${Date.now() - start}ms`);

//     // Generate and store unique key in the hospital record
//     const uniqueKey = uuidv4();
//     logger.info(`Generated unique key: ${uniqueKey}`);
//     hospital.UniqueKey = uniqueKey;
//     await hospital.save({ fields: ['UniqueKey'] });
//     logger.info(`Unique key stored in hospital record successfully, executionTime: ${Date.now() - start}ms`);

//     // Send response with successful hospital creation
//     const end = Date.now();
//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: hospital
//     });
//   } catch (error) {
//     // Catch any errors that occur during the hospital creation process
//     const end = Date.now();
//     logger.error('Error creating hospital', { error: error.message });

//     // Log the state of res to diagnose potential issues
//     console.error('Response object in catch block:', res);

//     // Ensure the response object is correctly handled in the catch block
//     if (res && typeof res.status === 'function') {
//       res.status(500).json({
//         meta: {
//           statusCode: 500,
//           errorCode: 913,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Error creating hospital: ' + error.message
//         }
//       });
//     } else {
//       console.error('Response object is not properly defined or corrupted in catch block');
//     }
//   }
// };


// exports.createHospital = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const errors = validationResult(req);

  

//   if (!errors.isEmpty()) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 901;

//     logger.logWithMeta("warn", "Validation errors occurred", {
//       errorCode,
//       statusCode: 400,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//     });

//     return res.status(400).json({
//       meta: { statusCode: 400, errorCode },
//       error: {
//         message: "Validation errors occurred",
//         details: errors.array().map((err) => ({
//           field: err.param,
//           message: err.msg,
//         })),
//       },
//     });
//   }

//   try {
//     const { ManagingCompanyEmail, HospitalLogo,HospitalName, ...hospitalData } = req.body;

//     upload.single('HospitalLogo');

//     // Check for existing hospital
//     const existingHospital = await Hospital.findOne({ where: { ManagingCompanyEmail } });
//     if (existingHospital) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 902;

//       logger.logWithMeta("warn", "Managing Company Email already exists", {
//         errorCode,
//         statusCode: 400,
//         executionTime,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//       });

//       return res.status(400).json({
//         meta: { statusCode: 400, errorCode },
//         error: { message: "Managing Company Email already exists" },
//       });
//     }

//     let savedImagePath = null;
//     let imgBase64 = null;
//     if (HospitalLogo) {
//       imgBase64 = HospitalLogo.startsWith('data:image/jpeg;base64/') ? HospitalLogo.split(',')[1] : HospitalLogo; // Extract base64 part if needed
//       savedImagePath = saveBase64Image(HospitalLogo, HospitalName);
//       console.log("savedImagePath",savedImagePath)
//     } else if (req.file) {
//       const imgBuffer = fs.readFileSync(req.file.path);
//       imgBase64 = imgBuffer.toString('base64'); // Convert to base64
//     }


//     // Create hospital record
//     const hospital = await Hospital.create({HospitalLogo:savedImagePath,...hospitalData});

//     // Generate database name and create it
//     const databaseName = hospital.HospitalDatabase.replace(/\s+/g, "_").toLowerCase();
//     await sequelize.query(`CREATE DATABASE \`${databaseName}\``);

//     hospital.UniqueKey = uuidv4();
//     await hospital.save({ fields: ["UniqueKey"] });

//     // Handle saving the logo
//     // if (HospitalLogo) {
//     //   const savedImagePath = saveBase64Image(HospitalLogo, `hospital_${hospital.HospitalID}`);
//     //   hospital.LogoPath = savedImagePath;
//     //   await hospital.save({ fields: ["HospitalLogo"] });
//     // }


//     const executionTime = `${Date.now() - start}ms`;

//     logger.logWithMeta("info", "Hospital created successfully", {
//       statusCode: 200,
//       executionTime,
//       hospitalId: hospital.HospitalID,
//       ip: clientIp,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//     });

//     res.status(200).json({
//       meta: { statusCode: 200, executionTime },
//       data: hospital,
//     });
//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 903;

//     logger.logWithMeta("error", `Error creating hospital: ${error.message}`, {
//       errorCode,
//       statusCode: 500,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime },
//       error: { message: `Error creating hospital: ${error.message}` },
//     });
//   }
// };











// exports.getHospitalById = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const id = req.params.id;
//   try {
//     const hospital = await Hospital.findByPk(id);
//     if (!hospital) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 905;

//       // Log the warning
//       logger.logWithMeta(
//         "warn",
//         `Hospital with ID ${id} not found ${error.message}`,
//         {
//           errorCode,
//           statusCode: 404,
//           errorMessage: error.message,
//           executionTime,
//           hospitalId: req.hospitalId,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers["user-agent"], // HTTP method
//         }
//       );

//       // logger.warn(`Hospital with ID ${id} not found`);
//       // const end = Date.now();
//       res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 905,
//           executionTime: `${end - start}ms`,
//         },
//         error: {
//           message: "Hospital not found",
//         },
//       });
//     } else {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       // Log the warning
//       logger.logWithMeta(
//         "warn",
//         `Retrieved hospital with ID ${id} successfully`,
//         {
//           executionTime,
//           statusCode: 200,
//           hospitalId: req.hospitalId,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers["user-agent"], // HTTP method
//         }
//       );
//       // logger.info(`Retrieved hospital with ID ${id} successfully`);
//       res.json({
//         meta: {
//           statusCode: 200,
//           executionTime: `${end - start}ms`,
//         },
//         data: hospital,
//       });
//     }
//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 906;

//     // Log the warning
//     logger.logWithMeta("warn", `Error retrieving hospital ${error.message}`, {
//       errorCode,
//       statusCode: 500,
//       errorMessage: error.message,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers["user-agent"], // HTTP method
//     });
//     // const end = Date.now();
//     // logger.error('Error retrieving hospital', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 906,
//         executionTime: `${end - start}ms`,
//       },
//       error: {
//         message: "Error retrieving hospital: " + error.message,
//       },
//     });
//   }
// };

// exports.getHospitalById = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const id = req.params.id;

//   try {
//     const hospital = await Hospital.findByPk(id);
//     if (!hospital) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 905;

//       logger.logWithMeta("warn", `Hospital with ID ${id} not found`, {
//         errorCode,
//         statusCode: 404,
//         executionTime,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//       });

//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 905,
//           executionTime,
//         },
//         error: {
//           message: "Hospital not found",
//         },
//       });
//     } else {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;

//       // // Handle logo URL conversion if applicable
//       let logoUrl = hospital.hospitalLogoUrl;
//       if (logoUrl) {
//         const fs = require('fs');
//         const logoPath = path.resolve(__dirname, '../path_to_logo_folder', logoUrl); // Adjust the path

//         if (fs.existsSync(logoPath)) {
//           const logoFile = fs.readFileSync(logoPath);
//           logoUrl = `data:image/jpeg;base64,${logoFile.toString('base64')}`;
//         }
//       }
   


//       // Add logo URL to response
//       hospital.hospitalLogoUrl = logoUrl;

//       logger.logWithMeta("info", `Retrieved hospital with ID ${id} successfully`, {
//         executionTime,
//         statusCode: 200,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//       });

//       res.json({
//         meta: {
//           statusCode: 200,
//           executionTime,
//         },
//         data: hospital,
       
//       });
//     }
//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 906;

//     logger.logWithMeta("warn", `Error retrieving hospital: ${error.message}`, {
//       errorCode,
//       statusCode: 500,
//       errorMessage: error.message,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//     });

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 906,
//         executionTime,
//       },
//       error: {
//         message: "Error retrieving hospital: " + error.message,
//       },
//     });
//   }
// };





// exports.loginUser = async (req, res) => {
//   const start = Date.now();
//   const { Username, Password } = req.body;

//   if (!Username || !Password) {
//     const end = Date.now();
//     logger.error('Username or Password not provided', { executionTime: `${end - start}ms` });

//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 930,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Username and Password are required'
//       }
//     });
//   }

//   try {
//     const User = require('../models/user')(req.sequelize);
//     console.log('Username:', Username); // Debugging log
//     const user = await User.findOne({ where: { username: Username } });

//     if (!user || !await bcrypt.compare(Password, user.password)) {
//       const end = Date.now();
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 925,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Invalid username or password'
//         }
//       });
//     }

//     const token = jwt.sign(
//       { userId: user.userId },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     const end = Date.now();
//     return res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         token,
//         user: {
//           id: user.userId,
//           username: user.username,
//           email: user.email
//         },
//         message: 'Login successful'
//       }
//     });
//   } catch (error) {
//     const end = Date.now();
//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 926,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error logging in: ' + error.message
//       }
//     });
//   }
// };

// client.on('error', (err) => {
//   console.error('Redis error:', err);
// });
// exports.HospitalCode = async (req, res) => {

//   const start = Date.now();
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     logger.warn(`Validation errors occurred during login, executionTime: ${end - start}ms`, errors);

//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 1044,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Validation errors occurred',
//         details: errors.array().map(err => ({
//           field: err.param,
//           message: err.msg
//         }))
//       }
//     });
//   }

//   const { HospitalCode } = req.body;

//   try {
//     const hospital = await Hospital.findOne({ where: { HospitalCode } });
//     if (!hospital) {
//       const end = Date.now();
//       logger.warn(`Hospital with HospitalCode ${HospitalCode} not found, executionTime: ${end - start}ms`);

//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 1045,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Hospital not found'
//         }
//       });
//     }
//      // Check if the hospital already has a valid token in Redis
//     //  client.get(hospital.HospitalID.toString(), (err, existingToken) => {
//     //   if (err) {
//     //     const end = Date.now();
//     //     logger.error('Error checking Redis for existing token', { executionTime: `${end - start}ms`, error: err });

//     //     return res.status(500).json({
//     //       meta: {
//     //         statusCode: 500,
//     //         errorCode: 1050,
//     //         executionTime: `${end - start}ms`
//     //       },
//     //       error: {
//     //         message: 'Error checking existing login session'
//     //       }
//     //     });
//     //   }

//     //   if (existingToken) {
//     //     const end = Date.now();
//     //     return res.status(400).json({
//     //       meta: {
//     //         statusCode: 400,
//     //         errorCode: 1051,
//     //         executionTime: `${end - start}ms`
//     //       },
//     //       error: {
//     //         message: 'Hospital already logged in'
//     //       }
//     //     });
//     //   }
//     // })
//   // Generate a new token
//     const Hospitaltoken = jwt.sign(
//       { hospitalId: hospital.HospitalID, hospitalDatabase: hospital.HospitalDatabase, hospitalGroupIDR: hospital.HospitalGroupIDR },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//   // // Store the token in Redis with an expiration time
//   // redisClient.set(hospital.HospitalID.toString(), Hospitaltoken, 'EX', 24 * 60 * 60, (err, reply) => {
//   //   if (err) {
//   //     const end = Date.now();
//   //     logger.error('Error storing token in Redis', { executionTime: `${end - start}ms`, error: err });

//   //     return res.status(500).json({
//   //       meta: {
//   //         statusCode: 500,
//   //         errorCode: 1052,
//   //         executionTime: `${end - start}ms`
//   //       },
//   //       error: {
//   //         message: 'Error storing login session'
//   //       }
//   //     });
//   //   }

//     const end = Date.now();
//     logger.info(`Hospital with HospitalCode ${HospitalCode} found successfully, executionTime: ${end - start}ms`);

//     req.hospitalDatabase = hospital.HospitalDatabase;
//     const decodedToken = jwt.decode(Hospitaltoken);
//     const currentTime = Math.floor(Date.now() / 1000);
//     const expiresIn = decodedToken.exp - currentTime;
//     const expiresInMinutes = Math.floor(expiresIn / 60);
//     console.log(`Token expires in: ${expiresIn} seconds`);

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         Hospitaltoken,
//         expiresInMinutes: `${expiresInMinutes} min`,
//         hospital: {
//           hospitalId: hospital.HospitalID,
//           hospitalDatabase: hospital.HospitalDatabase,
//           hospitalGroupIDR: hospital.HospitalGroupIDR
//         },
//         message: 'Database name found successfully'
//       }
//     });
//   // });

//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error finding hospital', { error: error.message, executionTime: `${end - start}ms` });

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 1046,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error finding hospital: ' + error.message
//       }
//     });
//   }
// };

// exports.HospitalCode = async (req, res) => {
//   const start = Date.now();
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     logger.warn(`Validation errors occurred during login, executionTime: ${end - start}ms`, errors);

//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 1044,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Validation errors occurred',
//         details: errors.array().map(err => ({
//           field: err.param,
//           message: err.msg
//         }))
//       }
//     });
//   }

//   const { HospitalCode } = req.body;

//   try {
//     const hospital = await Hospital.findOne({ where: { HospitalCode } });
//     if (!hospital) {
//       const end = Date.now();
//       logger.warn(`Hospital with HospitalCode ${HospitalCode} not found, executionTime: ${end - start}ms`);

//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 1045,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Hospital not found'
//         }
//       });
//     }

//     // Check if the hospital already has a valid token in Redis
//     const existingToken = await getAsync(hospital.HospitalID.toString());
//     if (existingToken) {
//       const end = Date.now();
//       return res.status(400).json({
//         meta: {
//           statusCode: 400,
//           errorCode: 1051,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Hospital already logged in'
//         }
//       });
//     }

//     // Generate a new token
//     const Hospitaltoken = jwt.sign(
//       { hospitalId: hospital.HospitalID, hospitalDatabase: hospital.HospitalDatabase, hospitalGroupIDR: hospital.HospitalGroupIDR },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     // Store the token in Redis with an expiration time
//     await setAsync(hospital.HospitalID.toString(), Hospitaltoken, 'EX', 24 * 60 * 60);

//     const end = Date.now();
//     logger.info(`Hospital with HospitalCode ${HospitalCode} found successfully, executionTime: ${end - start}ms`);

//     req.hospitalDatabase = hospital.HospitalDatabase;
//     const decodedToken = jwt.decode(Hospitaltoken);
//     const currentTime = Math.floor(Date.now() / 1000);
//     const expiresIn = decodedToken.exp - currentTime;
//     const expiresInMinutes = Math.floor(expiresIn / 60);
//     console.log(`Token expires in: ${expiresIn} seconds`);

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         Hospitaltoken,
//         expiresInMinutes: `${expiresInMinutes} min`,
//         hospital: {
//           hospitalId: hospital.HospitalID,
//           hospitalDatabase: hospital.HospitalDatabase,
//           hospitalGroupIDR: hospital.HospitalGroupIDR
//         },
//         message: 'Database name found successfully'
//       }
//     });
//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error finding hospital', { error: error.message, executionTime: `${end - start}ms` });

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 1046,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error finding hospital: ' + error.message
//       }
//     });
//   }
// };

// exports.HospitalCode = async (req, res) => {
//   const start = Date.now();
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     logger.warn(`Validation errors occurred during login, executionTime: ${end - start}ms`, errors);

//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 1044,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Validation errors occurred',
//         details: errors.array().map(err => ({
//           field: err.param,
//           message: err.msg
//         }))
//       }
//     });
//   }

//   const { HospitalCode } = req.body;

//   try {
//     const hospital = await Hospital.findOne({ where: { HospitalCode } });
//     if (!hospital) {
//       const end = Date.now();
//       logger.warn(`Hospital with HospitalCode ${HospitalCode} not found, executionTime: ${end - start}ms`);

//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 1045,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Hospital not found'
//         }
//       });
//     }

//     // Check if the hospital already has a valid token in Redis
//     const existingToken = await getAsync(hospital.HospitalID.toString());
//     let Hospitaltoken = existingToken;

//     // If token is not present, generate a new one
//     if (!existingToken) {
//       Hospitaltoken = jwt.sign(
//         { hospitalId: hospital.HospitalID, hospitalDatabase: hospital.HospitalDatabase, hospitalGroupIDR: hospital.HospitalGroupIDR },
//         process.env.JWT_SECRET,
//         { expiresIn: '24h' }
//       );

//       // Store the new token in Redis with an expiration time
//       await setAsync(hospital.HospitalID.toString(), Hospitaltoken, 'EX', 24 * 60 * 60);
//     }

//     const end = Date.now();
//     logger.info(`Hospital with HospitalCode ${HospitalCode} found successfully, executionTime: ${end - start}ms`);

//     req.hospitalDatabase = hospital.HospitalDatabase;
//     const decodedToken = jwt.decode(Hospitaltoken);
//     const currentTime = Math.floor(Date.now() / 1000);
//     const expiresIn = decodedToken.exp - currentTime;
//     const expiresInMinutes = Math.floor(expiresIn / 60);
//     console.log(`Token expires in: ${expiresIn} seconds`);

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         Hospitaltoken,
//         expiresInMinutes: `${expiresInMinutes} min`,
//         hospital: {
//           hospitalId: hospital.HospitalID,
//           hospitalDatabase: hospital.HospitalDatabase,
//           hospitalGroupIDR: hospital.HospitalGroupIDR
//         },
//         message: 'Database name found successfully'
//       }
//     });
//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error finding hospital', { error: error.message, executionTime: `${end - start}ms` });

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 1046,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error finding hospital: ' + error.message
//       }
//     });
//   }
// };

// exports.loginUser = async (req, res) => {
//   const start = Date.now();
//   const { Username, Password } = req.body;

//   if (!Username || !Password) {
//     const end = Date.now();
//     logger.error('Username or Password not provided', { executionTime: `${end - start}ms` });

//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 1047,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Username and Password are required'
//       }
//     });
//   }

//   try {
//     const User = require('../models/user')(req.sequelize);
//     console.log('Username:', Username); // Debugging log
//     const user = await User.findOne({ where: { username: Username } });

//     if (!user || !await bcrypt.compare(Password, user.password)) {
//       const end = Date.now();
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 1048,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Invalid username or password'
//         }
//       });
//     }
//     if (user.is_emailVerify !== '1' || user.phoneverify !== '1') {
//       const end = Date.now();
//       return res.status(403).json({
//         meta: {
//           statusCode: 403,
//           errorCode: 1049,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Email or phone not verified. Please verify email and phone.'
//         }
//       });
//     }

//     const AccessToken = jwt.sign(
//       { userId: user.userId,
//         username :user.username,
//         HospitalId :user.hospitalId

//        },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     const decodedToken = jwt.decode(AccessToken);
//     const currentTime = Math.floor(Date.now() / 1000);
//     const expiresIn = decodedToken.exp - currentTime;
//     const expiresInMinutes = Math.floor(expiresIn / 60);
//     console.log(`Token expires in: ${expiresIn} seconds`);

//     const end = Date.now();
//     return res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         AccessToken,
//       expiresInMinutes: `${expiresInMinutes} min`,
//         user: {
//           id: user.userId,
//           username: user.username,
//           email: user.email
//         },
//         message: 'Login successful'
//       }
//     });
//   } catch (error) {
//     const end = Date.now();
//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 1050,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error logging in: ' + error.message
//       }
//     });
//   }
// };

// exports.loginUser = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const { Username, Password } = req.body;

//   if (!Username || !Password) {
//     // const end = Date.now();
//     // logger.error('Username or Password not provided', { executionTime: `${end - start}ms` });
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 958;

//     // Log the warning
//     logger.logWithMeta("warn", `Username or Password not provided${error.message}`, {
//       errorCode,
//       errorMessage: error.message,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers['user-agent'],     // HTTP method
//     });

//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 958,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Username and Password are required'
//       }
//     });
//   }

//   try {
//     const User = require('../models/user')(req.sequelize);
//     console.log('Username:', Username); // Debugging log
//     const user = await User.findOne({ where: { username: Username } });

//     if (!user || !await bcrypt.compare(Password, user.password)) {
//       // const end = Date.now();
//       // logger.error('Invalid username or password', { executionTime: `${end - start}ms` });
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 959;

//       // Log the warning
//       logger.logWithMeta("warn", `Invalid username or password${error.message}`, {
//         errorCode,
//         errorMessage: error.message,
//         executionTime,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl, // API name
//         method: req.method,
//         userAgent: req.headers['user-agent'],     // HTTP method
//       });

//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 959,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Invalid username or password'
//         }
//       });
//     }

//     if (user.is_emailVerify !== '1' || user.phoneverify !== '1') {
//       // const end = Date.now();
//       // logger.error('Email or phone not verified', { executionTime: `${end - start}ms` });
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 960;

//       // Log the warning
//       logger.logWithMeta("warn", `Email or phone not verified${error.message}`, {
//         errorCode,
//         errorMessage: error.message,
//         executionTime,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl, // API name
//         method: req.method,
//         userAgent: req.headers['user-agent'],     // HTTP method
//       });

//       return res.status(403).json({
//         meta: {
//           statusCode: 403,
//           errorCode: 960,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Email or phone not verified. Please verify email and phone.'
//         }
//       });
//     }

//     // Check if the user already has a valid token in Redis
//     const existingToken = await getAsync(user.userId.toString());
//     let AccessToken = existingToken;

//     // If token is not present, generate a new one
//     if (!existingToken) {
//       // Define payload for JWT
//       const payload = {
//         userId: user.userId,
//         username: user.username,
//         HospitalId: user.hospitalId,
//         email: user.email
//       };

//          // Generate AccessToken with 24-hour expiration
//          AccessToken = jwt.sign(
//           payload,
//           process.env.JWT_SECRET,
//           { expiresIn: '24h' }  // 24 hours expiration time
//         );

//         // Store the new token in Redis with an expiration time of 24 hours
//         await setAsync(user.userId.toString(), AccessToken, 'EX', 24 * 60 * 60);  // 24 * 60 * 60 seconds = 24 hours
//       }

//     // Decode the token to verify its content
//     const decodedToken = jwt.decode(AccessToken);

//     console.log("decodedToken.....", decodedToken);

//     // console.log("Payload before signing:", payload);

//     // AccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

//     const currentTime = Math.floor(Date.now() / 1000);
//     const expiresIn = decodedToken.exp - currentTime;
//     const expiresInMinutes = Math.floor(expiresIn / 60);
//     console.log(`Token expires in: ${expiresIn} seconds`);

//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     // Log the warning
//     logger.logWithMeta("warn", `Login successful`, {
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers['user-agent'],    // HTTP method
//     });

//     return res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },

//       data: {
//         AccessToken,
//         expiresInMinutes: `${expiresInMinutes} min`,
//         user: {
//           id: user.userId,
//           username: user.username,
//           email: user.email
//         },
//         message: 'Login successful'
//       }
//     });
//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 961;

//     // Log the warning
//     logger.logWithMeta("warn", `Error logging in: ${error.message}`, {
//       errorCode,
//       errorMessage: error.message,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers['user-agent'], // HTTP method
//     });

//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 961,
//         executionTime,
//       },
//       error: {
//         message: 'Error logging in: ' + error.message,
//       },
//     });
//   }
// };




















// const ENCRYPT_SECRET_KEY2 = process.env.ENCRYPT_SECRET_KEY3;
// exports.createUser = async (req, res) => {
//   const start = Date.now();
//   const { name, username, phone, email, password, empid, usertype } = req.body;
//   const hospitalId = req.hospitalId;
//   const hospitalDatabase = req.hospitalDatabase;

//   try {
//     if (!password) {
//       throw new Error('Password is required');
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a unique token and include the hospitalDatabase in the token metadata
//     const verificationToken = uuidv4();
//     const tokenExpiration = new Date();
//     tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 10);

//     const User = require('../models/user')(req.sequelize);

//     // const encrypteddb = CryptoJS.AES.encrypt(hospitalDatabase, ENCRYPT_SECRET_KEY1).toString();

//     // const encryptedToken = CryptoJS.AES.encrypt(verificationToken, ENCRYPT_SECRET_KEY1).toString();

//     await User.sync();

//     const user = await User.create({
//       username,
//       password: hashedPassword,
//       hospitalId,
//       name,
//       phone,
//       email,
//       empid,
//       usertype,
//       emailtoken: verificationToken,
//       createdBy: hospitalId,
//     });

//     // Construct the verification link with token and database name
//     const verificationLink = `http://localhost:3000/api/v1/hospital/verify/${verificationToken}?db=${hospitalDatabase}`;

//     await sendUserEmail(email, 'Verify Your Email', `Click this link to verify your email: ${verificationLink}`);

//     res.status(201).json({
//       meta: {
//         statusCode: 201,
//         executionTime: `${Date.now() - start}ms`,
//         hospitalDatabase // Include hospitalDatabase in the response
//       },
//       data: { user },
//       message: 'User created successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 928,
//         executionTime: `${Date.now() - start}ms`,
//         hospitalDatabase // Include hospitalDatabase in the response even in case of error
//       },
//       error: { message: 'Error creating user: ' + error.message },
//     });
//   }
// };

// const ENCRYPT_SECRET_KEY2 = process.env.ENCRYPT_SECRET_KEY2 || 'your-secret-key';
// const ENCRYPT_SECRET_KEY1 = process.env.ENCRYPT_SECRET_KEY2;

// exports.createUser = async (req, res) => {
//   const start = Date.now();
//   const { name, username, phone, email, password, empid, usertype } = req.body;
//   const hospitalId = req.hospitalId;
//   const hospitalDatabase = req.hospitalDatabase;

//   try {
//     if (!password) {
//       throw new Error('Password is required');
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a unique token
//     let verificationToken = uuidv4();
//      // Convert to Base64 and remove special characters

//       verificationToken = Buffer.from(verificationToken).toString('base64')
//      .replace(/[+/=]/g, '')  // Remove special characters
//      .replace(/-/g, '')     // Remove any remaining dashes
//      .replace(/\//g, '');

//     // Encrypt the token
//     let encryptedToken = CryptoJS.AES.encrypt(verificationToken, ENCRYPT_SECRET_KEY1).toString('base64');

//     encryptedToken = encryptedToken
//     .replace(/\//g, '')  // Remove slashes (/)
//     .replace(/\+/g, '')  // Remove plus signs (+)
//     .replace(/=/g, '');  // Remove equal signs (=)

//     let encryptedHospitalDatabase = CryptoJS.AES.encrypt(hospitalDatabase, ENCRYPT_SECRET_KEY1).toString('base64');

//     // Remove special characters from the encrypted hospitalDatabase
//     encryptedHospitalDatabase = encryptedHospitalDatabase
//       .replace(/\//g, '')  // Remove slashes (/)
//       .replace(/\+/g, '')  // Remove plus signs (+)
//       .replace(/=/g, '');  // Remove equal signs (=)

//     const User = require('../models/user')(req.sequelize);
//     await User.sync();

//     const user = await User.create({
//       username,
//       password: hashedPassword,
//       hospitalId,
//       name,
//       phone,
//       email,
//       empid,
//       usertype,
//       emailtoken: encryptedToken,
//       createdBy: hospitalId,
//     });

//     // Construct the verification link
//     const verificationLink = `http://localhost:3000/api/v1/hospital/verify/${encryptedToken}?db=${encryptedHospitalDatabase}`;

//     await sendUserEmail(email, 'Verify Your Email', `Click this link to verify your email: ${verificationLink}`);

//     res.status(201).json({
//       meta: {
//         statusCode: 201,
//         executionTime: `${Date.now() - start}ms`,
//         hospitalDatabase
//       },
//       data: { user },
//       message: 'User created successfully. Verification email sent.'
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 928,
//         executionTime: `${Date.now() - start}ms`,
//         hospitalDatabase
//       },
//       error: { message: 'Error creating user: ' + error.message },
//     });
//   }
// };

// exports.createUser = async (req, res) => {
//   const start = Date.now();
//   const { name, username, phone, email, password, empid, usertype } = req.body;
//   const hospitalId = req.hospitalId;
//   const hospitalDatabase = req.hospitalDatabase;

//   try {
//     if (!password) {
//       throw new Error('Password is required');
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a unique token
//     let verificationToken = uuidv4();

//     // Convert the token to Base64 and remove special characters
//     verificationToken = Buffer.from(verificationToken)
//       .toString('base64')
//       .replace(/[+/=]/g, '')  // Remove special characters
//       .replace(/-/g, '')      // Remove dashes
//       .replace(/\//g, '');    // Remove slashes

//     // Encrypt the token

//     const cfg = {
//       mode: CryptoJS.mode.CBC,
//       padding: CryptoJS.pad.Pkcs7
//     };
//      const encryptAES = (hospitalDatabase, ENCRYPT_SECRET_KEY1) => {
//       return CryptoJS.AES.encrypt(hospitalDatabase, ENCRYPT_SECRET_KEY1).toString();
//     };

//     let encryptedDB=encryptAES (hospitalDatabase, ENCRYPT_SECRET_KEY1)

//     encryptedDB = Buffer.from(encryptedDB)
//       .toString('base64')
//       .replace(/[+/=]/g, '')  // Remove special characters
//       .replace(/-/g, '')      // Remove dashes
//       .replace(/\//g, '');    // Remove slashes

//     console.log("encryptedDB...",encryptedDB)

//     let encryptedToken = CryptoJS.AES.encrypt(verificationToken, ENCRYPT_SECRET_KEY1).toString();

//     // let encryptedDB = CryptoJS.AES.encrypt(hospitalDatabase, ENCRYPT_SECRET_KEY1).toString();

//     // console.log("encryptedDB.........",encryptedDB)

//     // Further encode it in Base64 and remove special characters
//     encryptedToken = Buffer.from(encryptedToken)
//       .toString('base64')
//       .replace(/\//g, '')  // Remove slashes (/)
//       .replace(/\+/g, '')  // Remove plus signs (+)
//       .replace(/=/g, '');  // Remove equal signs (=)

//     const User = require('../models/user')(req.sequelize);
//     await User.sync();

//     const user = await User.create({
//       username,
//       password: hashedPassword,
//       hospitalId,
//       name,
//       phone,
//       email,
//       empid,
//       usertype,
//       emailtoken: encryptedToken,
//       createdBy: hospitalId,
//     });

//     // Construct the verification link
//     const verificationLink = `http://localhost:3000/api/v1/hospital/verify/${encryptedToken}?db=${encryptedDB}`;

//     await sendUserEmail(email, 'Verify Your Email', `Click this link to verify your email: ${verificationLink}`);

//     res.status(201).json({
//       meta: {
//         statusCode: 201,
//         executionTime: `${Date.now() - start}ms`,
//         hospitalDatabase
//       },
//       data: { user },
//       message: 'User created successfully. Verification email sent.'
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 928,
//         executionTime: `${Date.now() - start}ms`,
//         hospitalDatabase
//       },
//       error: { message: 'Error creating user: ' + error.message },
//     });
//   }
// };

////without encrpted

// exports.verifyEmail = async (req, res) => {
//   const start = Date.now();
//   const { token } = req.params;
//   const encryptedHospitalDatabase = req.query.db;

//   console.log("Token from URL Params:", token);
//   console.log("Encrypted Database from Query:", encryptedHospitalDatabase);

//   // Decrypt the hospitalDatabase
//   let hospitalDatabase;
//   try {
//     if (!encryptedHospitalDatabase) {
//       throw new Error('No encrypted database name provided');
//     }

//     // Decrypt and convert bytes to string
//     const decryptedDbBytes = CryptoJS.AES.decrypt(encryptedHospitalDatabase, ENCRYPT_SECRET_KEY1);

//     hospitalDatabase = decryptedDbBytes.toString(CryptoJS.enc.Utf8);

//     if (!hospitalDatabase) {
//       throw new Error('Decryption failed or resulted in an empty string');
//     }

//     console.log("Decrypted Database Name:", hospitalDatabase);

//   } catch (error) {
//     console.error('Decryption Error:', error.message);
//     return res.status(400).json({
//       meta: { statusCode: 400, errorCode: 927, executionTime: `${Date.now() - start}ms` },
//       error: { message: 'Database name not provided or could not be decrypted' },
//     });
//   }

//   try {
//     // Initialize Sequelize with the decrypted hospitalDatabase name
//     const sequelize = new Sequelize(
//       hospitalDatabase,
//       process.env.DB_USER,
//       process.env.DB_PASSWORD,
//       { host: process.env.DB_HOST, dialect: process.env.DB_DIALECT }
//     );

//     const User = require('../models/user')(sequelize);

//     // Find the user by the provided email token
//     const user = await User.findOne({ where: { emailtoken: token } });
//     if (!user) {
//       return res.status(400).json({
//         meta: { statusCode: 400, errorCode: 952, executionTime: `${Date.now() - start}ms` },
//         error: { message: 'Invalid or expired verification token' },
//       });
//     }

//     // Update the user's email verification status
//     user.is_emailVerify = true;
//     user.emailtoken = null;
//     await user.save();

//     res.status(200).json({
//       meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
//       data: { message: 'Email verified successfully' },
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 953, executionTime: `${Date.now() - start}ms` },
//       error: { message: 'Error verifying email: ' + error.message },
//     });
//   }
// };
// exports.verifyEmail = async (req, res) => {
//   const start = Date.now();
//   const { token } = req.params;
//   const encryptedHospitalDatabase = req.query.db;

//   console.log("Token from URL Params:", token);
//   console.log("Encrypted Database from Query:", encryptedHospitalDatabase);

//   // Decode the encrypted database name from the query
//   let decodedHospitalDatabase;
//   try {
//     if (!encryptedHospitalDatabase) {
//       throw new Error('No encrypted database name provided');
//     }

//     decodedHospitalDatabase = decodeURIComponent(encryptedHospitalDatabase);
//     console.log("Decoded Database Name:", decodedHospitalDatabase);

//   } catch (error) {
//     console.error('Decoding Error:', error.message);
//     return res.status(400).json({
//       meta: { statusCode: 400, errorCode: 928, executionTime: `${Date.now() - start}ms` },
//       error: { message: 'Failed to decode the database name' },
//     });
//   }

//   // Decrypt the hospitalDatabase
//   let hospitalDatabase;

//   try {
//     // Decrypt and convert bytes to string
//     const decryptedDbBytes = CryptoJS.AES.decrypt(decodedHospitalDatabase, ENCRYPT_SECRET_KEY1);

//     hospitalDatabase = decryptedDbBytes.toString(CryptoJS.enc.Utf8);

//     if (!hospitalDatabase) {
//       throw new Error('Decryption failed or resulted in an empty string');
//     }

//     console.log("Decrypted Database Name:", hospitalDatabase);

//     // Verify the decrypted database name
//     if (hospitalDatabase !== 'expectedDatabaseName') {
//       throw new Error('Database name does not match the expected value');
//     }

//   } catch (error) {
//     console.error('Decryption or Verification Error:', error.message);
//     return res.status(400).json({
//       meta: { statusCode: 400, errorCode: 927, executionTime: `${Date.now() - start}ms` },
//       error: { message: 'Database name not provided, could not be decrypted, or verification failed' },
//     });
//   }

//   try {
//     // Initialize Sequelize with the decrypted hospitalDatabase name
//     const sequelize = new Sequelize(
//       hospitalDatabase,
//       process.env.DB_USER,
//       process.env.DB_PASSWORD,
//       { host: process.env.DB_HOST, dialect: process.env.DB_DIALECT }
//     );

//     const User = require('../models/user')(sequelize);

//     // Find the user by the provided email token
//     const user = await User.findOne({ where: { emailtoken: token } });
//     if (!user) {
//       return res.status(400).json({
//         meta: { statusCode: 400, errorCode: 952, executionTime: `${Date.now() - start}ms` },
//         error: { message: 'Invalid or expired verification token' },
//       });
//     }

//     // Update the user's email verification status
//     user.is_emailVerify = true;
//     user.emailtoken = null;
//     await user.save();

//     res.status(200).json({
//       meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
//       data: { message: 'Email verified successfully' },
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 953, executionTime: `${Date.now() - start}ms` },
//       error: { message: 'Error verifying email: ' + error.message },
//     });
//   }
// };

