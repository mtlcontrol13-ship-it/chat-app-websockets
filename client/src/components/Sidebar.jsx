const Sidebar = ({ participants = [] }) => {
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
        <button
          type="button"
          className="text-sm w-full px-4 py-2 rounded-full border transition-colors"
          style={{
            borderColor: "var(--border)",
            color: "var(--text)",
            backgroundColor: "var(--bg)",
          }}
        >
          Create account
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
