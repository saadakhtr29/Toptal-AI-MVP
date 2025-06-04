"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("call_sessions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      call_sid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "initiated",
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      context: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      subaccount_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "subaccounts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add indexes
    await queryInterface.addIndex("call_sessions", ["call_sid"]);
    await queryInterface.addIndex("call_sessions", ["status"]);
    await queryInterface.addIndex("call_sessions", ["user_id"]);
    await queryInterface.addIndex("call_sessions", ["subaccount_id"]);
    await queryInterface.addIndex("call_sessions", ["start_time"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("call_sessions");
  },
};
