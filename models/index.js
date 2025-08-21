// const { Sequelize, DataTypes,Op } = require("sequelize");

// // Create Sequelize instance with correct DB credentials
// const sequelize = new Sequelize("asad", "root", "root", {
//   host: "localhost",
//   dialect: "mysql",
//   logging: false, // disable SQL query logs, optional
// });

// // Test DB connection
// sequelize.authenticate()
//   .then(() => console.log("Database connected successfully"))
//   .catch(err => console.error("Unable to connect to the database:", err));

// const db = {};
// db.Sequelize = Sequelize;
// db.sequelize = sequelize;
// db.Op = Op; // ✅ Ye ensure karna zaroori hai

// // Import models
// db.Service1 = require("./service1")(sequelize, DataTypes);
// db.Service2 = require("./service2")(sequelize, DataTypes);
// db.Service3 = require("./service3")(sequelize, DataTypes);
// db.ServiceSOR=require("./ServiceSOR")(sequelize, DataTypes)

// // Auto-create tables if they don't exist
// db.sequelize.sync({ force: false })
//   .then(() => console.log("Tables synced successfully"))
//   .catch(err => console.error("Error syncing tables:", err));

// // If needed, you can setup associations here
// // Example: db.Service1.hasMany(db.Service2);

// module.exports = db;
