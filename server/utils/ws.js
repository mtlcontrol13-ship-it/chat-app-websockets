import { WebSocket, WebSocketServer } from "ws";
import { User } from "../models/User.js";
import { Message } from "../models/Message.js";

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

  const sendToRecipient = (data, recipientId) => {
    const payload = JSON.stringify(data);
    for (const [client, userInfo] of connectedUsers.entries()) {
      // Send to the intended recipient OR to status/control messages
      if (userInfo.userId === recipientId && client.readyState === WebSocket.OPEN) {
        client.send(payload);
        return true;
      }
    }
    return false;
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

    ws.on("message", async (rawData) => {
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
          
          // Record first chat join timestamp in database if not already recorded
          if (msg.userId) {
            try {
              const user = await User.findById(msg.userId);
              if (user && !user.firstChatJoinAt) {
                user.firstChatJoinAt = new Date();
                await user.save();
              }
            } catch (error) {
              console.error("Failed to record first chat join:", error);
            }

            // Load and send message history for all participants
            try {
              const messages = await Message.find({
                $or: [
                  { senderId: msg.userId },
                  { recipientId: msg.userId }
                ]
              }).sort({ timestamp: 1 }).limit(50); // Limit to last 50 messages per conversation

              if (messages.length > 0) {
                console.log(`Loading ${messages.length} historical messages for user ${msg.username}`);
                messages.forEach(msgDoc => {
                  // Only send messages relevant to this user's conversations
                  if (msgDoc.senderId.toString() === msg.userId || msgDoc.recipientId.toString() === msg.userId) {
                    ws.send(JSON.stringify({
                      id: msgDoc.id,
                      username: msgDoc.senderUsername,
                      text: msgDoc.text,
                      timestamp: msgDoc.timestamp,
                      edited: msgDoc.edited,
                      seen: msgDoc.seen,
                      type: msgDoc.type,
                      participantId: msgDoc.senderId.toString() === msg.userId ? msgDoc.recipientId : msgDoc.senderId,
                    }));
                  }
                });
              }
            } catch (error) {
              console.error("Failed to load message history:", error);
            }
          }
          
          broadcastParticipants();
          return;
        }

        if (msg.username && msg.username !== "System") {
          ws.userName = msg.username;
        }

        // Handle individual messages (only send to recipient and sender)
        if (msg.participantId) {
          // Save individual message to database
          if (msg.id && msg.text && ws.userId) {
            try {
              const messageDoc = new Message({
                id: msg.id,
                senderId: ws.userId,
                senderUsername: msg.username || ws.userName,
                recipientId: msg.participantId,
                text: msg.text,
                type: msg.type || "message",
                timestamp: msg.timestamp || Date.now(),
              });
              await messageDoc.save();
              console.log(`Saved message from ${ws.userName} to ${msg.participantId}`);
            } catch (error) {
              console.error("Error saving message:", error);
            }
          }

          // Prepare message for sender (participantId = recipient)
          const msgForSender = { ...msg, participantId: msg.participantId };
          
          // Prepare message for recipient (participantId = sender)
          const msgForRecipient = { ...msg, participantId: ws.userId };

          // Send to sender's connection to confirm message was sent
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(msgForSender));
          }
          
          // Send to recipient
          const recipientFound = sendToRecipient(msgForRecipient, msg.participantId);
          if (!recipientFound) {
            console.log(`Recipient ${msg.participantId} not connected, message will be delivered when they connect`);
          }
        } else {
          // Broadcast global messages to everyone
          broadcast(msg);
        }
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
