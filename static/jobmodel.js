const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize'); // Import your Sequelize instance

const Job = sequelize.define('Job', {
    job_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    job_title: DataTypes.STRING,
    email: DataTypes.STRING,
    type: DataTypes.STRING,
    application_form: DataTypes.STRING,
    deadline: DataTypes.DATE,
}, {
    tableName: 'jobs', // Make sure the table name matches your PostgreSQL table name
    timestamps: false, // Set to false if you don't have created_at and updated_at columns
});

module.exports = Job;