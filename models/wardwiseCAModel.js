
// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   const Wwca = sequelize.define(
//     "Wwca", {
//         Wwca_ID: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     wardIDR: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     typeEnum: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     typeIDR: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },
//     costAddRate: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },
//     fromdate: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     todate: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     isActive: {
//       type: DataTypes.BOOLEAN,
//       allowNull: true,
//     },
//     isCurrectRate: {
//       type: DataTypes.TIME,
//       allowNull: true,
//     },



//    hospital_IDR: {
//       type: DataTypes.INTEGER,
//       allowNull: false,

//     },
//     hospitalGroup_IDR: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },

//     createdBy: {
//       type: DataTypes.STRING,
//       allowNull: true,

//     },
//     updatedBy: {
//       type: DataTypes.STRING,
//       allowNull: true,

//     },

//     UpdatedAt: {
//         type: DataTypes.DATE,
//         allowNull: true,
//     },
//     CreatedAt: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//     },


//   }, {
//     tableName: 'tbl_Wwca',
//     timestamps: false
//   });

//   return Wwca;
// };

const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
  const Wwca = sequelize.define(
    "Wwca", {
    Wwca_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    wardIDR: { //wardidr
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    typeEnum: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    serviceIDR: { //service idr
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    costAddRate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fromdate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    todate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    isCurrectRate: { //boolean
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    hospital_IDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hospitalGroup_IDR: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdBy: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'tbl_Wwca',
    timestamps: false
  }
  );
  return Wwca;
};