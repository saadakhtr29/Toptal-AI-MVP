const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CallSession extends Model {
    static associate(models) {
      // Define associations here
      CallSession.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      CallSession.belongsTo(models.Subaccount, {
        foreignKey: "subaccount_id",
        as: "subaccount",
      });
    }
  }

  CallSession.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      callSid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "call_sid",
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "initiated",
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "start_time",
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "end_time",
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "phone_number",
      },
      context: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "user_id",
      },
      subaccountId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "subaccount_id",
      },
    },
    {
      sequelize,
      modelName: "CallSession",
      tableName: "call_sessions",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return CallSession;
};
