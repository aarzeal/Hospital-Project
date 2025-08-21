// const db = require('./models'); // sequelize instance + models

// async function seed() {
//   await db.sequelize.sync({ force: true }); // ensures tables exist

// //   await db.Service2.bulkCreate([
// //     { serviceName: 'Service A', startDate: '2023-01-17 16:22:50', endDate: '2023-01-19 14:22:50', status: 'Completed' },
// //     { serviceName: 'Service B', startDate: '2023-01-18 10:04:33', endDate: '2023-01-21 08:04:33', status: 'Pending' },
// //     { serviceName: 'Service C', startDate: '2023-02-01 09:00:00', endDate: '2023-02-03 18:00:00', status: 'Completed' },
// //     { serviceName: 'Service A', startDate: '2023-01-22 09:00:00', endDate: '2023-01-24 18:00:00', status: 'pending' },
// //     { serviceName: 'Service B', startDate: '2023-01-23 09:00:00', endDate: '2023-01-25 18:00:00', status: 'Completed' },
// //     { serviceName: 'Service C', startDate: '2023-02-02 09:00:00', endDate: '2023-02-26 18:00:00', status: 'Completed' },
// //   ]);

// //    await db.Service3.bulkCreate([
// //     { taskName: "Network Setup", assignedTo: "Team A", priority: "High", startTime: "2025-01-01 09:00:00", endTime: "2025-01-01 17:00:00", remarks: "Completed successfully" },
// //   { taskName: "Server Upgrade", assignedTo: "Team B", priority: "Medium", startTime: "2025-01-02 10:00:00", endTime: "2025-01-02 16:00:00", remarks: "Pending approval" },
// //   { taskName: "Security Audit", assignedTo: "Team C", priority: "High", startTime: "2025-01-03 09:30:00", endTime: "2025-01-03 15:30:00", remarks: "Requires review" },
// //   { taskName: "Software Installation", assignedTo: "Team D", priority: "Low", startTime: "2025-01-04 08:00:00", endTime: "2025-01-04 12:00:00", remarks: "Completed" },
// //   { taskName: "Backup Maintenance", assignedTo: "Team E", priority: "Medium", startTime: "2025-01-05 09:00:00", endTime: "2025-01-05 14:00:00", remarks: "Delayed due to network" }
// //   ]);

// //    await db.Service1.bulkCreate([
// //     { serviceName: "Service A", startDate: "2025-01-01", endDate: "2025-01-02", status: "Completed" },
// //     { serviceName: "Service B", startDate: "2025-01-03", endDate: "2025-01-04", status: "Pending" },
// //     // aur jitna data chahiye
// //   ]);

//      await db.ServiceSOR.bulkCreate([
//     // aur jitna data chahiye


//     {
//     serviceRate: 1000,
//     serviceIDR: 200,
//     firstEmergancyRate: 1200,
//     secondEmergancyRate: 1500,
//     classIDR: 1,
//     isNotApplicable: false,
//     fromDate: new Date('2025-01-01'),
//     toDate: new Date('2025-12-31'),
//     isEffectiveNow: true,
//     versionNumber: "v1.0",
//     isCashPriceList: true,
//     hospital_IDR: 1,
//     hospitalGroup_IDR: 1,
//     createdBy: "Admin",
//     updatedBy: "Admin",
//     Non_Active: false,
//     UpdatedAt: new Date(),
//     CreatedAt: new Date()
//   },
//   {
//     serviceRate: 1500,
//     serviceIDR: 300,
//     firstEmergancyRate: 1700,
//     secondEmergancyRate: 2000,
//     classIDR: 2,
//     isNotApplicable: false,
//     fromDate: new Date('2025-01-01'),
//     toDate: new Date('2025-12-31'),
//     isEffectiveNow: true,
//     versionNumber: "v1.1",
//     isCashPriceList: false,
//     hospital_IDR: 2,
//     hospitalGroup_IDR: 1,
//     createdBy: "Admin",
//     updatedBy: "Admin",
//     Non_Active: false,
//     UpdatedAt: new Date(),
//     CreatedAt: new Date()
//   },
//   {
//     serviceRate: 2000,
//     serviceIDR: 400,
//     firstEmergancyRate: 2200,
//     secondEmergancyRate: 2500,
//     classIDR: 3,
//     isNotApplicable: false,
//     fromDate: new Date('2025-01-01'),
//     toDate: new Date('2025-12-31'),
//     isEffectiveNow: true,
//     versionNumber: "v1.2",
//     isCashPriceList: true,
//     hospital_IDR: 3,
//     hospitalGroup_IDR: 2,
//     createdBy: "Admin",
//     updatedBy: "Admin",
//     Non_Active: false,
//     UpdatedAt: new Date(),
//     CreatedAt: new Date()
//   }
//   ]);

//   console.log('Data inserted successfully!');
//   process.exit();
// }



// seed();


const sequelize = require('./database/connection'); // your connected instance
const ServiceSOR = require('./models/ServiceSOR'); // direct model import

async function seed() {
  try {
    // Sync table, force: true drops & recreates table
    await sequelize.sync({ force: true });
    console.log('Tables synced successfully');

    // Insert ServiceSOR sample data
    await ServiceSOR.bulkCreate([
      {
        serviceRate: 1000,
        serviceIDR: 200,
        firstEmergancyRate: 1200,
        secondEmergancyRate: 1500,
        classIDR: 1,
        isNotApplicable: false,
        fromDate: new Date('2025-01-01'),
        toDate: new Date('2025-12-29'),
        isEffectiveNow: true,
        versionNumber: "v1.0",
        isCashPriceList: true,
        hospital_IDR: 1,
        hospitalGroup_IDR: 1,
        createdBy: "Admin",
        updatedBy: "Admin",
        Non_Active: false,
        UpdatedAt: new Date(),
        CreatedAt: new Date()
      },
      {
        serviceRate: 1500,
        serviceIDR: 300,
        firstEmergancyRate: 1700,
        secondEmergancyRate: 2000,
        classIDR: 2,
        isNotApplicable: false,
        fromDate: new Date('2025-01-02'),
        toDate: new Date('2025-12-30'),
        isEffectiveNow: true,
        versionNumber: "v1.1",
        isCashPriceList: false,
        hospital_IDR: 2,
        hospitalGroup_IDR: 1,
        createdBy: "Admin",
        updatedBy: "Admin",
        Non_Active: false,
        UpdatedAt: new Date(),
        CreatedAt: new Date()
      },
      {
        serviceRate: 2000,
        serviceIDR: 400,
        firstEmergancyRate: 2200,
        secondEmergancyRate: 2500,
        classIDR: 3,
        isNotApplicable: false,
        fromDate: new Date('2025-01-03'),
        toDate: new Date('2025-12-31'),
        isEffectiveNow: true,
        versionNumber: "v1.2",
        isCashPriceList: true,
        hospital_IDR: 3,
        hospitalGroup_IDR: 2,
        createdBy: "Admin",
        updatedBy: "Admin",
        Non_Active: false,
        UpdatedAt: new Date(),
        CreatedAt: new Date()
      }
    ]);

    console.log('Data inserted successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
