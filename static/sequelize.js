const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ptjportal', 'postgres', 'password', {
    host: 'localhost',
    dialect: 'postgres',
});

module.exports = sequelize;