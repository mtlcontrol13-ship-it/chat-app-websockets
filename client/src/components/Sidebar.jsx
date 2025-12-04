import { Circle } from "lucide-react";

const Sidebar = ({
  username,
  participants = [],
  isConnected = false,
  isDark = false,
  onToggleTheme,
}) => {
  return (
    <aside
      className="w-64 h-full flex flex-col border-r"
      style={{
        backgroundColor: "var(--panel)",
        borderColor: "var(--border)",
        color: "var(--text)",
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <Circle
            className="w-3 h-3 fill-current"
            style={{ color: isConnected ? "#22c55e" : "#ef4444" }}
          />
          <div>
            <p className="text-sm font-semibold">You</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {username}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleTheme}
          className="mt-3 text-xs px-3 py-1 rounded-full border transition-colors"
          style={{
            borderColor: "var(--border)",
            color: "var(--text)",
            backgroundColor: "var(--bg)",
          }}
        >
          {isDark ? "Light mode" : "Dark mode"}
        </button>
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>
          Participants
        </p>
        <div className="space-y-2 text-sm">
          {participants.map((user) => (
            <div
              key={user}
              className="flex items-center gap-2 px-2 py-1 rounded-md"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#22c55e" }}
              />
              <span>{user}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
