// App.jsx
import { useState, useEffect, useRef } from "react";
import { Send, Circle, EllipsisVertical } from "lucide-react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

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
  const [isDark, setIsDark] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

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

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
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

          setMessages((prev) => [...prev, { ...msg, id: crypto.randomUUID() }]);
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

    const message = {
      text: input.trim(),
      username,
      timestamp: Date.now(),
    };

    socketRef.current.send(JSON.stringify(message));
    setInput("");
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

  const bubbleStyles = (msg) => {
    if (msg.username === username) {
      return {
        backgroundColor: "var(--bubble-self-bg)",
        color: "var(--bubble-self-text)",
        border: "1px solid transparent",
      };
    }

    if (msg.type === "status") {
      return {
        backgroundColor: "var(--status-bg)",
        color: "var(--status-text)",
        border: "1px solid transparent",
      };
    }

    return {
      backgroundColor: "var(--bubble-other-bg)",
      color: "var(--bubble-other-text)",
      border: `1px solid var(--border)`,
    };
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              className="px-3 py-1 text-sm rounded-full border transition-colors"
              style={{
                borderColor: "var(--border)",
                color: "var(--text)",
                backgroundColor: "var(--bg)",
              }}
            >
              {isDark ? "Light mode" : "Dark mode"}
            </button>
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
        onClick={() => setOpenMenuId(null)}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.username === username ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                msg.type === "status"
                  ? "text-center mx-auto text-sm italic"
                  : ""
              }`}
              style={bubbleStyles(msg)}
            >
              {/* Message actions */}
              {msg.type !== "status" && (
                <div className="absolute top-2 right-2">
                  <button
                    type="button"
                    aria-label="Message actions"
                    className="p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId((prev) => (prev === msg.id ? null : msg.id));
                    }}
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--muted)",
                    }}
                  >
                    <EllipsisVertical className="w-5 h-5" />
                  </button>
                  <ul
                    className="absolute right-0 mt-2 w-32 rounded-lg shadow-lg transition-opacity"
                    style={{
                      backgroundColor: "var(--panel)",
                      border: `1px solid var(--border)`,
                      color: "var(--text)",
                      opacity: openMenuId === msg.id ? 1 : 0,
                      visibility: openMenuId === msg.id ? "visible" : "hidden",
                      pointerEvents: openMenuId === msg.id ? "auto" : "none",
                    }}
                  >
                    <li
                      className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                      }}
                    >
                      Edit
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-red-900"
                      style={{ cursor: "pointer", color: "#ef4444" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                      }}
                    >
                      Delete
                    </li>
                  </ul>
                </div>
              )}
              {msg.type !== "status" && msg.username !== username && (
                <p
                  className="text-xs font-medium opacity-80 mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  {msg.username}
                </p>
              )}
              <p className={msg.type === "status" ? "text-sm" : ""}>
                {msg.text}
              </p>
              <p
                className="text-xs mt-1"
                style={{
                  color:
                    msg.username === username
                      ? "var(--bubble-self-muted)"
                      : "var(--muted)",
                }}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
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
  );
}
