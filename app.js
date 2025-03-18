const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml'); // Load your YAML file
const hospitalGroupRoutes = require('./routes/hospitalGroupRoutes');
const hospitalRoutes = require('./routes/HospitlRoutes')
const sequelize = require('./database/connection');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const moduleRoutes = require('./routes/hospitalModulesRoutes');
const hospitalUserRidesRoutes = require('./routes/hospitalUserRights');
const submoduleRoutes = require('./routes/submoduleRoutes');
const staffRoutes = require('./routes/staffMasterRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const skillRoutes = require('./routes/skillRoutes');
const designationRoutes = require('./routes/designationRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const empCategoryRoutes = require('./routes/empCategoryRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const countApiLogger = require('./Middleware/countApiLogger');
const job = require('./Middleware/sendEmailAuto');
const { sendEmail } = require('./Middleware/sendEmailEventbase');
const locationRoutes = require('./routes/CountryStateCityroute');
const translationsRoutes = require('./routes/translationsRoutes');
const apisRatesRoutes = require('./routes/apisRatesRoutes');
const ApisListRoutes = require("./routes/ApisListRoutes")
const CurrencyRoutes = require("./routes/currencyRoutes")
const logRoutes = require('./routes/logRoutes');
const roomRoutes = require("./routes/MRDRoomRoutes");
const masterSubRoutes = require("./routes/MasterSubModulesRoute");
const masterRoutes = require("./routes/MasterModuleRoutes");
const accLedgerRoutes = require("./routes/accLedgerRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const serviceCategory = require("./routes/serviceCategoryRoutes");
const Tax = require("./routes/Tax_Routes");
const Tax_Deatils = require("./routes/Tax_details_routes");
const Item = require("./routes/Item_Routes");
const ItemMap = require("./routes/Itom_TaxMap_routes");
const ServicePriceList = require("./routes/Service_PriceList_Routes");
const Financial_Year = require("./routes/Financial_Year_Routes");
const Fin_Year_Details = require("./routes/fin-Details-Routes");
const Fin_group = require("./routes/Fin-group");
const Billing_Class = require("./routes/Billing_Routes");
const unit = require("./routes/Unit_Routes");
const item_category = require("./routes/item_category_Routes");
const item_group = require("./routes/itemGroup_routes");
const itemContent = require("./routes/itemContentRoutes.js")
const itemCompany = require("./routes/InvProdCompanyRoute.js")
const Supplier = require("./routes/SupplierRoute.js")










const multer = require('multer');
const cors = require('cors');
// Middleware for parsing JSON bodies
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // specify the destination directory
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname); // specify the file name
//   }
// });

// const upload = multer({ storage: storage });

// const upload = multer({ dest: 'uploads/' });


const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(countApiLogger);
app.use(cors());
app.set('trust proxy', true);


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
app.use('/api/v1/', empCategoryRoutes);
app.use('/api/v1/employee', employeeRoutes);
app.use('/api/v1', hospitalGroupRoutes);
app.use('/api/v1', apisRatesRoutes);
app.use('/api/v1', ApisListRoutes)
app.use('/api/v1', CurrencyRoutes)
app.use('/api/v1', logRoutes);

app.use('/api/v1/location', locationRoutes);
app.use('/api/v1', translationsRoutes);
app.use('/api/v1/master-submodule', masterSubRoutes);
app.use('/api/v1/master-module', masterRoutes);
app.use('/api/v1/accLedger', accLedgerRoutes);
app.use('/api/v1/service', serviceRoutes);
app.use('/api/v1/serviceCategory', serviceCategory);
app.use('/api/v1/tax', Tax);
app.use('/api/v1/tax-deatils', Tax_Deatils);
app.use('/api/v1/item', Item);
app.use('/api/v1/itemMap', ItemMap);
app.use('/api/v1/servicePriceList', ServicePriceList);
app.use('/api/v1/Financial-year', Financial_Year);
app.use('/api/v1/fin-details', Fin_Year_Details);
app.use('/api/v1/fin-group', Fin_group);
app.use('/api/v1/billing_Class', Billing_Class);
app.use('/api/v1/unit', unit);
app.use('/api/v1/item-category', item_category);
app.use('/api/v1/itemgroup', item_group);
app.use('/api/v1/item-content', itemContent);
app.use('/api/v1/item-company', itemCompany);
app.use('/api/v1/supplier', Supplier);



sendEmail();

app.use(roomRoutes);


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
