const { sequelize } = require("../config/database");
const { logger } = require("../utils/logger");

const runMigrations = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established successfully.");

    // Run migrations
    await sequelize.sync({ alter: true });
    logger.info("Migrations completed successfully.");
  } catch (error) {
    logger.error("Error running migrations:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

runMigrations();
