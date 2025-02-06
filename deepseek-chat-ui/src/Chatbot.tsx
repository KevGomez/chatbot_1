import React, {
  useState,
  ChangeEvent,
  KeyboardEvent,
  useRef,
  useEffect,
} from "react";
import axios from "axios";
import {
  Send,
  Bot,
  User,
  Loader2,
  MessageSquare,
  Plus,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  ref,
  push,
  set,
  onValue,
  update,
  serverTimestamp,
  query,
  orderByChild,
  remove,
} from "firebase/database";
import { database } from "./firebase";
import ChatSidebar from "./components/ChatSidebar";
import "./Chatbot.scss";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatThread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messages: Message[];
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Load chat threads from Firebase
  useEffect(() => {
    const threadsRef = ref(database, "threads");
    const threadsQuery = query(threadsRef, orderByChild("timestamp"));

    const unsubscribe = onValue(threadsQuery, (snapshot) => {
      const loadedThreads: ChatThread[] = [];
      snapshot.forEach((childSnapshot) => {
        const threadData = childSnapshot.val();
        loadedThreads.push({
          id: childSnapshot.key!,
          title: threadData.title,
          lastMessage: threadData.lastMessage,
          timestamp: threadData.timestamp,
          messages: threadData.messages
            ? Object.values(threadData.messages)
            : [],
        });
      });
      setThreads(loadedThreads.reverse()); // Reverse to get newest first
    });

    return () => {
      // Cleanup subscription
      unsubscribe();
    };
  }, []);

  // Load messages when active thread changes
  useEffect(() => {
    if (activeThreadId) {
      const thread = threads.find((t) => t.id === activeThreadId);
      if (thread) {
        setMessages(thread.messages || []);
      }
    }
  }, [activeThreadId, threads]);

  const createNewThread = async () => {
    const threadsRef = ref(database, "threads");
    const newThreadRef = push(threadsRef);

    const newThread = {
      title: "New Chat",
      lastMessage: "",
      timestamp: Date.now(),
      messages: null,
    };

    try {
      await set(newThreadRef, newThread);
      setActiveThreadId(newThreadRef.key);
      setMessages([]);
      setInput("");
    } catch (error) {
      console.error("Error creating new thread:", error);
    }
  };

  const updateThread = async (
    threadId: string,
    messages: Message[],
    newTitle?: string
  ) => {
    try {
      const threadRef = ref(database, `threads/${threadId}`);
      const updates: any = {
        lastMessage: messages[messages.length - 1]?.content || "",
        timestamp: Date.now(),
        messages: messages.length > 0 ? messages : null,
      };

      if (newTitle) {
        updates.title = newTitle;
      }

      await update(threadRef, updates);
    } catch (error) {
      console.error("Error updating thread:", error);
    }
  };

  const handleNewChat = () => {
    createNewThread();
    setShowOptions(false);
  };

  const handleClearChat = async () => {
    if (activeThreadId && messages.length > 0) {
      if (
        window.confirm(
          "Are you sure you want to clear all messages? This will delete the entire chat thread."
        )
      ) {
        try {
          // Remove the entire thread from the database
          const threadRef = ref(database, `threads/${activeThreadId}`);
          await remove(threadRef);

          // Clear local state
          setMessages([]);
          setInput("");
          setActiveThreadId(null); // Reset active thread
        } catch (error) {
          console.error("Error removing thread:", error);
        }
      }
    }
    setShowOptions(false);
  };

  const handleThreadSelect = (threadId: string) => {
    setActiveThreadId(threadId);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!activeThreadId) {
      const threadsRef = ref(database, "threads");
      const newThreadRef = push(threadsRef);

      try {
        const newThread = {
          title: "New Chat",
          lastMessage: input.trim(),
          timestamp: Date.now(),
          messages: null,
        };
        await set(newThreadRef, newThread);
        setActiveThreadId(newThreadRef.key);
        console.log("Created new thread:", newThreadRef.key);
      } catch (error) {
        console.error("Error creating new thread:", error);
        return;
      }
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      if (messages.length === 0) {
        const title =
          input.trim().length > 30
            ? input.trim().substring(0, 30) + "..."
            : input.trim();
        await updateThread(activeThreadId!, updatedMessages, title);
      } else {
        await updateThread(activeThreadId!, updatedMessages);
      }
      console.log("Updated thread with user message");

      setInput("");
      setLoading(true);

      console.log("Sending message to API:", input.trim());
      const response = await axios.post<{ response: string }>(
        "http://127.0.0.1:5000/chat",
        { message: input.trim() }
      );
      console.log("Received API response:", response.data);

      const botMessage: Message = {
        role: "assistant",
        content: response.data.response,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      await updateThread(activeThreadId!, finalMessages);
      console.log("Updated thread with bot response");
    } catch (error) {
      console.error("Error in message flow:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      await updateThread(activeThreadId!, finalMessages);
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

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(timestamp));
  };

  return (
    <>
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        threads={threads}
        activeThreadId={activeThreadId}
        onThreadSelect={handleThreadSelect}
        onNewThread={handleNewChat}
      />

      <div className={`chat-container ${isSidebarOpen ? "with-sidebar" : ""}`}>
        <div className="chat-header">
          <div />
          <div className="header-content">
            <Bot size={28} />
            <span>ChatBot by Kevin Gomez</span>
          </div>
          <div className="header-options" ref={optionsRef}>
            <button
              className="options-button"
              onClick={() => setShowOptions(!showOptions)}
              title="Chat options"
            >
              <MoreVertical size={24} />
            </button>
            {showOptions && (
              <div className="options-menu">
                <button onClick={handleNewChat} className="menu-item">
                  <Plus size={16} />
                  New Chat
                </button>
                <button onClick={handleClearChat} className="menu-item">
                  <Trash2 size={16} />
                  Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="chat-box">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
              <MessageSquare size={48} className="opacity-50" />
              <div className="text-xl font-medium">
                Welcome to ChatBot by Kevin Gomez
              </div>
              <p className="text-sm max-w-md">
                I'm your AI assistant to answer any questions you have powered
                by DeepSeek R1 Model
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
          <button
            onClick={handleNewChat}
            className="action-button secondary"
            title="New chat"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={handleClearChat}
            className="action-button secondary"
            title="Clear chat"
            disabled={messages.length === 0}
          >
            <Trash2 size={20} />
          </button>
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
            className="action-button primary"
            disabled={!input.trim() || loading}
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
