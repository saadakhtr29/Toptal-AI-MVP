const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Subaccount extends Model {
    static associate(models) {
      // Define associations here
      Subaccount.belongsTo(models.User, { foreignKey: "userId" });
      Subaccount.hasMany(models.CallSession, { foreignKey: "subaccountId" });
    }
  }

  Subaccount.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      twilio_account_sid: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      twilio_auth_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      settings: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
      },
    },
    {
      sequelize,
      modelName: "Subaccount",
      tableName: "subaccounts",
      timestamps: true,
      underscored: true,
    }
  );

  return Subaccount;
};
