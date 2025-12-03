
import { useState } from "react";
import { EllipsisVertical } from "lucide-react";

const ChatBubble = ({
  text,
  time = "12:34",
  isOwn = false,
  showActions = true,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const handleEdit = onEdit ?? (() => {});
  const handleDelete = onDelete ?? (() => {});

  return (
    <div
      className={`flex w-full mb-2 ${isOwn ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          relative max-w-[75%] px-3 py-2 text-sm shadow-sm
          rounded-2xl 
          ${isOwn ? "bg-[#dcf8c6] rounded-br-sm" : "bg-white rounded-bl-sm"}
        `}
      >
        {/* Message actions */}
        {isHovered && showActions && (
          <div
            className={`absolute -top-3 ${
              isOwn ? "right-0" : "left-0"
            } flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm text-xs`}
            style={{
              backgroundColor: isOwn ? "#d4edba" : "#ffffff",
              borderColor: "#d1d5db",
              color: "#475569",
            }}
          >
            <EllipsisVertical className="w-4 h-4 opacity-70" />
            <button
              type="button"
              className="hover:text-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="hover:text-red-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              Delete
            </button>
          </div>
        )}

        {/* Message text */}
        <p className="whitespace-pre-line wrap-break-word pr-10 text-[#111b21]">
          {text}
        </p>

        {/* Time + ticks */}
        <div className="mt-1 flex items-center justify-end gap-1 text-[0.65rem] text-gray-500">
          <span>{time}</span>
          {isOwn && (
            <svg viewBox="0 0 16 15" className="h-3 w-3" aria-hidden="true">
              <path
                d="M1 8.5 4.5 12.5 11 1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M5.5 8.5 9 12.5 15 1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>
          )}
        </div>

        {/* Tail */}
        <span
          className={`
            absolute bottom-0 w-2 h-2 rotate-45
            ${
              isOwn
                ? "right-1 translate-x-1 bg-[#dcf8c6]"
                : "left-1 -translate-x-1 bg-white"
            }
          `}
        />
      </div>
    </div>
  );
};

export default ChatBubble;
