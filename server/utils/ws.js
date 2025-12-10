import { WebSocket, WebSocketServer } from "ws";

const normalizeIncoming = (data) => {
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString();
  }

  if (Buffer.isBuffer(data)) {
    return data.toString();
  }

  return data;
};

const setupWebSocketServer = (httpServer) => {
  const wss = new WebSocketServer({ server: httpServer });
  const connectedUsers = new Map(); // Track online users

  const broadcast = (data) => {
    const payload = JSON.stringify(data);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  };

  const broadcastParticipants = () => {
    const participants = Array.from(connectedUsers.values());
    broadcast({
      type: "participants",
      users: participants,
      timestamp: Date.now(),
    });
  };

  wss.on("connection", (ws) => {
    console.log("New client connected");
    ws.userName = null;
    ws.userId = null;

    ws.on("message", (rawData) => {
      const data = normalizeIncoming(rawData);

      try {
        const msg = JSON.parse(data);

        if (msg.type === "ping") {
          ws.send(
            JSON.stringify({
              type: "pong",
              sentAt: msg.sentAt,
              timestamp: Date.now(),
            })
          );
          return;
        }

        if (msg.type === "identify" && msg.username) {
          ws.userName = msg.username;
          ws.userId = msg.userId; // Store user ID if provided
          connectedUsers.set(ws, {
            username: msg.username,
            userId: msg.userId,
            joinedAt: Date.now(),
          });
          broadcastParticipants();
          return;
        }

        if (msg.username && msg.username !== "System") {
          ws.userName = msg.username;
        }

        broadcast(msg);
      } catch (err) {
        console.warn("Received non-JSON message (ignored):", data);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      const name = ws.userName || "A user";
      
      // Remove from connected users
      connectedUsers.delete(ws);
      
      broadcast({
        type: "status",
        text: `${name} left the chat`,
        username: "System",
        timestamp: Date.now(),
      });
      
      broadcastParticipants();
    });
  });

  return wss;
};

export default setupWebSocketServer;
