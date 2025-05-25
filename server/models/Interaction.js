const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Interaction extends Model {}

Interaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM("CALL", "INTERVIEW", "CHAT"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "ACTIVE", "COMPLETED", "FAILED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Interaction",
    tableName: "interactions",
    timestamps: true,
  }
);

module.exports = Interaction;
