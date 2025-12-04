import http from "http";
import WebSocket from "ws";

const server = http.createServer((req, res) => {
  // Optional: you can respond to health checks or simple HTTP
  if (req.url === "/healthz") {
    res.writeHead(200);
    res.end("OK");
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocket.Server({ server });

// Broadcast helper for all connected clients
const broadcast = (data) => {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

wss.on("connection", (ws) => {
  console.log("New client connected");
  ws.userName = null;

  ws.on("message", (rawData) => {
    let data = rawData;

    // Normalize incoming payloads
    if (data instanceof ArrayBuffer) {
      data = Buffer.from(data).toString();
    } else if (Buffer.isBuffer(data)) {
      data = data.toString();
    }

    try {
      const msg = JSON.parse(data);
      // Handle latency pings directly to sender to avoid chat noise
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

      // Capture username from any user message (fallback if identify was missed)
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

server.listen(8080, () => {
  console.log("Server is listening on http://localhost:8080");
});
