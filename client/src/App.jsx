// App.jsx
import { ChatProvider, useChat } from "./context/ChatContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";

const AppContent = () => {
  const { username, messages } = useChat();

  const participants = Array.from(
    new Set(
      [username, ...messages.map((m) => m.username)].filter(
        (u) => u && u !== "System"
      )
    )
  );

  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Sidebar
        participants={participants}
      />
      <div className="flex flex-col flex-1" style={{ color: "var(--text)" }}>
        <Header />
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
