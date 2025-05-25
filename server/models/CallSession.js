const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class CallSession extends Model {}

CallSession.init(
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
    subaccountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "subaccounts",
        key: "id",
      },
    },
    callSid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("INITIATED", "IN_PROGRESS", "COMPLETED", "FAILED"),
      allowNull: false,
      defaultValue: "INITIATED",
    },
    direction: {
      type: DataTypes.ENUM("INBOUND", "OUTBOUND"),
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    recordingUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "CallSession",
    tableName: "call_sessions",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["subaccountId"],
      },
      {
        fields: ["callSid"],
      },
      {
        fields: ["startTime"],
      },
    ],
  }
);

module.exports = CallSession;
