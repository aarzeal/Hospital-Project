// logger.js// logger.js

// const winston = require('winston');

// const logger = winston.createLogger({
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: 'error.log', level: 'error' }), // Log errors to error.log file
//     new winston.transports.File({ filename: 'combined.log' }) // Log all messages to combined.log file
//   ],
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json()
//   )
// });

// module.exports = logger;






// const winston = require('winston');
// const mongoose = require('mongoose');

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/logs', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// // Define a schema for logs
// const logSchema = new mongoose.Schema({
//   level: String,
//   message: String,
//   timestamp: { type: Date, default: Date.now },
//   meta: mongoose.Schema.Types.Mixed, // To store additional data (e.g., stack trace)
// });

// // Create a model for logs
// const Log = mongoose.model('Log', logSchema);

// // Custom MongoDB transport
// class MongoDBTransport extends winston.Transport {
//   async log(info, callback) {
//     setImmediate(() => this.emit('logged', info));

//     try {
//       // Save log entry to MongoDB using async/await
//       const logEntry = new Log({
//         level: info.level,
//         message: info.message,
//         meta: info.meta || {},
//       });

//       await logEntry.save();  // Use async/await instead of callback
//       callback();
//     } catch (err) {
//       console.error('Error saving log to MongoDB:', err);
//       callback(err);
//     }
//   }
// }

// // Create Winston logger instance
// const logger = winston.createLogger({
//   level: 'info', // Log everything above 'info' level
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   transports: [
//     new winston.transports.Console(),   // Log to console
//     new MongoDBTransport(),             // Log to MongoDB
//   ],
// });

// module.exports = logger;












// const winston = require('winston');
// const mongoose = require('mongoose');

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/logs', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// // Define a schema for logs
// const logSchema = new mongoose.Schema({
//   level: String,
//   message: String,
//   timestamp: { type: Date, default: Date.now },
//   meta: mongoose.Schema.Types.Mixed, // To store additional data (e.g., stack trace)
//   errorCode: Number,                // Field to store error code
//   hospitalId: String,               // Field to store hospital ID
// });

// // Create a model for logs
// const Log = mongoose.model('Log', logSchema);

// // Custom MongoDB transport
// class MongoDBTransport extends winston.Transport {
//   async log(info, callback) {
//     setImmediate(() => this.emit('logged', info));

//     try {
//       // Save log entry to MongoDB using async/await
//       const logEntry = new Log({
//         level: info.level,
//         message: info.message,
//         meta: info.meta || {},
//         errorCode: info.errorCode,  // Include errorCode
//         hospitalId: info.hospitalId, // Include hospitalId
//       });

//       await logEntry.save();  // Use async/await instead of callback
//       callback();
//     } catch (err) {
//       console.error('Error saving log to MongoDB:', err);
//       callback(err);
//     }
//   }
// }

// // Create Winston logger instance
// const logger = winston.createLogger({
//   level: 'info', // Log everything above 'info' level
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   transports: [
//     new winston.transports.Console(),   // Log to console
//     new MongoDBTransport(),              // Log to MongoDB
//   ],
// });

// // Log function to include errorCode and hospitalId
// logger.logWithMeta = (level, message, { errorCode, hospitalId, ...meta } = {}) => {
//   logger.log({
//     level,
//     message,
//     meta,       // Pass any additional metadata
//     errorCode,  // Include error code in log
//     hospitalId, // Include hospital ID in log
//   });
// };

// module.exports = logger;

//////  start craete new table after 100 entrys 

// const winston = require('winston');
// const mongoose = require('mongoose');

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/logs', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// // Custom MongoDB transport
// class MongoDBTransport extends winston.Transport {
//   constructor() {
//     super();
//     this.currentCollectionName = 'logs_2'; // Default collection name
//     this.logCount = 0; // Initialize log count
//     this.models = {}; // Store models to avoid redefinition
//   }

//   // Function to get or create a model for the given collection name
//   getModel(name) {
//     if (!this.models[name]) {
//       // If the model doesn't exist, create it
//       const logSchema = new mongoose.Schema({
//         level: String,
//         message: String,
//         timestamp: { type: Date, default: Date.now },
//         meta: mongoose.Schema.Types.Mixed,
//         errorCode: Number,
//         hospitalId: String,
//       });

//       this.models[name] = mongoose.model(name, logSchema);
//     }
//     return this.models[name];
//   }

//   async log(info, callback) {
//     setImmediate(() => this.emit('logged', info));

//     try {
//       // Get the appropriate model for the current collection
//       const Log = this.getModel(this.currentCollectionName);

//       // Create a new log entry
//       const logEntry = new Log({
//         level: info.level,
//         message: info.message,
//         timestamp: new Date(),
//         meta: info.meta || {},
//         errorCode: info.errorCode,  // Include errorCode
//         hospitalId: info.hospitalId, // Include hospitalId
//       });

//       await logEntry.save(); // Save the log entry to the current collection

//       this.logCount++; // Increment log count

//       // Check if we need to switch collections
//       if (this.logCount >= 100) {
//         this.logCount = 0; // Reset count
//         this.currentCollectionName = `logs_${Math.floor(Date.now() / 1000)}`; // Update collection name with a timestamp
//       }

//       callback();
//     } catch (err) {
//       console.error('Error saving log to MongoDB:', err);
//       callback(err);
//     }
//   }
// }

// // Create Winston logger instance
// const logger = winston.createLogger({
//   level: 'info', // Log everything above 'info' level
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   transports: [
//     new winston.transports.Console(),   // Log to console
//     new MongoDBTransport(),              // Log to MongoDB
//   ],
// });

// // Log function to include errorCode and hospitalId
// logger.logWithMeta = (level, message, { errorCode, hospitalId, ...meta } = {}) => {
//   logger.log({
//     level,
//     message,
//     meta,       // Pass any additional metadata
//     errorCode,  // Include error code in log
//     hospitalId, // Include hospital ID in log
//   });
// };

// module.exports = logger;

//////  end craete new table after 100 entrys 



//////  start craete new table days wise
const winston = require('winston');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); 
const crypto = require('crypto');

require('winston-mongodb');




require('winston-mongodb');

// Connect to MongoDB
// const mongoURI = 'mongodb://localhost:27017/logs';
const mongoURI = 'mongodb+srv://Admin:Pass123456@hospitallogger.xlufh.mongodb.net/logger';

async function connectToMongoDB() {
    try {
        await mongoose.connect(mongoURI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // serverSelectionTimeoutMS: 60000, // 60 seconds
            // socketTimeoutMS: 120000 // 2 minutes
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

connectToMongoDB();

// Custom MongoDB transport
class MongoDBTransport extends winston.Transport {
    constructor() {
        super();
        this.currentCollectionName = this.getCollectionNameByDate();
        this.models = {};
    }

    getModel(name) {
        if (!this.models[name]) {
            const logSchema = new mongoose.Schema({
                level: String,
                message: String,
                timestamp: { type: Date, default: Date.now },
                meta: mongoose.Schema.Types.Mixed,
                errorCode: Number,
                hospitalId: String,
                logId: String,
                apiName: String,
                method: String,
            });

            this.models[name] = mongoose.model(name, logSchema);
        }
        return this.models[name];
    }

    getCollectionNameByDate() {
        const today = new Date();
        return `logs_${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
    }

    async log(info, callback) {
        setImmediate(() => this.emit('logged', info));

        try {
            const currentCollectionName = this.getCollectionNameByDate();
            if (this.currentCollectionName !== currentCollectionName) {
                this.currentCollectionName = currentCollectionName;
            }

            const Log = this.getModel(this.currentCollectionName);

            const logEntry = new Log({
                level: info.level,
                message: info.message,
                timestamp: new Date(),
                meta: info.meta || {},
                errorCode: info.errorCode,
                hospitalId: info.hospitalId,
                apiName: info.apiName,
                method: info.method
            });

            await logEntry.save();
            callback();
        } catch (err) {
            console.error('Error saving log to MongoDB:', err);
            callback(err);
        }
    }
}

// Create Winston logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new MongoDBTransport(),
    ],
});

// Log function with errorCode and hospitalId
logger.logWithMeta = (level, message, { errorCode, hospitalId, ...meta } = {}) => {
    logger.log({
        level,
        message,
        meta,
        errorCode,
        hospitalId,
    });
};

module.exports = logger;














// // Connect to MongoDB
// const mongoURI = 'mongodb+srv://Admin:Pass@123@hospitallogger.ul1su.mongodb.net/logs?retryWrites=true&w=majority';

// async function testConnection() {
//   try {
//     await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 30000 });
//     console.log('Connected to MongoDB');
    
//     // Optionally perform a simple operation
//     await mongoose.connection.db.admin().command({ ping: 1 });
//     console.log('Ping successful');
    
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//   } finally {
//     mongoose.connection.close(); // Close the connection after the test
//   }
// }

// testConnection();
// mongoose.connect(mongoURI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 60000, // 60 seconds
//   socketTimeoutMS: 120000 // 2 minutes
// })

//   .then(() => {



//     console.log('Connected to MongoDB');
//   })
//   .catch(err => {
//     console.error('MongoDB connection error:', err);
//   });


// // Custom MongoDB transport
// class MongoDBTransport extends winston.Transport {
//   constructor() {
//     super();
//     this.currentCollectionName = this.getCollectionNameByDate(); // Initialize collection based on the current date
//     this.models = {}; // Store models to avoid redefinition
//   }

//   // Function to get or create a model for the given collection name
//   getModel(name) {
//     if (!this.models[name]) {
//       // If the model doesn't exist, create it
//       const logSchema = new mongoose.Schema({
//         level: String,
//         message: String,
//         timestamp: { type: Date, default: Date.now },
//         meta: mongoose.Schema.Types.Mixed,
//         errorCode: Number,
//         hospitalId: String,
//         logId: String,
//         apiName: String, // Include apiName in the schema
//         method: String,   // Include method in the schema
//       });

//       this.models[name] = mongoose.model(name, logSchema);
//     }
//     return this.models[name];
//   }

//   // Function to get collection name based on the current date
//   getCollectionNameByDate() {
//     const today = new Date();
//     const datePart = `${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`; // Format: YYYY_MM_DD
//     return `logs_${datePart}`;
//   }
  

//   async log(info, callback) {
//     setImmediate(() => this.emit('logged', info));

//     try {
//       // Update the collection name daily
//       const currentCollectionName = this.getCollectionNameByDate();
//       if (this.currentCollectionName !== currentCollectionName) {
//         this.currentCollectionName = currentCollectionName;
//       }

//       // Get the appropriate model for the current collection
//       const Log = this.getModel(this.currentCollectionName);

//     //   function generateLogId() {
//     //     return crypto.randomBytes(16).toString('hex'); // Generates 32 hex characters (16 bytes)
//     // }
//       // const logId = generateLogId(); // Generate a unique log ID
//       // Create a new log entry
//       const logEntry = new Log({
//         level: info.level,
//         message: info.message,
//         timestamp: new Date(),
//         meta: info.meta || {},
//         errorCode: info.errorCode,  // Include errorCode
//         hospitalId: info.hospitalId, // Include hospitalId
//         // logId,
//         apiName: info.apiName,        // Log the API name
//         method: info.method  
//       });

//       await logEntry.save(); // Save the log entry to the current collection
//       callback();
//     } catch (err) {
//       console.error('Error saving log to MongoDB:', err);
//       callback(err);
//     }
//   }
// }

// // Create Winston logger instance
// const logger = winston.createLogger({
//   level: 'info', // Log everything above 'info' level
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   transports: [
//     new winston.transports.Console(),   // Log to console
//     new MongoDBTransport(),             // Log to MongoDB
//   ],
// });
// // const apiName = req.originalUrl; // This gets the original URL of the request
// // const method = req.method; 
// // Log function to include errorCode and hospitalId
// logger.logWithMeta = (level, message, { errorCode, hospitalId, ...meta } = {}) => {
//   logger.log({
//     level,
//     message,
//     meta,
//     errorCode,
//     hospitalId,
//     // apiName: meta.apiName, // Pass apiName from meta
//     // method: meta.method     // Pass method from meta
//   });
// };

// module.exports = logger;

//////  end craete new table days wise