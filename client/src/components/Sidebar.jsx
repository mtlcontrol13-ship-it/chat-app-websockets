import { useMemo, useState } from "react";
import { LogOut, PlusIcon, User } from "lucide-react";
import { useChat } from "../context/ChatContext";
import Modal from "./Modal";

const Sidebar = ({ isOpen = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login"); // 'login', 'register', or 'addUser'
  const { user, logout, handleAddUser, companyParticipants } = useChat();
  
  const handleSwitchMode = (newMode) => {
    setModalType(newMode);
  };
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
      companyParticipants
        .filter((participant) => {
          // Don't show themselves
          if (participant._id === user?.id || participant._id === user?._id) {
            return false;
          }

          // Admin: See drivers and customers (not other admins)
          if (user?.role === "admin") {
            return participant.role !== "admin";
          }

          // Customer: See admin + their assigned drivers (not other customers)
          if (user?.role === "customer") {
            // Show admin
            if (participant.role === "admin") {
              return true;
            }
            // Show drivers assigned to this customer
            if (
              participant.role === "driver" &&
              participant.assignedTo?._id === user?.id
            ) {
              return true;
            }
            return false;
          }

          // Driver: See admin + their assigned customer (not other drivers)
          if (user?.role === "driver") {
            // Show admin
            if (participant.role === "admin") {
              return true;
            }
            // Show the customer they're assigned to
            if (
              participant.role === "customer" &&
              participant._id === user.assignedTo
            ) {
              return true;
            }
            return false;
          }

          return false;
        })
        .map((participant) => ({
          name: participant.userName,
          email: participant.email,
          role: participant.role,
          lastMessage: "Tap to start chatting",
          time: timestamp,
        })),
    [companyParticipants, timestamp, user]
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
        className={`h-full lg:h-screen flex flex-col border-r w-72 max-w-[80%] bg-(--panel) text-(--text) transition-transform transform z-40 overflow-y-auto border-(--border) ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 lg:static lg:translate-x-0 lg:w-72 lg:max-w-none`}
      >
        <div className="px-4 py-6 border-b border-(--border) flex items-center justify-between">
          <h2 className="text-3xl font-bold">Chats</h2>
          {user?.role === "admin" && (
            <button
              type="button"
              className="p-2 rounded-full border border-(--border) bg-(--bg) text-(--text) hover:bg-blue-600 hover:text-white transition-colors cursor-pointer duration-300"
              onClick={() => {
                setModalType("addUser");
                setIsModalOpen(true);
              }}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-4 pt-2 pb-4 space-y-3 flex-1">
          <p className="text-xs font-semibold mb-2 flex items-center justify-between text-(--muted)">
            <span>Participants</span>
            <span className="text-[11px] text-(--muted)">
              {companyParticipants.length}
            </span>
          </p>
          <div className="space-y-2 text-sm">
            {contactList.map((contact) => (
              <div
                key={contact.name}
                className="flex items-center gap-3 px-3 py-2 rounded-2xl border bg-(--bg) border-(--border) cursor-pointer transition hover:translate-x-1"
              >
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 relative overflow-hidden"
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
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--bg)]"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold truncate">{contact.name}</p>
                    <span className="text-[11px] whitespace-nowrap text-(--muted)">
                      {contact.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-green-600 font-medium">
                      Online
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-(--border) space-y-3">
          {user ? (
            <>
              <div className="px-4 py-3 rounded-lg border bg-(--bg) border-(--border)">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-semibold text-(--muted)">
                      Account
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-600 text-white">
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-semibold truncate">
                  {user.userName}
                </p>
                <p className="text-xs text-(--muted)">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-sm w-full px-4 py-2 rounded-full border border-(--border) bg-(--bg) transition-colors cursor-pointer flex items-center justify-center gap-2 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                className="text-sm w-full px-4 py-2 rounded-full border border-(--border) bg-(--bg) transition-colors cursor-pointer"
                onClick={() => {
                  setModalType("login");
                  setIsModalOpen(true);
                }}
              >
                Login
              </button>
              <button
                type="button"
                className="text-sm w-full px-4 py-2 rounded-full border border-(--border) bg-blue-600 text-white transition-colors cursor-pointer hover:bg-blue-700"
                onClick={() => {
                  setModalType("register");
                  setIsModalOpen(true);
                }}
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </aside>

      {!user ? (
        <Modal
          key="login-register-modal"
          open={isModalOpen}
          title={
            modalType === "login"
              ? "Login"
              : "Create Account"
          }
          modalType={modalType}
          actionLabel={
            modalType === "login"
              ? "Login"
              : "Register"
          }
          onAction={() => {}}
          onClose={() => setIsModalOpen(false)}
          onSwitchMode={handleSwitchMode}
        />
      ) : user?.role === "admin" ? (
        <Modal
          key="admin-modal"
          open={isModalOpen}
          title="Add New User"
          modalType="addUser"
          actionLabel="Add User"
          onAction={handleAddUser}
          onClose={() => setIsModalOpen(false)}
        />
      ) : null}
    </>
  );
};

export default Sidebar;
