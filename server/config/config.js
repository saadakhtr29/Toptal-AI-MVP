require("dotenv").config();

module.exports = {
  development: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://localhost:5432/toptal_midOffice_ai",
    dialect: "postgres",
  },
  test: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://localhost:5432/toptal_midOffice_ai_test",
    dialect: "postgres",
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
