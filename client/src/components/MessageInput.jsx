import { Send } from "lucide-react";
import { useChat } from "../context/ChatContext";

const MessageInput = () => {
  const { input, setInput, sendMessage, isConnected } = useChat();

  return (
    <form
      onSubmit={sendMessage}
      className="border-t p-4 bg-[var(--panel)] border-[var(--border)]"
    >
      <div className="flex gap-3 max-w-4xl mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          disabled={!isConnected}
          className="flex-1 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[var(--input-bg)] text-[var(--text)] border border-[var(--input-border)]"
          autoFocus
        />
        <button
          type="submit"
          disabled={!isConnected || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
