import ChatBubble from "./ChatBubble";
import { useChat } from "../context/ChatContext";

const MessageList = () => {
  const {
    messages,
    username,
    editingId,
    editingText,
    setEditingText,
    saveEdit,
    cancelEditing,
    startEditingMessage,
    deleteMessage,
    messagesEndRef,
  } = useChat();

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0 bg-(--bg)"
    >
      {messages.map((msg) => {
        if (msg.type === "status") {
          return (
            <div key={msg.id} className="flex justify-center">
              <div
                className="text-sm italic px-3 py-1 rounded-full text-(--status-text) bg-(--status-bg)"
              >
                {msg.text}
              </div>
            </div>
          );
        }

        const isOwn = msg.username === username;
        const isEditing = editingId === msg.id && isOwn;
        const time = new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={msg.id}
            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <ChatBubble
              text={isEditing ? editingText : msg.text}
              time={time}
              isOwn={isOwn}
              edited={msg.edited}
              seen={msg.seen}
              showActions={isOwn && !isEditing}
              isEditing={isEditing}
              editValue={editingText}
              onEditChange={setEditingText}
              onEditSave={saveEdit}
              onEditCancel={cancelEditing}
              onEdit={() => startEditingMessage(msg)}
              onDelete={() => deleteMessage(msg)}
            />
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
