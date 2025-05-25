const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Subaccount extends Model {}

Subaccount.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE", "SUSPENDED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "Subaccount",
    tableName: "subaccounts",
    timestamps: true,
  }
);

module.exports = Subaccount;
