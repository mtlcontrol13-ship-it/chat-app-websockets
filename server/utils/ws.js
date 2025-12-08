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

  const broadcast = (data) => {
    const payload = JSON.stringify(data);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  };

  wss.on("connection", (ws) => {
    console.log("New client connected");
    ws.userName = null;

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
      broadcast({
        type: "status",
        text: `${name} left the chat`,
        username: "System",
        timestamp: Date.now(),
      });
    });
  });

  return wss;
};

export default setupWebSocketServer;
