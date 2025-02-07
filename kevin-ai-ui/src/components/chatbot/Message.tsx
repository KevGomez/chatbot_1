import React from "react";
import { Bot, User } from "lucide-react";
import { ChatMessage } from "../../types";

interface MessageProps {
  message: ChatMessage;
  formatTime: (timestamp: number) => string;
  formatMessageContent: (content: string) => React.ReactNode;
}

const Message: React.FC<MessageProps> = ({
  message,
  formatTime,
  formatMessageContent,
}) => {
  return (
    <div
      className={`chat-message ${
        message.role === "user" ? "user-message" : "bot-message"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {message.role === "user" ? (
          <User size={18} className="opacity-70" />
        ) : (
          <Bot size={18} className="opacity-70" />
        )}
        <span className="text-xs opacity-70">
          {formatTime(message.timestamp)}
        </span>
      </div>
      {message.role === "user" ? (
        <div className="message-content">{message.content}</div>
      ) : (
        formatMessageContent(message.content)
      )}
    </div>
  );
};

export default Message;
