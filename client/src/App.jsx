import { ChatProvider, useChat } from "./context/ChatContext";
import ChatLayout from "./layout/ChatLayout";

export default function App() {
  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  );
}
