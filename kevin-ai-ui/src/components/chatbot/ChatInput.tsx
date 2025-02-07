import React, { ChangeEvent, KeyboardEvent, useRef } from "react";
import { Plus, Send, Trash2 } from "lucide-react";
import Button from "../common/Button";

interface ChatInputProps {
  input: string;
  loading: boolean;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onNewChat: () => void;
  onClearChat: () => void;
  messagesExist: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  loading,
  onInputChange,
  onKeyPress,
  onSend,
  onNewChat,
  onClearChat,
  messagesExist,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="chat-input-container">
      <Button
        onClick={onNewChat}
        icon={Plus}
        variant="secondary"
        title="New chat"
      />
      <Button
        onClick={onClearChat}
        icon={Trash2}
        variant="secondary"
        title="Clear chat"
        disabled={!messagesExist}
      />
      <input
        ref={inputRef}
        type="text"
        className="chat-input"
        value={input}
        onChange={onInputChange}
        onKeyDown={onKeyPress}
        placeholder="Type your message here..."
        disabled={loading}
      />
      <Button
        onClick={onSend}
        icon={Send}
        variant="primary"
        disabled={!input.trim() || loading}
        title="Send message"
      />
    </div>
  );
};

export default ChatInput;
