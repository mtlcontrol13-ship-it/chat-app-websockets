import { useMemo, useState } from "react";
import { LogOut, User } from "lucide-react";
import { useChat } from "../context/ChatContext";
import Modal from "./Modal";

const Sidebar = ({ participants = [], isOpen = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, logout, handleLoginSuccess } = useChat();
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
        className={`h-full lg:h-screen flex flex-col border-r w-72 max-w-[80%] bg-[var(--panel)] text-[var(--text)] transition-transform transform z-40 overflow-y-auto border-[var(--border)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 lg:static lg:translate-x-0 lg:w-72 lg:max-w-none`}
      >
        <div className="px-6 py-6 border-b border-[var(--border)] flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-[var(--text)]">Messages</h2>
        </div>

        <div className="px-4 pt-2 pb-4 space-y-3 flex-1">
          <p
            className="text-xs font-semibold mb-2 flex items-center justify-between text-[var(--muted)]"
          >
            <span>Participants</span>
            <span className="text-[11px] text-[var(--muted)]">
              {participants.length}
            </span>
          </p>
          <div className="space-y-2 text-sm">
            {contactList.map((contact) => (
              <div
                key={contact.name}
                className="flex items-center gap-3 px-3 py-2 rounded-2xl border bg-[var(--bg)] border-[var(--border)] cursor-pointer transition hover:translate-x-1"
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
                      className="text-[11px] whitespace-nowrap text-[var(--muted)]"
                    >
                      {contact.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="text-xs text-ellipsis overflow-hidden whitespace-nowrap text-[var(--muted)]"
                    >
                      {contact.lastMessage}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border)] space-y-3">
          {user ? (
            <>
              <div className="px-4 py-3 rounded-lg border bg-[var(--bg)] border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-semibold text-[var(--muted)]">
                      Account
                    </span>
                  </div>
                  <span
                    className="px-2 py-1 rounded text-xs font-semibold bg-blue-600 text-white"
                  >
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-semibold truncate">{user.userName}</p>
                <p className="text-xs text-[var(--muted)]">
                  {user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-sm w-full px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--bg)] transition-colors cursor-pointer flex items-center justify-center gap-2 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              className="text-sm w-full px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--bg)] transition-colors cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              Login to Account
            </button>
          )}
        </div>
      </aside>

      <Modal
        open={isModalOpen}
        title="Login to Chat"
        actionLabel="Login"
        onAction={handleLoginSuccess}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
