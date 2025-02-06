import React from "react";
import {
  MessageSquare,
  Plus,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import "./ChatSidebar.scss";

interface ChatThread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  threads: ChatThread[];
  activeThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onNewThread: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onToggle,
  threads,
  activeThreadId,
  onThreadSelect,
  onNewThread,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className={`chat-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>Chat History</h2>
        <button
          className="toggle-button"
          onClick={onToggle}
          title={isOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {isOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </div>

      <button className="new-chat-button" onClick={onNewThread}>
        <Plus size={16} />
        New Chat
      </button>

      <div className="threads-list">
        {threads.length === 0 ? (
          <div className="no-threads">
            <MessageSquare size={24} className="opacity-50" />
            <p>No chat history yet</p>
          </div>
        ) : (
          threads.map((thread) => (
            <button
              key={thread.id}
              className={`thread-item ${
                activeThreadId === thread.id ? "active" : ""
              }`}
              onClick={() => onThreadSelect(thread.id)}
            >
              <MessageSquare size={16} />
              <div className="thread-content">
                <div className="thread-title">{thread.title}</div>
                <div className="thread-preview">{thread.lastMessage}</div>
              </div>
              <div className="thread-time">{formatDate(thread.timestamp)}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
