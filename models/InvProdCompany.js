const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const invProductCompany = sequelize.define(
        "invProductCompany",
        {
            InvProductID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            CompanyName: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            CompanyCode: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            Address1: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            Address2: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            City: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            State: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Country: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ZipCode: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Telephone1: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            Telephone2: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            Mobile: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            WhatApp: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            Email: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            Website: {
                type: DataTypes.STRING(250),
                allowNull: false,
            },
            NonActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                
            },
            HospitalIDR: {
                type: DataTypes.INTEGER,
                allowNull: false,
                
            },
            HospitalGroupIDR: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            CreatedBy: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            UpdatedBy: {
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
            },
        },
        {
            tableName: "tblitemcompany",
            timestamps: false,
        }
    );
    return invProductCompany;
};
