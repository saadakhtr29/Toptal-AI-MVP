// In-memory storage for conversation context
const conversations = new Map();

exports.initialize = (callSid) => {
  conversations.set(callSid, {
    history: [],
    startTime: new Date(),
    lastUpdate: new Date(),
  });
};

exports.get = (callSid) => {
  return conversations.get(callSid) || null;
};

exports.update = (callSid, interaction) => {
  const conversation = conversations.get(callSid);
  if (conversation) {
    conversation.history.push(interaction);
    conversation.lastUpdate = new Date();
    conversations.set(callSid, conversation);
  }
};

exports.clear = (callSid) => {
  conversations.delete(callSid);
};

// Clean up old conversations (e.g., older than 24 hours)
setInterval(() => {
  const now = new Date();
  for (const [callSid, conversation] of conversations.entries()) {
    if (now - conversation.lastUpdate > 24 * 60 * 60 * 1000) {
      conversations.delete(callSid);
    }
  }
}, 60 * 60 * 1000); // Run cleanup every hour
