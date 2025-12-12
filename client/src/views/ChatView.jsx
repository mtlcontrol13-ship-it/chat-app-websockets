import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useChat } from "../context/ChatContext";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";

const ChatView = ({ onChatOpen }) => {
  const { participantId } = useParams();
  const navigate = useNavigate();
  const { user, companyParticipants } = useChat();

  // Close sidebar when opening a chat on mobile
  useEffect(() => {
    if (onChatOpen) {
      onChatOpen();
    }
  }, [participantId, onChatOpen]);

  // Find the participant being chatted with
  const participant = companyParticipants.find(p => p._id === participantId);

  if (!participant) {
    return (
      <div className="flex h-screen items-center justify-center bg-(--bg) text-(--text)">
        <div className="text-center">
          <p className="mb-4">Participant not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Back to Chat List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 text-(--text)">
      <div className="px-4 py-4 border-b border-(--border) bg-(--panel) flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-(--bg) rounded-lg transition-colors lg:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{participant.userName}</h2>
          <p className="text-xs text-green-500 font-medium">Online • {participant.role}</p>
        </div>
      </div>
      
      <MessageList participantId={participantId} />
      <MessageInput participantId={participantId} />
    </div>
  );
};

export default ChatView;
