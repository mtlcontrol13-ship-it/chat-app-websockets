import { useState } from "react";
import Modal from "./Modal";

const Sidebar = ({ participants = [], isOpen = false, onClose = () => {} }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <aside
        className={`h-full lg:h-screen flex flex-col border-r w-64 max-w-[80%] bg-[var(--panel)] text-[var(--text)] transition-transform transform z-40 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 lg:static lg:translate-x-0 lg:w-64 lg:max-w-none`}
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

        <div className="p-4">
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
