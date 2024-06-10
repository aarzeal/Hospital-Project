const express = require('express');
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
// Middleware for parsing JSON bodies
app.use(express.json());

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Use hospitalGroupRoutes

app.use('/api/v1/hospital', hospitalGroupRoutes);
app.use('/api/v1/hospital', hospitalRoutes);
app.use('/api/v1/hospital', userRoutes);
app.use('/api/v1/hospital/patients', patientRoutes);
app.use('/api/v1/hospital/module', moduleRoutes);
app.use('/api/v1/hospital', hospitalUserRidesRoutes);
app.use('/api/v1/hospital/submodules', submoduleRoutes);


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
