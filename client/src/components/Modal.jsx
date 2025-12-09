import { useId, useState } from "react";
import { X } from "lucide-react";
import { login } from "../api/auth";

const Modal = ({
  open = false,
  title = "Modal",
  children,
  actionLabel = "OK",
  onAction = () => {},
  onClose = () => {},
}) => {
  if (!open) return null;

  const formId = useId();
  const [formData, setFormData] = useState({ email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login(formData.email);

      if (response && response.message) {
        setFormData({ email: "" });
        setError("");
        onClose();
        onAction(response);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          {children ?? (
            <form id={formId} className="space-y-3" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-600 text-sm">
                  {error}
                </div>
              )}
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
                  value={formData.email}
                  onChange={(e) => setFormData({ email: e.target.value })}
                  disabled={isSubmitting}
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
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type={children ? "button" : "submit"}
            form={children ? undefined : formId}
            className="px-4 py-2 rounded-full bg-blue-600 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={children ? onAction : undefined}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
