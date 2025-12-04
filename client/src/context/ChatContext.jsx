import { createContext, useContext } from "react";
import { useWebSocketChat } from "../hooks/useWebSocketChat";
import { useTheme } from "../hooks/useTheme";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const chat = useWebSocketChat();
  const theme = useTheme();

  return <ChatContext.Provider value={{ ...chat, ...theme }}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return ctx;
};
