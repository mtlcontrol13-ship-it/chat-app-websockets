import { Circle, Menu } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { formatTimeWithMs } from "../utils/time";

const Header = ({ onToggleSidebar = () => {} }) => {
  const {
    isConnected,
    lastStatusTime,
    latencyMs,
    username,
    isEditingName,
    pendingName,
    setPendingName,
    startEditingName,
    commitNameChange,
    isDark,
    toggleTheme,
    usernameInputRef,
    setIsEditingName,
    user,
  } = useChat();

  return (
    <header
      className="px-6 py-4"
      style={{
        backgroundColor: "var(--panel)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden p-2 rounded-full border"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>
            Chat
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
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
        {user ? (
          <>
            <span style={{ color: "#3b82f6" }} className="font-semibold">
              [{user.role.toUpperCase()}]
            </span>{" "}
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
          </>
        ) : (
          <span style={{ color: "var(--text)" }}>Not logged in</span>
        )}
      </p>
    </header>
  );
};

export default Header;
