const { DataTypes }=require("sequelize");

module.exports=(sequelize)=> {
    const PatientAppointment=sequelize.define(
        "PatientAppointment",{

            appointment_ID:{
                type:DataTypes.INTEGER,
                autoIncrement:true,
                primaryKey: true
            },

            appointment_Code:{
                type:DataTypes.STRING,
                allowNull:false
            },

            bookDate:{
                type:DataTypes.DATE,
                allowNull:false
            },

            appointment_Purpose:{
                type:DataTypes.STRING,
                allowNull:false
            },
            
            is_New_Patient:{
                type:DataTypes.BOOLEAN,
                allowNull:true
            },

            patient_Name:{
                type:DataTypes.STRING,
                allowNull:true
            },

            patient_IDR:{
                type:DataTypes.INTEGER,
                allowNull:false
            },

            employee_IDR:{
                type:DataTypes.INTEGER,
                allowNull:false
            },

            department_IDR:{
                type:DataTypes.INTEGER,
                allowNull:flase
            },  

            appointment_Start_Time:{
                type:DataTypes.DATE,
                allowNull:false
            }, 

            appointment_End_Time:{
                type:DataTypes.DATE,
                allowNull:true
            },

            mode_Of_Booking:{
                type:DataTypes.STRING,
                allowNull:true
            },
            appointment_Book_Reason:{
                type:DataTypes.STRING,
                allowNull:false
            },

            is_Arrived:{
                type:DataTypes.BOOLEAN,
                allowNull:true
            },

            is_canceled:{
                type:DataTypes.BOOLEAN,
                allowNull:false
            },

            appointment_Cancle_Reason:{
                type:DataTypes.STRING,
                allowNull:false
            },

            want_SMS_Reminder:{
                type:DataTypes.BOOLEAN,
                allowNull:true
            },

            want_Email_Reminder:{
                type:DataTypes.BOOLEAN,
                allowNull:true
            },

            want_WhatsAPP_Reminder:{
                type:DataTypes.BOOLEAN,
                allowNull:true
            },

            patient_Contact_Number:{
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                  is: /^[0-9]{10}$/,
                  notEmpty: true 
                }
            },

            service_IDR:{
                type: DataTypes.INTEGER,
                allowNull:false
            },

            isActive: {
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
              bookedBy: {
                type: DataTypes.STRING,
                allowNull: true,
              },
              bookedAt: {
                  type: DataTypes.DATE,
                  defaultValue: DataTypes.NOW,
              },
              createdBy: {
                type: DataTypes.STRING,
                allowNull: true,
              },
              CreatedAt: {
                  type: DataTypes.DATE,
                  defaultValue: DataTypes.NOW,
              },
              updatedBy: {
                type: DataTypes.STRING,
                allowNull: true,
             
              },
              UpdatedAt: {
                  type: DataTypes.DATE,
                  allowNull: true,
              },  

        },
        {
            tablename:'tbl_PatientAppointment',
            timestamp:false
        }
    );
    return PatientAppointment;

}

