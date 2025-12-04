// App.jsx
import { useState } from "react";
import { ChatProvider, useChat } from "./context/ChatContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";

const AppContent = () => {
  const { username, messages } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const participants = Array.from(
    new Set(
      [username, ...messages.map((m) => m.username)].filter(
        (u) => u && u !== "System"
      )
    )
  );

  return (
    <div
      className="flex min-h-screen overflow-hidden"
      style={{ backgroundColor: "var(--bg)" }}
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
        className="flex flex-col flex-1 min-h-0"
        style={{ color: "var(--text)" }}
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
