// App.jsx
import { useState } from "react";
import { ChatProvider, useChat } from "./context/ChatContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import Modal from "./components/Modal";

const AppContent = () => {
  const { participants, user, isLoginModalOpen, setIsLoginModalOpen, handleLoginSuccess } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return (
      <Modal
        open={isLoginModalOpen}
        title="Login to Chat"
        actionLabel="Login"
        onClose={() => {}}
        onAction={handleLoginSuccess}
      />
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden bg-(--bg)"
    >
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        participants={participants}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div
        className="flex flex-col flex-1 min-h-0 text-(--text)"
      >
        <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <MessageList />
        <MessageInput />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}
