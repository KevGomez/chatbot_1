import React, {
  useState,
  ChangeEvent,
  KeyboardEvent,
  useRef,
  useEffect,
} from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  MessageSquare,
  Plus,
  Trash2,
  MoreVertical,
  LogOut,
  UserCircle,
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
import axiosInstance from "./api/axiosInstance";
import "./Chatbot.scss";
import { useAuth } from "./context/AuthContext";

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
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const { logout, user } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement>(null);

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

  // Add click outside handler for profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add effect to handle sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

    // Ensure we have an active thread before sending message
    let currentThreadId = activeThreadId;
    if (!currentThreadId) {
      // Create a new thread if we don't have one
      const threadsRef = ref(database, "threads");
      const newThreadRef = push(threadsRef);
      currentThreadId = newThreadRef.key!;

      // Format the title from the first message
      const messageTitle = input.trim();
      const truncatedTitle =
        messageTitle.length > 50
          ? messageTitle.substring(0, 47) + "..."
          : messageTitle;

      const newThread = {
        title: truncatedTitle,
        lastMessage: input.trim(),
        timestamp: serverTimestamp(),
        messages: null,
      };

      try {
        await set(newThreadRef, newThread);
        setActiveThreadId(currentThreadId);
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
    setInput("");
    setLoading(true);

    try {
      // Update thread with user message first
      await updateThread(currentThreadId, updatedMessages);

      // Send message to API
      console.log("Sending message to API:", input.trim());
      const response = await axiosInstance.post<{ response: string }>("/chat", {
        message: input.trim(),
      });
      console.log("Received API response:", response.data);

      // Add bot response
      const botMessage: Message = {
        role: "assistant",
        content: response.data.response,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      await updateThread(currentThreadId, finalMessages);

      // Scroll to bottom
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error in message flow:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      await updateThread(currentThreadId, finalMessages);
    } finally {
      setLoading(false);
    }
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

  const formatMessageContent = (content: string) => {
    if (!content) return null;

    return (
      <div className="message-text">
        {content.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Router will handle redirect to login page
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <div className="chatbot-container">
      <div className={`chat-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <button className="new-chat-button" onClick={handleNewChat}>
            <Plus size={20} />
            New Chat
          </button>
        </div>
        <ChatSidebar
          threads={threads}
          activeThreadId={activeThreadId}
          onThreadSelect={handleThreadSelect}
          onThreadDelete={handleClearChat}
        />
      </div>

      <div className={`chat-main ${isSidebarOpen ? "with-sidebar" : ""}`}>
        <div className="chat-header">
          <div className="header-left">
            <button
              className="toggle-sidebar-button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <MessageSquare size={24} />
            </button>
            <button
              className="new-chat-button"
              onClick={handleNewChat}
              title="New chat"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="header-content">
            <Bot size={32} />
            <div className="header-titles">
              <span className="title">Kevin AI</span>
              <span className="subtitle">Your Personal Finance Advisor</span>
            </div>
          </div>

          <div className="profile-menu-container" ref={profileMenuRef}>
            <button
              className="profile-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <UserCircle size={24} />
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <span className="user-email">{user?.email}</span>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="chat-box">
          {messages.length === 0 ? (
            <div className="empty-state">
              <Bot size={48} className="icon" />
              <h3>Welcome to Kevin AI</h3>
              <p>Your personal finance advisor powered by OpenAI</p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    msg.role === "user" ? "user-message" : "bot-message"
                  }`}
                >
                  <div className="message-header">
                    {msg.role === "user" ? (
                      <User size={16} className="message-icon" />
                    ) : (
                      <Bot size={16} className="message-icon" />
                    )}
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-content">
                    {formatMessageContent(msg.content)}
                  </div>
                </div>
              ))}
            </>
          )}

          {loading && (
            <div className="loading-text">
              <Loader2 className="animate-spin" size={18} />
              <span>Thinking...</span>
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
            className="action-button primary"
            disabled={!input.trim() || loading}
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
