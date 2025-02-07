import React from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import "./ChatSidebar.scss";

interface ChatThread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
}

interface ChatSidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onThreadDelete: (threadId: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  threads,
  activeThreadId,
  onThreadSelect,
  onThreadDelete,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const handleDelete = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
      onThreadDelete(threadId);
    }
  };

  return (
    <div className="threads-list">
      {threads.length === 0 ? (
        <div className="no-threads">
          <MessageSquare size={24} className="opacity-50" />
          <p>No chat history yet</p>
        </div>
      ) : (
        threads.map((thread) => (
          <div key={thread.id} className="thread-item-container">
            <button
              className={`thread-item ${
                activeThreadId === thread.id ? "active" : ""
              }`}
              onClick={() => onThreadSelect(thread.id)}
            >
              <div className="thread-main">
                <MessageSquare size={16} />
                <div className="thread-content">
                  <div className="thread-title">{thread.title}</div>
                  <div className="thread-preview">{thread.lastMessage}</div>
                </div>
              </div>
              <div className="thread-time">{formatDate(thread.timestamp)}</div>
            </button>
            <button
              className="delete-button"
              onClick={(e) => handleDelete(e, thread.id)}
              title="Delete chat"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatSidebar;
