// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   const User = sequelize.define('User', {
//     userId: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     phone: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     username: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     password: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     hospitalId: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//     },
//     status: {
//       type: DataTypes.STRING,
   
//     },
//     // empid: {
//     //   type: DataTypes.STRING,
//     //   allowNull: false,
//     //   references: {
//     //     model: 'empMaster', // Table name of the Module model
//     //     key: 'empid'
//     //   }
//     // },
//     is_emailVerify: {
//       type: DataTypes.STRING,
      
//     },
//     usertype: {
//       type: DataTypes.STRING,
      
//     },
//     lockuser: {
//       type: DataTypes.STRING,

//     },
//     phoneverify: {
//       type: DataTypes.STRING,
     
//     },
//   }, {
//     tableName: 'users',
//     timestamps: false
//   });

//   return User;
// };
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name is required'
        },
        len: {
          args: [1, 255],
          msg: 'Name must be between 1 and 255 characters'
        }
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Phone is required'
        },
        len: {
          args: [10, 15],
          msg: 'Phone must be between 10 and 15 characters'
        },
        isNumeric: {
          msg: 'Phone must contain only numbers'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true, // Set to true if email is not required
      validate: {
        isEmail: {
          msg: 'Invalid email address'
        },
        len: {
          args: [1, 255],
          msg: 'Email must be between 1 and 255 characters'
        }
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Username is already in use'
      },
      validate: {
        notEmpty: {
          msg: 'Username is required'
        },
        len: {
          args: [1, 255],
          msg: 'Username must be between 1 and 255 characters'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password is required'
        },
        len: {
          args: [8, 100],
          msg: 'Password must be between 8 and 100 characters'
        }
      }
    },
    hospitalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Hospital ID is required'
        }
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true // Adjust allowNull as per your requirements
    },

    ///after add the employee master then will remove the commnetout
    //    empid: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   references: {
    //     model: 'empMaster', // Table name of the Module model
    //     key: 'empid'
    //   }
    // },
    is_emailVerify: {
      type: DataTypes.STRING,
      allowNull: true ,// Adjust allowNull as per your requirements
      defaultValue: false
    },
    usertype: {
      type: DataTypes.STRING,
      allowNull: true // Adjust allowNull as per your requirements
    },
    lockuser: {
      type: DataTypes.STRING,
      allowNull: true // Adjust allowNull as per your requirements
    },
    phoneverify: {
      type: DataTypes.STRING,
      allowNull: true // Adjust allowNull as per your requirements
    },
    otp: {
      type: DataTypes.STRING,
      
    },
    emailtoken: {
      type: DataTypes.STRING,
      
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'users',
    timestamps: false
  });

  return User;
};
