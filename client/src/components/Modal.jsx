import { useId, useState } from "react";
import { X } from "lucide-react";

const Modal = ({
  open = false,
  title = "Modal",
  children = null,
  actionLabel = "OK",
  onAction = () => {},
  onClose = () => {},
}) => {
  if (!open) return null;

  const formId = useId();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const hasCustomBody = Boolean(children);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAction({ username, email });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl shadow-lg p-6"
        style={{ backgroundColor: "var(--panel)", color: "var(--text)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            className="text-sm px-2 py-1 rounded-md border cursor-pointer"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">
          {hasCustomBody ? (
            children
          ) : (
            <form id={formId} className="space-y-3" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                <label className="text-sm" htmlFor={`${formId}-username`}>
                  Username
                </label>
                <input
                  id={`${formId}-username`}
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border bg-[var(--bg)] outline-none"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm" htmlFor={`${formId}-email`}>
                  Email
                </label>
                <input
                  id={`${formId}-email`}
                  type="email"
                  className="w-full px-3 py-2 rounded-lg border bg-[var(--bg)] outline-none"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </form>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-full border cursor-pointer"
            style={{
              borderColor: "var(--border)",
              color: "var(--text)",
              backgroundColor: "transparent",
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type={hasCustomBody ? "button" : "submit"}
            form={hasCustomBody ? undefined : formId}
            className="px-4 py-2 rounded-full bg-blue-600 text-white cursor-pointer"
            onClick={hasCustomBody ? onAction : undefined}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
