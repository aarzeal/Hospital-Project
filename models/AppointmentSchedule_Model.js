const {DataTypes}= require("sequelize");
module.exports = (Sequelize) =>{
    const AppointmentSchedule= Sequelize.define('AppointmentSchedule',{

        AppointmentSchedule_Id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true,
        },

        Employee_IDR:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },

        Day:{
            type:DataTypes.INTEGER,
            allowNull:true,
        },

        Slot1:{
            type:DataTypes.TIME,
            allowNull:true,
        },

        Slot2:{
            type:DataTypes.TIME,
            allowNull:true,
        },

        Slot1_StartTime:{
            type:DataTypes.DATE,
            allowNull:true,
        },

        Slot1_EndTime:{
            type:DataTypes.DATE,
            allowNull:true,
        },

        Slot2_StartTime:{
            type:DataTypes.DATE,
            allowNull:true,
        },

        Slot2_EndTime:{
            type:DataTypes.DATE,
            allowNull:true,
        },

        Duration:{
            type:DataTypes.INTEGER,
            allowNull:true,
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
          }
    },
{
    tableName: 'tbl_AppointmentSchedule',
    timestamps:false
});
return AppointmentSchedule;
};