const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const streamProcessor = require("./streamProcessor");

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map of client connections
    this.rooms = new Map(); // Map of room subscriptions
    this.streamContexts = new Map(); // Map of stream contexts
  }

  // Get client by ID
  getClient(clientId) {
    return this.clients.get(clientId);
  }

  // Send error message to client
  sendError(clientId, error) {
    console.error(`[WebSocket ERROR] [${clientId}] ${error}`);
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      try {
        client.send(
          JSON.stringify({
            type: "error",
            error: error.toString(),
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        console.error(
          `Error sending error message to client ${clientId}:`,
          err
        );
      }
    }
  }

  // Send message to specific client
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to client ${clientId}:`, error);
      }
    }
  }

  // Initialize WebSocket server
  initialize(server) {
    this.wss = new WebSocket.Server({
      server,
      path: "/api/calls/stream",
      perMessageDeflate: false,
    });

    this.wss.on("connection", (ws, req) => {
      console.log("New WebSocket connection attempt");
      console.log("Request URL:", req.url);

      // Extract callSid from URL parameters
      const url = new URL(req.url, "ws://localhost");
      const callSid = url.searchParams.get("callSid");

      if (!callSid) {
        console.error("No callSid provided in WebSocket connection");
        ws.close(1008, "No callSid provided");
        return;
      }

      console.log(`WebSocket connection established for call ${callSid}`);

      // Store client connection
      this.clients.set(callSid, ws);
      this.streamContexts.set(callSid, {
        ws,
        startTime: Date.now(),
        isActive: true,
      });

      // Send connection confirmation
      this.sendToClient(callSid, {
        type: "connection_established",
        callSid,
        timestamp: Date.now(),
      });

      // Set up stream processing with proper audio configuration
      streamProcessor
        .processStream(callSid, ws, callSid, {
          voice: "Polly.Amy",
          audioConfig: {
            audioEncoding: "LINEAR16",
            sampleRateHertz: 16000,
            effectsProfileId: ["telephony-class-application"],
          },
        })
        .then(() => {
          console.log(`Stream processing setup completed for call ${callSid}`);
        })
        .catch((error) => {
          console.error(
            `Error setting up stream processing for call ${callSid}:`,
            error
          );
          this.sendError(callSid, "Error setting up audio processing");
          ws.close(1011, "Stream processing setup failed");
        });

      // Handle incoming messages
      ws.on("message", async (message) => {
        try {
          console.log(`Received message for call ${callSid}`);
          // Process incoming audio data
          await streamProcessor.processAudioChunk(callSid, message);
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
          this.sendError(callSid, "Error processing audio data");
        }
      });

      // Handle connection close
      ws.on("close", (code, reason) => {
        console.log(
          `WebSocket connection closed for call ${callSid}. Code: ${code}, Reason: ${reason}`
        );
        this.cleanupStream(callSid);
      });

      // Handle errors
      ws.on("error", (error) => {
        console.error(`WebSocket error for call ${callSid}:`, error);
        this.cleanupStream(callSid);
      });
    });

    // Handle WebSocket server errors
    this.wss.on("error", (error) => {
      console.error("WebSocket server error:", error);
    });
  }

  // Cleanup stream resources
  async cleanupStream(callSid) {
    try {
      // Remove from clients map
      this.clients.delete(callSid);

      // Remove from stream contexts
      this.streamContexts.delete(callSid);

      // Stop stream processing
      await streamProcessor.stopStream(callSid);
    } catch (error) {
      console.error(`Error cleaning up stream for call ${callSid}:`, error);
    }
  }

  // Check if stream exists
  hasStream(callSid) {
    return this.streamContexts.has(callSid);
  }

  // Get stream context
  getStreamContext(callSid) {
    return this.streamContexts.get(callSid);
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

  // Close WebSocket server
  close() {
    if (this.wss) {
      this.wss.close(() => {
        console.log("WebSocket server closed");
      });
    }
  }

  // Broadcast message to all clients
  broadcast(message) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Broadcast to specific room
  broadcastToRoom(roomId, message) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

module.exports = new WebSocketService();
