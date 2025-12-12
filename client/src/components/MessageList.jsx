import ChatBubble from "./ChatBubble";
import { useChat } from "../context/ChatContext";
import { useEffect, useRef } from "react";

const MessageList = ({ participantId }) => {
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

  const containerRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, participantId]);

  // Filter messages for this participant conversation
  // In individual chat mode: only show messages that involve this participant
  // A message is relevant if:
  //   1. It was sent by this user (message doesn't have participantId, or participantId matches)
  //   2. It was sent TO this user (message.participantId matches this participant's ID)
  // In global mode: show all messages
  const participantMessages = participantId 
    ? messages.filter(msg => {
        // Skip system messages for individual chats
        if (msg.type === "status") return false;
        // Show messages that belong to this conversation:
        // Either the message is from us (no participantId set) OR it's sent to this participant
        return !msg.participantId || msg.participantId === participantId;
      })
    : messages;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0 bg-(--bg) flex flex-col"
    >
      {participantMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-(--muted) text-sm">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : null}
      {participantMessages.map((msg) => {
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
