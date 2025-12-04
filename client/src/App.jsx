// App.jsx
import { useEffect, useRef, useState } from "react";
import { Circle, Send } from "lucide-react";
import ChatBubble from "./components/ChatBubble";
import Sidebar from "./components/Sidebar";

const WS_URL = "wss://fair-cecelia-mtl-97a3c19e.koyeb.app";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState(
    () => `User${Math.floor(Math.random() * 9000 + 1000)}`
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [pendingName, setPendingName] = useState("");
  const [lastStatusTime, setLastStatusTime] = useState(Date.now());
  const [latencyMs, setLatencyMs] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const seenAckRef = useRef(new Set());

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const intentionalCloseRef = useRef(false);
  const pingIntervalRef = useRef(null);
  const usernameRef = useRef(username);
  const messagesEndRef = useRef(null);
  const usernameInputRef = useRef(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus the username input when editing
  useEffect(() => {
    if (isEditingName) {
      usernameInputRef.current?.focus();
    }
  }, [isEditingName]);

  // Keep username ref in sync for use inside stable callbacks
  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  // Apply + persist theme
  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [isDark]);

  const formatTimeWithMs = (ts) =>
    new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });

  // WebSocket setup + reconnection logic
  useEffect(() => {
    let shouldReconnect = true;

    const connect = () => {
      intentionalCloseRef.current = false;
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setIsConnected(true);
        setLastStatusTime(Date.now());
        sendIdentify(usernameRef.current);
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
  }, []);

  // Periodic latency pings
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

  const sendIdentify = (name = usernameRef.current) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ type: "identify", username: name })
      );
    }
  };

  const sendMessage = (e) => {
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
    };

    socketRef.current.send(JSON.stringify(message));
    setInput("");
  };

  const startEditingMessage = (msg) => {
    if (msg.username !== username || msg.type === "status") return;
    setEditingId(msg.id);
    setEditingText(msg.text);
  };

  const deleteMessage = (msg) => {
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
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = () => {
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
          ? {
              ...m,
              text: updatedText,
              edited: true,
              timestamp: payload.timestamp,
            }
          : m
      )
    );
    socketRef.current?.send(JSON.stringify(payload));
    cancelEditing();
  };

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

  const participants = Array.from(
    new Set(
      [username, ...messages.map((m) => m.username)].filter(
        (u) => u && u !== "System"
      )
    )
  );

  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Sidebar
        username={username}
        participants={participants}
        isConnected={isConnected}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
      />
      <div className="flex flex-col flex-1" style={{ color: "var(--text)" }}>
        {/* Header */}
        <header
          className="px-6 py-4"
          style={{
            backgroundColor: "var(--panel)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <h1
              className="text-2xl font-semibold"
              style={{ color: "var(--text)" }}
            >
              Native WebSocket Chat
            </h1>
            <div className="flex items-center gap-2">
              <Circle
                className="w-3 h-3 fill-current"
                style={{ color: isConnected ? "#22c55e" : "#ef4444" }}
              />
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {isConnected ? "Connected" : "Reconnecting..."} at{" "}
                {formatTimeWithMs(lastStatusTime)}
                {isConnected && (
                  <> – ping {latencyMs !== null ? `${latencyMs} ms` : "..."} </>
                )}
              </span>
            </div>
          </div>
          <p
            className="text-sm mt-1 cursor-pointer select-none"
            style={{ color: "var(--muted)" }}
            onDoubleClick={startEditingName}
            title="Double-click to change your display name"
          >
            Logged in as{" "}
            {isEditingName ? (
              <input
                ref={usernameInputRef}
                value={pendingName}
                onChange={(e) => setPendingName(e.target.value)}
                onBlur={commitNameChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitNameChange();
                  if (e.key === "Escape") setIsEditingName(false);
                }}
                className="border-b focus:outline-none"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text)",
                  backgroundColor: "transparent",
                }}
              />
            ) : (
              <span className="font-semibold" style={{ color: "var(--text)" }}>
                {username}
              </span>
            )}
          </p>
        </header>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
          style={{ backgroundColor: "var(--bg)" }}
        >
          {messages.map((msg) => {
            if (msg.type === "status") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div
                    className="text-sm italic px-3 py-1 rounded-full"
                    style={{
                      color: "var(--status-text)",
                      backgroundColor: "var(--status-bg)",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            }

            const isOwn = msg.username === username;
            const isEditing = editingId === msg.id && isOwn;
            const time = new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <ChatBubble
                  text={isEditing ? editingText : msg.text}
                  time={time}
                  isOwn={isOwn}
                  edited={msg.edited}
                  seen={msg.seen}
                  showActions={isOwn && !isEditing}
                  isEditing={isEditing}
                  editValue={editingText}
                  onEditChange={setEditingText}
                  onEditSave={saveEdit}
                  onEditCancel={cancelEditing}
                  onEdit={() => startEditingMessage(msg)}
                  onDelete={() => deleteMessage(msg)}
                />
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="border-t p-4"
          style={{
            backgroundColor: "var(--panel)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected}
              className="flex-1 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: "var(--input-bg)",
                color: "var(--text)",
                border: `1px solid var(--input-border)`,
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={!isConnected || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
