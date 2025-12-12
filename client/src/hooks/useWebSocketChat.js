import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = import.meta.env.VITE_WS_URL;

export const useWebSocketChat = ({ user = null } = {}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [pendingName, setPendingName] = useState("");
  const [lastStatusTime, setLastStatusTime] = useState(Date.now());
  const [latencyMs, setLatencyMs] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const intentionalCloseRef = useRef(false);
  const pingIntervalRef = useRef(null);
  const seenAckRef = useRef(new Set());
  const usernameRef = useRef(username);
  const usernameInputRef = useRef(null);

  useEffect(() => {
    usernameRef.current = username;
    if (username) {
      setParticipants((prev) => {
        const next = new Set(prev);
        next.add(username);
        return Array.from(next);
      });
    }
  }, [username]);

  // Initialize or refresh username from authenticated user
  useEffect(() => {
    if (user) {
      const newUsername =
        user.userName || user.name || user.email || `User${Math.floor(Math.random() * 9000 + 1000)}`;
      setUsername(newUsername);
      setPendingName(newUsername);
    }
  }, [user]);

  const sendIdentify = useCallback(
    (name = usernameRef.current, userId = user?.id) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ 
          type: "identify", 
          username: name,
          userId 
        }));
      }
    },
    [user?.id]
  );

  // WebSocket setup + reconnection logic (only connect if user is authenticated)
  useEffect(() => {
    // Don't connect if no user is authenticated
    if (!user) {
      return;
    }

    let shouldReconnect = true;

    const connect = () => {
      intentionalCloseRef.current = false;
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setIsConnected(true);
        setLastStatusTime(Date.now());
        sendIdentify(usernameRef.current, user?.id);
        ws.send(
          JSON.stringify({
            type: "status",
            text: `${usernameRef.current} joined the chat`,
            username: "System",
            timestamp: Date.now(),
          })
        );
      };

      ws.onmessage = async (event) => {
        let data = event.data;

        if (data instanceof Blob) {
          data = await data.text();
        } else if (data instanceof ArrayBuffer) {
          data = new TextDecoder().decode(data);
        }

        try {
          const msg = JSON.parse(data);
          if (msg.type === "pong" && typeof msg.sentAt === "number") {
            setLatencyMs(Math.max(0, Date.now() - msg.sentAt));
            return;
          }

          if (msg.type === "ping") return;

          if (msg.type === "edit" && msg.id) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === msg.id
                  ? {
                      ...m,
                      text: msg.text,
                      edited: true,
                      timestamp: msg.timestamp ?? m.timestamp,
                    }
                  : m
              )
            );
            return;
          }

          if (msg.type === "seen" && msg.id) {
            setMessages((prev) =>
              prev.map((m) => (m.id === msg.id ? { ...m, seen: true } : m))
            );
            return;
          }

          if (msg.type === "delete" && msg.id) {
            setMessages((prev) => prev.filter((m) => m.id !== msg.id));
            return;
          }

          if (msg.type === "status" && typeof msg.text === "string") {
            const text = msg.text;
            if (text.includes(" joined the chat")) {
              const name = text.replace(" joined the chat", "").trim();
              if (name && name !== "System") {
                setParticipants((prev) => Array.from(new Set([...prev, name])));
              }
            }
            if (text.includes(" left the chat")) {
              const name = text.replace(" left the chat", "").trim();
              if (name) {
                setParticipants((prev) => prev.filter((p) => p !== name));
              }
            }
          }

          if (msg.type === "participants" && Array.isArray(msg.users)) {
            setParticipants(msg.users.map((u) => u.username || u));
            return;
          }

          if (msg.username && msg.username !== "System") {
            setParticipants((prev) => Array.from(new Set([...prev, msg.username])));
          }

          const incomingId = msg.id || crypto.randomUUID();
          setMessages((prev) => [
            ...prev,
            {
              ...msg,
              id: incomingId,
              edited: !!msg.edited,
              seen: !!msg.seen,
            },
          ]);
        } catch (e) {
          console.warn("Non-JSON message ignored:", data);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setLastStatusTime(Date.now());
        if (!intentionalCloseRef.current && shouldReconnect) {
          reconnectTimeoutRef.current = setTimeout(connect, 2000);
        }
      };

      ws.onerror = (err) => console.error("WS Error:", err);

      socketRef.current = ws;
    };

    connect();

    return () => {
      shouldReconnect = false;
      intentionalCloseRef.current = true;
      setLatencyMs(null);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      socketRef.current?.close();
    };
  }, [user, username, sendIdentify]);

  // Periodic latency pings
  // Clear state when user logs out
  useEffect(() => {
    if (!user) {
      setIsConnected(false);
      setMessages([]);
      setParticipants([]);
      setUsername(null);
    }
  }, [user]);

  useEffect(() => {
    if (!isConnected || !socketRef.current) return;

    pingIntervalRef.current = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({ type: "ping", sentAt: Date.now() })
        );
      }
    }, 2000);

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [isConnected]);

  // Send seen receipts for messages from others once displayed
  useEffect(() => {
    if (!isConnected || !socketRef.current) return;

    messages.forEach((msg) => {
      if (msg.username === username || msg.type === "status") return;
      if (seenAckRef.current.has(msg.id)) return;

      seenAckRef.current.add(msg.id);
      socketRef.current.send(
        JSON.stringify({
          type: "seen",
          id: msg.id,
          username,
          timestamp: Date.now(),
        })
      );
    });
  }, [messages, isConnected, username]);

  const sendMessage = useCallback(
    (e, participantId) => {
      e.preventDefault();
      if (!input.trim() || !isConnected || !socketRef.current) return;

      const id = crypto.randomUUID();
      const message = {
        id,
        text: input.trim(),
        username,
        timestamp: Date.now(),
        edited: false,
        seen: false,
        participantId, // Include participant ID for individual chats
      };

      socketRef.current.send(JSON.stringify(message));
      setInput("");
    },
    [input, isConnected, username]
  );

  const startEditingMessage = useCallback(
    (msg) => {
      if (msg.username !== username || msg.type === "status") return;
      setEditingId(msg.id);
      setEditingText(msg.text);
    },
    [username]
  );

  const deleteMessage = useCallback(
    (msg) => {
      if (msg.username !== username || msg.type === "status") return;

      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      if (editingId === msg.id) {
        setEditingId(null);
        setEditingText("");
      }

      socketRef.current?.send(
        JSON.stringify({
          type: "delete",
          id: msg.id,
          username,
          timestamp: Date.now(),
        })
      );

      socketRef.current?.send(
        JSON.stringify({
          type: "status",
          text: `${username} deleted a message`,
          username: "System",
          timestamp: Date.now(),
        })
      );
    },
    [editingId, username]
  );

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditingText("");
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId || !editingText.trim()) {
      cancelEditing();
      return;
    }

    const updatedText = editingText.trim();
    const payload = {
      type: "edit",
      id: editingId,
      text: updatedText,
      username,
      timestamp: Date.now(),
      edited: true,
      seen: false,
    };

    setMessages((prev) =>
      prev.map((m) =>
        m.id === editingId
          ? { ...m, text: updatedText, edited: true, timestamp: payload.timestamp }
          : m
      )
    );
    socketRef.current?.send(JSON.stringify(payload));
    cancelEditing();
  }, [editingId, editingText, username, cancelEditing]);

  const startEditingName = () => {
    setPendingName(username);
    setIsEditingName(true);
  };

  const commitNameChange = () => {
    const nextName = pendingName.trim();
    setIsEditingName(false);

    if (!nextName || nextName === username) return;

    const previousName = username;
    setUsername(nextName);
    usernameRef.current = nextName;
    setParticipants((prev) => {
      const filtered = prev.filter((p) => p !== previousName);
      return Array.from(new Set([...filtered, nextName]));
    });
    sendIdentify(nextName);

    if (isConnected && socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          type: "status",
          text: `${previousName} is now ${nextName}`,
          username: "System",
          timestamp: Date.now(),
        })
      );
    }
  };

  return {
    messages,
    input,
    setInput,
    isConnected,
    username,
    isEditingName,
    pendingName,
    setPendingName,
    startEditingName,
    commitNameChange,
    lastStatusTime,
    latencyMs,
    editingId,
    editingText,
    setEditingText,
    sendMessage,
    startEditingMessage,
    deleteMessage,
    saveEdit,
    cancelEditing,
    usernameInputRef,
    setIsEditingName,
    participants,
  };
};
