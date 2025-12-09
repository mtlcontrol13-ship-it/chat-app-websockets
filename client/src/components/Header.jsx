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
      className="px-6 py-4 bg-(--panel) border-b border-(--border)"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden p-2 rounded-full border border-(--border) bg-(--bg)"
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-(--text)">
            Chat
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="px-3 py-1 text-sm rounded-full border border-(--border) bg-(--bg) text-(--text) transition-colors"
          >
            {isDark ? "Light mode" : "Dark mode"}
          </button>
          <div className="flex items-center gap-2">
            <Circle
              className="w-3 h-3 fill-current"
              style={{ color: isConnected ? "#22c55e" : "#ef4444" }}
            />
            <span className="text-sm text-(--muted)">
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
        className="text-sm mt-1 cursor-pointer select-none text-(--muted)"
        onDoubleClick={startEditingName}
        title="Double-click to change your display name"
      >
        {user ? (
          <>
            <span className="font-semibold text-blue-600">
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
                className="border-b focus:outline-none bg-transparent text-(--text)"
                style={{
                  borderColor: "var(--border)",
                }}
              />
            ) : (
              <span className="font-semibold text-(--text)">
                {username}
              </span>
            )}
          </>
        ) : (
          <span className="text-(--text)">Not logged in</span>
        )}
      </p>
    </header>
  );
};

export default Header;
