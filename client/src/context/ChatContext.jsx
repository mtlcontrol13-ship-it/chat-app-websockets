import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useWebSocketChat } from "../hooks/useWebSocketChat";
import { useTheme } from "../hooks/useTheme";
import { getCompanyUsers } from "../api/auth";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [companyParticipants, setCompanyParticipants] = useState([]);

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

  // Fetch company users when user is authenticated
  // Also poll for companyId assignment when user is newly registered
  useEffect(() => {
    const fetchCompanyUsers = async () => {
      if (user?.companyId) {
        try {
          const response = await getCompanyUsers(user.companyId);
          const users = response.users || response || [];
          setCompanyParticipants(users);
        } catch (error) {
          console.error("Failed to fetch company users:", error);
        }
      } else {
        setCompanyParticipants([]);
      }
    };

    fetchCompanyUsers();
  }, [user?.companyId]);

  // Poll for user updates when newly registered (companyId: null)
  useEffect(() => {
    if (!user || user?.companyId) {
      // Don't poll if user doesn't exist or already has companyId
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Check if admin has assigned a companyId
          if (parsedUser?.companyId && parsedUser?.companyId !== user?.companyId) {
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error("Failed to poll user updates:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [user]);

  // Pass authenticated user to WebSocket hook ONLY if they have a companyId
  // Users without companyId cannot access the chat until admin adds them
  const chat = useWebSocketChat({ user: user?.companyId ? user : null });
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

  const handleAddUser = useCallback(async (userData) => {
    // After user is added, refresh the participant list
    if (user?.companyId) {
      try {
        // Add a small delay to ensure the backend has processed the addition
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await getCompanyUsers(user.companyId);
        const users = response.users || response || [];
        setCompanyParticipants(users);
      } catch (error) {
        console.error("Failed to refresh company users:", error);
      }
    }
  }, [user?.companyId]);

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
        handleAddUser,
        companyParticipants,
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
