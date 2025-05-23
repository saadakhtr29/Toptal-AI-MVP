class ConversationMemory {
  constructor() {
    this.conversations = new Map();
    this.maxHistoryLength = 10; // Maximum number of messages to keep in history
  }

  // Initialize a new conversation
  initializeConversation(sessionId, context = {}) {
    this.conversations.set(sessionId, {
      history: [],
      context: {
        role: context.role || "recruiter",
        company: context.company || "",
        position: context.position || "",
        skills: context.skills || [],
        startTime: new Date(),
        lastInteraction: new Date(),
        ...context,
      },
    });
  }

  // Add a message to conversation history
  addMessage(sessionId, message, type = "user") {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    conversation.history.push({
      type,
      content: message,
      timestamp: new Date(),
    });

    // Trim history if it exceeds max length
    if (conversation.history.length > this.maxHistoryLength) {
      conversation.history = conversation.history.slice(-this.maxHistoryLength);
    }

    conversation.lastInteraction = new Date();
  }

  // Get conversation history
  getHistory(sessionId) {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    return conversation.history;
  }

  // Get conversation context
  getContext(sessionId) {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    return conversation.context;
  }

  // Update conversation context
  updateContext(sessionId, updates) {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    conversation.context = {
      ...conversation.context,
      ...updates,
      lastInteraction: new Date(),
    };
  }

  // Get conversation summary
  getSummary(sessionId) {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    return {
      sessionId,
      messageCount: conversation.history.length,
      duration: new Date() - conversation.context.startTime,
      lastInteraction: conversation.lastInteraction,
      context: conversation.context,
    };
  }

  // End conversation
  endConversation(sessionId) {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Add end timestamp to context
    conversation.context.endTime = new Date();

    // Return final summary
    const summary = this.getSummary(sessionId);

    // Remove from active conversations
    this.conversations.delete(sessionId);

    return summary;
  }

  // Clean up old conversations (older than 24 hours)
  cleanupOldConversations() {
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

    for (const [sessionId, conversation] of this.conversations.entries()) {
      if (conversation.lastInteraction < oneDayAgo) {
        this.conversations.delete(sessionId);
      }
    }
  }
}

// Export a singleton instance
module.exports = new ConversationMemory();
