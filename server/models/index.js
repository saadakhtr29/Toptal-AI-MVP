const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");

// Import models
const UserModel = require("./User");
const InteractionModel = require("./Interaction");
const CallSessionModel = require("./CallSession");
const SubaccountModel = require("./Subaccount");

// Initialize models
const User = UserModel(sequelize, Sequelize.DataTypes);
const Interaction = InteractionModel(sequelize, Sequelize.DataTypes);
const CallSession = CallSessionModel(sequelize, Sequelize.DataTypes);
const Subaccount = SubaccountModel(sequelize, Sequelize.DataTypes);

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasMany(Interaction, { foreignKey: "userId" });
  User.hasMany(CallSession, { foreignKey: "userId" });
  User.hasMany(Subaccount, { foreignKey: "userId" });

  // Interaction associations
  Interaction.belongsTo(User, { foreignKey: "userId" });

  // CallSession associations
  CallSession.belongsTo(User, { foreignKey: "userId" });
  CallSession.belongsTo(Subaccount, { foreignKey: "subaccountId" });

  // Subaccount associations
  Subaccount.belongsTo(User, { foreignKey: "userId" });
  Subaccount.hasMany(CallSession, { foreignKey: "subaccountId" });
};

// Initialize associations
defineAssociations();

module.exports = {
  sequelize,
  Sequelize,
  User,
  Interaction,
  CallSession,
  Subaccount,
};
