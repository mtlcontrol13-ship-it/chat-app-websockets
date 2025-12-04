import { useMemo, useState } from "react";
import Modal from "./Modal";

const Sidebar = ({ participants = [], isOpen = false, onClose = () => {} }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const timestamp = useMemo(
    () =>
      new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()),
    []
  );

  const contactList = useMemo(
    () =>
      participants.map((name) => ({
        name,
        lastMessage: "Tap to start chatting",
        time: timestamp,
      })),
    [participants, timestamp]
  );

  const avatarStyle = (name) => {
    const hash = Array.from(name).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );
    const hue = hash % 360;
    return {
      backgroundColor: `hsl(${hue} 65% 45%)`,
      color: "white",
    };
  };

  const avatarUrl = (name) =>
    `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(
      name
    )}`;

  return (
    <>
      <aside
        className={`h-full lg:h-screen flex flex-col border-r w-72 max-w-[80%] bg-[var(--panel)] text-[var(--text)] transition-transform transform z-40 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 lg:static lg:translate-x-0 lg:w-72 lg:max-w-none`}
        style={{ borderColor: "var(--border)" }}
      >
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <button
            type="button"
            className="text-sm w-full px-4 py-2 rounded-full border transition-colors cursor-pointer"
            style={{
              borderColor: "var(--border)",
              color: "var(--text)",
              backgroundColor: "var(--bg)",
            }}
            onClick={() => setIsModalOpen(true)}
          >
            Create account
          </button>
        </div>

        <div className="px-4 pt-2 pb-4 space-y-3">
          <div>
            <input
              type="text"
              placeholder="Search or start new chat"
              className="w-full px-3 py-2 rounded-full text-sm outline-none transition border bg-[var(--bg)]"
              style={{
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
              onFocus={() => {}}
              onChange={() => {}}
            />
          </div>

          <p
            className="text-xs font-semibold mb-2 flex items-center justify-between"
            style={{ color: "var(--muted)" }}
          >
            <span>Participants</span>
            <span className="text-[11px]" style={{ color: "var(--muted)" }}>
              {participants.length}
            </span>
          </p>
          <div className="space-y-2 text-sm">
            {contactList.map((contact) => (
              <div
                key={contact.name}
                className="flex items-center gap-3 px-3 py-2 rounded-2xl border cursor-pointer transition hover:translate-x-1"
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 relative overflow-hidden"
                  style={avatarStyle(contact.name)}
                >
                  <img
                    src={avatarUrl(contact.name)}
                    alt={`${contact.name} avatar`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold truncate">{contact.name}</p>
                    <span
                      className="text-[11px] whitespace-nowrap"
                      style={{ color: "var(--muted)" }}
                    >
                      {contact.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="text-xs text-ellipsis overflow-hidden whitespace-nowrap"
                      style={{ color: "var(--muted)" }}
                    >
                      {contact.lastMessage}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <Modal
        open={isModalOpen}
        title="Create account"
        actionLabel="Continue"
        onAction={() => setIsModalOpen(false)}
        onClose={() => setIsModalOpen(false)}
      >
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Account creation will be available soon.
        </p>
      </Modal>
    </>
  );
};

export default Sidebar;
