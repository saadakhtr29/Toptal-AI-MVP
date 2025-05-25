const User = require("./User");
const Interaction = require("./Interaction");
const CallSession = require("./CallSession");
const Subaccount = require("./Subaccount");

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
  User,
  Interaction,
  CallSession,
  Subaccount,
};
