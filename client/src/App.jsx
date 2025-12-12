// App.jsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ChatProvider, useChat } from "./context/ChatContext";
import Sidebar from "./components/Sidebar";
import ChatView from "./views/ChatView";
import Modal from "./components/Modal";

const ChatLayout = () => {
  const { user, isLoginModalOpen, setIsLoginModalOpen, handleLoginSuccess } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return (
      <Modal
        open={isLoginModalOpen}
        title="Login to Chat"
        actionLabel="Login"
        onClose={() => {}}
        onAction={handleLoginSuccess}
      />
    );
  }

  // User is logged in but not added to chat yet
  // if (!user.companyId) {
  //   return (
  //     <div className="flex h-screen items-center justify-center bg-(--bg) text-(--text)">
  //       <div className="text-center max-w-md mx-auto px-4">
  //         <h2 className="text-2xl font-bold mb-4">Welcome, {user.userName}!</h2>
  //         <p className="text-lg mb-6 text-(--muted)">
  //           Your account has been created successfully.
  //         </p>
  //         <div className="bg-(--panel) border border-(--border) rounded-lg p-6">
  //           <p className="text-base mb-4">
  //             Ask your admin to add you to the chat to get started.
  //           </p>
  //           <p className="text-sm text-(--muted)">
  //             Once your admin adds you, you'll be able to access the chat and connect with other participants.
  //           </p>
  //         </div>
  //         <button
  //           onClick={() => {
  //             localStorage.removeItem("user");
  //             window.location.reload();
  //           }}
  //           className="mt-8 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
  //         >
  //           Logout
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg)">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <Routes>
        <Route path="/:participantId" element={
          <ChatView onChatOpen={() => setIsSidebarOpen(false)} />
        } />
        <Route path="/" element={
          <div className="flex-1 flex items-center justify-center text-(--muted)">
            <div className="text-center">
              <p className="text-lg mb-4">Select a participant to start chatting</p>
              <p className="text-sm">Click on a participant from the sidebar</p>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  );
}
