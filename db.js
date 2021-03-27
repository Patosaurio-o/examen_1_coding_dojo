const Sequelize = require('sequelize');

const sql = new Sequelize('triviaGameDB', 'root', 'MySQL1234', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sql;