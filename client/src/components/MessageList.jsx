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
  const participantMessages = participantId
    ? messages.filter((msg) => {
        if (msg.type === "status") return false;
        return !msg.participantId || msg.participantId === participantId;
      })
    : messages;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 min-h-0 bg-(--bg)"
    >
      {participantMessages.length === 0 && (
        <div className="flex items-center justify-center h-full text-(--muted) text-sm">
          <p>No messages yet. Start the conversation!</p>
        </div>
      )}

      {/* 6x6 Grid Container */}
      <div className="grid grid-cols-6 auto-rows-min gap-y-1">
        {participantMessages.map((msg) => {
          if (msg.type === "status") {
            return (
              <div key={msg.id} className="col-span-6 flex justify-center">
                <div className="text-sm italic px-3 py-1 rounded-full text-(--status-text) bg-(--status-bg)">
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
              className={`
                col-span-3
                ${
                  isOwn
                    ? "col-start-4 flex justify-end"
                    : "col-start-1 flex justify-start"
                }
              `}
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
      </div>

      {/* Spacer to ensure last message is visible */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
