const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map of client connections
    this.rooms = new Map(); // Map of room subscriptions
  }

  // Initialize WebSocket server
  initialize(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on("connection", async (ws, req) => {
      try {
        // Authenticate connection
        const token = this.extractToken(req);
        if (!token) {
          ws.close(1008, "Authentication required");
          return;
        }

        const user = await this.verifyToken(token);
        if (!user) {
          ws.close(1008, "Invalid token");
          return;
        }

        // Generate client ID and store connection
        const clientId = uuidv4();
        this.clients.set(clientId, {
          ws,
          userId: user.uid,
          role: user.role,
          subscriptions: new Set(),
        });

        // Send connection confirmation
        this.sendToClient(clientId, {
          type: "connection_established",
          clientId,
          user: {
            uid: user.uid,
            role: user.role,
          },
        });

        // Handle messages
        ws.on("message", (message) => {
          try {
            const data = JSON.parse(message);
            this.handleMessage(clientId, data);
          } catch (error) {
            console.error("WebSocket message error:", error);
            this.sendError(clientId, "Invalid message format");
          }
        });

        // Handle disconnection
        ws.on("close", () => {
          this.handleDisconnect(clientId);
        });
      } catch (error) {
        console.error("WebSocket connection error:", error);
        ws.close(1011, "Internal server error");
      }
    });
  }

  // Extract token from request
  extractToken(req) {
    const url = new URL(req.url, "ws://localhost");
    return url.searchParams.get("token");
  }

  // Verify JWT token
  async verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Handle incoming messages
  handleMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (data.type) {
      case "subscribe":
        this.handleSubscribe(clientId, data.room);
        break;
      case "unsubscribe":
        this.handleUnsubscribe(clientId, data.room);
        break;
      case "interview_update":
        this.handleInterviewUpdate(clientId, data);
        break;
      case "call_update":
        this.handleCallUpdate(clientId, data);
        break;
      case "voice_agent_message":
        this.handleVoiceAgentMessage(clientId, data);
        break;
      default:
        this.sendError(clientId, "Unknown message type");
    }
  }

  // Handle room subscription
  handleSubscribe(clientId, room) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }

    this.rooms.get(room).add(clientId);
    client.subscriptions.add(room);

    this.sendToClient(clientId, {
      type: "subscription_confirmed",
      room,
    });
  }

  // Handle room unsubscription
  handleUnsubscribe(clientId, room) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(clientId);
    }

    client.subscriptions.delete(room);

    this.sendToClient(clientId, {
      type: "unsubscription_confirmed",
      room,
    });
  }

  // Handle interview updates
  handleInterviewUpdate(clientId, data) {
    const { interviewId, update } = data;
    const room = `interview:${interviewId}`;

    this.broadcastToRoom(room, {
      type: "interview_update",
      interviewId,
      update,
      timestamp: Date.now(),
    });
  }

  // Handle call updates
  handleCallUpdate(clientId, data) {
    const { callId, status, update } = data;
    const room = `call:${callId}`;

    this.broadcastToRoom(room, {
      type: "call_update",
      callId,
      status,
      update,
      timestamp: Date.now(),
    });
  }

  // Handle voice agent messages
  handleVoiceAgentMessage(clientId, data) {
    const { sessionId, message } = data;
    const room = `voice_agent:${sessionId}`;

    this.broadcastToRoom(room, {
      type: "voice_agent_message",
      sessionId,
      message,
      timestamp: Date.now(),
    });
  }

  // Handle client disconnection
  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from all subscribed rooms
    client.subscriptions.forEach((room) => {
      if (this.rooms.has(room)) {
        this.rooms.get(room).delete(clientId);
      }
    });

    // Remove client
    this.clients.delete(clientId);
  }

  // Broadcast message to room
  broadcastToRoom(room, message) {
    if (!this.rooms.has(room)) return;

    const clients = this.rooms.get(room);
    clients.forEach((clientId) => {
      this.sendToClient(clientId, message);
    });
  }

  // Send message to specific client
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  // Send error to client
  sendError(clientId, error) {
    this.sendToClient(clientId, {
      type: "error",
      error,
      timestamp: Date.now(),
    });
  }

  // Close all connections
  close() {
    if (this.wss) {
      this.wss.close();
    }
  }
}

module.exports = new WebSocketService();
