import { CopyIcon, Edit, EllipsisVertical, Trash2, Check, CheckCheck } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
  
  const handleEdit = onEdit ?? (() => {});
  const handleDelete = onDelete ?? (() => {});
  const handleEditChange = onEditChange ?? (() => {});
  const handleEditSave = onEditSave ?? (() => {});
  const handleEditCancel = onEditCancel ?? (() => {});
  
  const bubbleTextColor = isOwn ? "#ffffff" : "#0f172a";
  const bubbleMutedColor = isOwn ? "rgba(255,255,255,0.8)" : "#475569";

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setIsMenuOpen(false);
  };

  const bubbleWidthClass = isEditing
    ? "w-full max-w-[min(720px,90vw)] min-w-[320px]"
    : "max-w-[75%]";

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
          relative ${bubbleWidthClass} px-4 py-2 text-sm shadow-md
          rounded-2xl text-[#0f172a] transition-all duration-200
          ${isOwn 
            ? "bg-[#2563eb] rounded-br-sm hover:shadow-lg" 
            : "bg-[#e0ecff] rounded-bl-sm hover:shadow-lg"
          }
        `}
      >
        {/* Message actions */}
        {showActions && !isEditing && (
          <>
            <button
              type="button"
              aria-label="Message actions"
              className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-full transition-all cursor-pointer ${
                isOwn ? "right-[calc(100%+8px)]" : "left-[calc(100%+8px)]"
              } opacity-100 hover:bg-gray-300/50`}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
            >
              <EllipsisVertical className="w-5 h-5 text-[var(--muted)]" />
            </button>

            {isMenuOpen && (
              <div
                className={`absolute top-0 flex flex-col min-w-[150px] rounded-lg border shadow-xl text-sm overflow-hidden border-[var(--border)] text-[var(--text)] bg-[var(--panel)] z-50 ${
                  isOwn ? "right-[calc(100%+12px)]" : "left-[calc(100%+12px)]"
                }`}
              >
                <button
                  type="button"
                  className="text-left px-4 py-2.5 hover:bg-blue-600/20 transition-colors cursor-pointer bg-transparent flex items-center gap-2 border-b border-[var(--border)]"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="text-left px-4 py-2.5 hover:bg-blue-600/20 transition-colors cursor-pointer bg-transparent flex items-center gap-2 border-b border-[var(--border)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    handleEdit();
                  }}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="text-left px-4 py-2.5 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer bg-transparent flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    handleDelete();
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </>
        )}

        {isEditing ? (
          <div className="flex flex-col gap-3 w-full">
            <textarea
              className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none border-[var(--border)] bg-[#e0ecff] text-[#0f172a] placeholder:text-[#475569] min-h-[180px] max-h-[60vh]"
              value={editValue}
              onChange={(e) => handleEditChange(e.target.value)}
              rows={6}
              autoFocus
              placeholder="Edit your message..."
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl bg-white/80 hover:bg-white border border-gray-300 text-[#0f172a] transition-all font-medium text-sm shadow-sm cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditCancel();
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all font-medium text-sm shadow-sm cursor-pointer"
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
              className="whitespace-pre-line break-words pr-10 leading-relaxed"
              style={{ color: bubbleTextColor }}
            >
              {text}
            </p>

            {/* Time + ticks + edited badge */}
            <div
              className="mt-2 flex items-center justify-end gap-1.5 text-[0.7rem]"
              style={{ color: bubbleMutedColor }}
            >
              {edited && (
                <span className="italic text-[0.65rem] opacity-80">(edited)</span>
              )}
              <span className="font-medium">{time}</span>
              {isOwn && (
                <span title={seen ? "Seen" : "Delivered"}>
                  {seen ? (
                    <CheckCheck className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </span>
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
                ? "right-1 translate-x-1 bg-[#2563eb]"
                : "left-1 -translate-x-1 bg-[#e0ecff]"
            }
          `}
        />
      </div>
    </div>
  );
};

export default ChatBubble;
