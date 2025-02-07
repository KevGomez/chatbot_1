import React, { useRef } from "react";
import { Bot, MessageSquare } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Message from "../components/chatbot/Message";
import ChatInput from "../components/chatbot/ChatInput";
import Loader from "../components/common/Loader";
import useChatbot from "../hooks/useChatbot";
import { formatMessageContent } from "../utils/messageFormatter";
import { formatTime } from "../utils/dateFormatter";

const ChatbotPage: React.FC = () => {
  const {
    messages,
    input,
    loading,
    threads,
    activeThreadId,
    setInput,
    setActiveThreadId,
    handleSendMessage,
    handleClearChat,
    createNewThread,
  } = useChatbot();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        threads={threads}
        activeThreadId={activeThreadId}
        onThreadSelect={setActiveThreadId}
        onNewThread={createNewThread}
      />

      <div className={`chat-container ${isSidebarOpen ? "with-sidebar" : ""}`}>
        <div className="chat-header">
          <div />
          <div className="header-content">
            <Bot size={28} />
            <div className="header-titles">
              <span className="title">AI Finance Advisor</span>
              <span className="subtitle">by Kevin Gomez</span>
            </div>
          </div>
        </div>

        <div className="chat-box">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
              <MessageSquare size={48} className="opacity-50" />
              <div className="text-xl font-medium">Welcome to Kevin AI</div>
              <p className="text-sm max-w-md">
                Your personal finance advisor powered by OpenAI
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <Message
              key={index}
              message={msg}
              formatTime={formatTime}
              formatMessageContent={formatMessageContent}
            />
          ))}

          {loading && <Loader />}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput
          input={input}
          loading={loading}
          onInputChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onSend={handleSendMessage}
          onNewChat={createNewThread}
          onClearChat={handleClearChat}
          messagesExist={messages.length > 0}
        />
      </div>
    </>
  );
};

export default ChatbotPage;
