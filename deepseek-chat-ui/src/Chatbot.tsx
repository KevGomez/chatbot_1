import React, {
  useState,
  ChangeEvent,
  KeyboardEvent,
  useRef,
  useEffect,
} from "react";
import axios from "axios";
import { Send, Bot, User, Loader2, MessageSquare } from "lucide-react";
import "./Chatbot.scss";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post<{ response: string }>(
        "http://127.0.0.1:5000/chat",
        { message: input }
      );

      const botMessage: Message = {
        role: "assistant",
        content: response.data.response,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setLoading(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <Bot size={28} />
        ChatBot by Kevin Gomez
      </div>

      <div className="chat-box">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
            <MessageSquare size={48} className="opacity-50" />
            <div className="text-xl font-medium">
              Welcome to ChatBot by Kevin Gomez
            </div>
            <p className="text-sm max-w-md">
              I'm your AI assistant to answer any questions you have powered by
              DeepSeek R1 Model
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.role === "user" ? "user-message" : "bot-message"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {msg.role === "user" ? (
                <User size={18} className="opacity-70" />
              ) : (
                <Bot size={18} className="opacity-70" />
              )}
              <span className="text-xs opacity-70">
                {formatTime(msg.timestamp)}
              </span>
            </div>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className="loading-text">
            <Loader2 className="animate-spin inline-block mr-2" size={18} />
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Type your message here..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="send-button"
          disabled={!input.trim() || loading}
          title="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
