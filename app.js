const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml'); // Load your YAML file
const hospitalGroupRoutes = require('./routes/hospitalGroupRoutes');
const hospitalRoutes= require('./routes/HospitlRoutes')
const sequelize = require('./database/connection');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const moduleRoutes = require('./routes/hospitalModulesRoutes');
const hospitalUserRidesRoutes = require('./routes/hospitalUserRides');
const submoduleRoutes = require('./routes/submoduleRoutes');
const staffRoutes = require('./routes/staffMasterRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const skillRoutes = require('./routes/skillRoutes');
const designationRoutes = require('./routes/designationRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
// Middleware for parsing JSON bodies
app.use(express.json());
app.use(bodyParser.json()); 

const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));


// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Use hospitalGroupRoutes

app.use('/api/v1/hospital', hospitalGroupRoutes);
app.use('/api/v1/hospital', hospitalRoutes);
app.use('/api/v1/hospital', userRoutes);
app.use('/api/v1/patient/', patientRoutes);
app.use('/api/v1/hospital/module', moduleRoutes);
app.use('/api/v1/hospital', hospitalUserRidesRoutes);
app.use('/api/v1/hospital/submodules', submoduleRoutes);
app.use('/api/v1/hospital/staff', staffRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1', skillRoutes);
app.use('/api/v1', designationRoutes);
app.use('/api/v1/hospital', departmentRoutes);



sequelize.sync({ force: false }) // Set force to true to drop and recreate the table every time the server starts
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => {
    console.error('Unable to create tables:', err);
  });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
