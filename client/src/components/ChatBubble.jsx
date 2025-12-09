import { CopyIcon, Edit, EllipsisVertical, Trash, Trash2 } from "lucide-react";
import { useState } from "react";

const ChatBubble = ({
  text,
  time = "12:34",
  isOwn = false,
  showActions = true,
  isEditing = false,
  editValue = "",
  edited = false,
  seen = false,
  onEditChange,
  onEditSave,
  onEditCancel,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleEdit = onEdit ?? (() => {});
  const handleDelete = onDelete ?? (() => {});
  const handleEditChange = onEditChange ?? (() => {});
  const handleEditSave = onEditSave ?? (() => {});
  const handleEditCancel = onEditCancel ?? (() => {});
  const bubbleTextColor = isOwn ? "#0f172a" : "#0f172a";
  const bubbleMutedColor = isOwn ? "#1f2937" : "#475569";

  return (
    <div
      className={`flex w-full mb-2 ${isOwn ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
    >
      <div
        className={`
          relative max-w-[75%] px-3 py-2 text-sm shadow-sm
          rounded-2xl text-[#0f172a]
          ${isOwn ? "bg-[#dcf8c6] rounded-br-sm" : "bg-white rounded-bl-sm"}
        `}
      >
        {/* Message actions */}
        {showActions && !isEditing && (
          <>
            <button
              type="button"
              aria-label="Message actions"
              className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors cursor-pointer ${
                isOwn ? "right-[calc(100%+4px)]" : "left-[calc(100%+4px)]"
              }`}
              style={{
                opacity: isHovered || isMenuOpen ? 1 : 0.6,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
            >
              <EllipsisVertical className="w-5 h-5 text-white" />
            </button>

            {isMenuOpen && (
              <div
                className={`absolute top-0 flex flex-col min-w-[140px] rounded-xl border shadow-lg text-sm overflow-hidden border-(--border) text-(--text) bg-(--panel) ${
                  isOwn ? "right-[calc(100%+8px)]" : "left-[calc(100%+8px)]"
                }`}
              >
                <button
                  type="button"
                  className="text-left px-4 py-2 hover:bg-blue-50 transition-colors cursor-pointer bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(text);
                    setIsMenuOpen(false);
                  }}
                >
                  <CopyIcon className="inline-block w-4 h-4 mr-2" />
                  Copy
                </button>
                <button
                  type="button"
                  className="text-left px-4 py-2 hover:bg-blue-50 transition-colors cursor-pointer bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    handleEdit();
                  }}
                >
                  <Edit className="inline-block w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  type="button"
                  className="text-left px-4 py-2 hover:bg-red-50 text-red-500 transition-colors cursor-pointer bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    handleDelete();
                  }}
                >
                  <Trash2 className="inline-block w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </>
        )}

        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              className="w-full rounded-md border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 border-(--border)"
              style={{
                backgroundColor: "transparent",
                color: bubbleTextColor,
                caretColor: bubbleTextColor,
                minHeight: "96px",
              }}
              value={editValue}
              onChange={(e) => handleEditChange(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end text-xs">
              <button
                type="button"
                className="px-3 py-1 rounded-full border border-(--border) bg-transparent transition-colors"
                style={{
                  color: bubbleTextColor,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditCancel();
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditSave();
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Message text */}
            <p
              className="whitespace-pre-line wrap-break-word pr-10"
              style={{ color: bubbleTextColor }}
            >
              {text}
            </p>

            {/* Time + ticks */}
            <div
              className="mt-1 flex items-center justify-end gap-1 text-[0.65rem]"
              style={{ color: bubbleMutedColor }}
            >
              <span>{time}</span>
              {edited && <span className="ml-1 italic">(edited)</span>}
              {isOwn && (
                <svg
                  viewBox="0 0 16 15"
                  className="h-3 w-3"
                  aria-hidden="true"
                  style={{ color: seen ? "#2563eb" : bubbleMutedColor }}
                >
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
          </>
        )}

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
