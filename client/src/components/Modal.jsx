import { X } from "lucide-react";
import { useId, useState } from "react";
import { addUser, login, register } from "../api/auth";
import { useChat } from "../context/ChatContext";

const Modal = ({
  open = false,
  title = "Modal",
  children,
  actionLabel = "OK",
  modalType = "login", // 'login' or 'addUser'
  onAction = () => {},
  onClose = () => {},
  onSwitchMode = () => {}, // callback to switch between login and register
}) => {
  const { user, handleLoginSuccess } = useChat();
  const [internalMode, setInternalMode] = useState(modalType);
  const formId = useId();
  const [formData, setFormData] = useState({
    email: "",
    companyId: "",
    role: "customer",
    userName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  if (!open) return null;
  
  // Use internalMode for switching between login/register
  const currentMode = (modalType === "login" || modalType === "register") ? internalMode : modalType;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim()) {
      setError("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email (e.g., name@company.com)");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login(formData.email);
      handleLoginSuccess(response);
      setFormData({ email: "", companyId: "", role: "customer", userName: "" });
      setError("");
      onClose();
    } catch (error) {
      console.error("Login error:", error);
      setError(error?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.userName.trim()) {
      setError("Please enter a username");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email (e.g., name@company.com)");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register(formData.userName, formData.email);
      if (response && response.message) {
        setFormData({ email: "", companyId: "", role: "customer", userName: "" });
        setError("");
        onClose();
        onAction(response);
      }
    } catch (error) {
      console.error("Register error:", error);
      setError(error?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!formData.companyId.trim()) {
      setError("Please enter your Company ID");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email (e.g., name@company.com)");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await addUser(
        formData.email,
        user?.email,
        formData.companyId,
        formData.role
      );

      if (response && response.message) {
        setFormData({ email: "", companyId: "", role: "customer", userName: "" });
        setError("");
        onClose();
        onAction(response);
      }
    } catch (error) {
      console.error("Add user to chat error:", error);
      setError(
        error?.message || "Failed to add user to chat. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    if (currentMode === "login") {
      handleLoginSubmit(e);
    } else if (currentMode === "register") {
      handleRegisterSubmit(e);
    } else {
      handleAddUserSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl shadow-lg p-6 bg-(--panel) text-(--text)">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {currentMode === "login" ? "Login" : currentMode === "register" ? "Create Account" : title}
          </h3>
          <button
            type="button"
            className="text-sm px-2 py-1 rounded-md border border-(--border) cursor-pointer text-(--text)"
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
              {currentMode === "register" && (
                <div className="flex flex-col gap-1">
                  <label
                    className="text-sm text-(--text)"
                    htmlFor={`${formId}-username`}
                  >
                    Username
                  </label>
                  <input
                    id={`${formId}-username`}
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--bg) outline-none text-(--text)"
                    placeholder="john_doe"
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label
                  className="text-sm text-(--text)"
                  htmlFor={`${formId}-email`}
                >
                  Email
                </label>
                <input
                  id={`${formId}-email`}
                  type="email"
                  className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--bg) outline-none text-(--text)"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isSubmitting}
                  required
                />
              </div>
              {currentMode === "addUser" && (
                <>
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-sm text-(--text)"
                      htmlFor={`${formId}-companyId`}
                    >
                      Company ID
                    </label>
                    <input
                      id={`${formId}-companyId`}
                      type="text"
                      className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--bg) outline-none text-(--text)"
                      placeholder="Company ID"
                      value={formData.companyId}
                      onChange={(e) =>
                        setFormData({ ...formData, companyId: e.target.value })
                      }
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-sm text-(--text)"
                      htmlFor={`${formId}-role`}
                    >
                      Role
                    </label>
                    <select
                      id={`${formId}-role`}
                      className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--bg) outline-none text-(--text)"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      disabled={isSubmitting}
                      required
                    >
                      <option value="customer">Customer</option>
                      <option value="driver">Driver</option>
                    </select>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
        {(currentMode === "login" || currentMode === "register") && (
          <div className="text-center mb-4 border-t border-(--border) pt-4">
            {currentMode === "login" ? (
              <p className="text-sm text-(--muted)">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFormData({ email: "", companyId: "", role: "customer", userName: "" });
                    setError("");
                    setInternalMode("register");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer underline"
                >
                  Create one
                </button>
              </p>
            ) : (
              <p className="text-sm text-(--muted)">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFormData({ email: "", companyId: "", role: "customer", userName: "" });
                    setError("");
                    setInternalMode("login");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer underline"
                >
                  Login here
                </button>
              </p>
            )}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-full border border-(--border) bg-transparent text-(--text) cursor-pointer"
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
            {isSubmitting ? (currentMode === "login" ? "Logging in..." : currentMode === "register" ? "Registering..." : "Adding user...") : (currentMode === "login" ? "Login" : currentMode === "register" ? "Register" : actionLabel)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
