const { Sequelize } = require("sequelize");
require("dotenv").config();

const dbUrl =
  process.env.DATABASE_URL || "postgresql://localhost:5432/toptal_midOffice_ai";

const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  logging: false,
});

module.exports = sequelize;
