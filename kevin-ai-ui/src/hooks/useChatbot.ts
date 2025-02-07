import { useState, useEffect } from "react";
import {
  ref,
  push,
  set,
  onValue,
  update,
  remove,
  query,
  orderByChild,
} from "firebase/database";
import { database } from "../config/firebase";
import { sendMessage as sendMessageApi } from "../api/chatService";
import { ChatMessage, ChatThread } from "../types";

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

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
      setThreads(loadedThreads.reverse());
    });

    return () => unsubscribe();
  }, []);

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
    messages: ChatMessage[],
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

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (!activeThreadId) {
      await createNewThread();
    }

    const userMessage: ChatMessage = {
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

      setInput("");
      setLoading(true);

      const response = await sendMessageApi(input.trim());

      const botMessage: ChatMessage = {
        role: "assistant",
        content: response.response,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      await updateThread(activeThreadId!, finalMessages);
    } catch (error) {
      console.error("Error in message flow:", error);
      const errorMessage: ChatMessage = {
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

  const handleClearChat = async () => {
    if (activeThreadId && messages.length > 0) {
      try {
        const threadRef = ref(database, `threads/${activeThreadId}`);
        await remove(threadRef);
        setMessages([]);
        setInput("");
        setActiveThreadId(null);
      } catch (error) {
        console.error("Error removing thread:", error);
      }
    }
  };

  return {
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
  };
};

export default useChatbot;
