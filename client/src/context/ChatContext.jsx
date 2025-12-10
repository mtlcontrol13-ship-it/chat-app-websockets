import { createContext, useContext, useState, useEffect } from "react";
import { useWebSocketChat } from "../hooks/useWebSocketChat";
import { useTheme } from "../hooks/useTheme";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.userName) {
          setUser(parsed);
        } else {
          // Drop legacy entries without userName so we force a fresh login
          localStorage.removeItem("user");
          setIsLoginModalOpen(true);
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
        setIsLoginModalOpen(true);
      }
    } else {
      setIsLoginModalOpen(true);
    }
  }, []);

  // Pass authenticated user to WebSocket hook
  const chat = useWebSocketChat({ user });
  const theme = useTheme();

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (userData) => {
    if (userData && userData.user) {
      setUser(userData.user);
      localStorage.setItem("user", JSON.stringify(userData.user));
      setIsLoginModalOpen(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        ...chat,
        ...theme,
        user,
        isLoginModalOpen,
        setIsLoginModalOpen,
        logout,
        handleLoginSuccess,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return ctx;
};
