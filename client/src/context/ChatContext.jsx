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
        setUser(JSON.parse(storedUser));
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
