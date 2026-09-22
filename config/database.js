const mysql = require("mysql2/promise");
const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",

    logging: console.log
  }
);

const initDB = async () => {
  const rawConnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  await rawConnection.query(
    `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
  );

  await rawConnection.end();
  
  await sequelize.authenticate();

  require("./relations");
  console.log("connected to database");

  // await sequelize.sync({ alter: true });
}

module.exports = {
  sequelize,
  initDB
}