const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Interaction extends Model {
    static associate(models) {
      // Define associations here
      Interaction.belongsTo(models.User, { foreignKey: "userId" });
    }
  }

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
        field: "user_id",
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
        field: "start_time",
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "end_time",
      },
    },
    {
      sequelize,
      modelName: "Interaction",
      tableName: "interactions",
      timestamps: true,
      underscored: true,
    }
  );

  return Interaction;
};
