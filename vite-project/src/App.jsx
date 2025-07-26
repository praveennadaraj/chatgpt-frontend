import React, { useState, useEffect, useRef } from "react";
import { Input } from "antd";
import {
  ArrowUpOutlined,
  DeleteOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Sidebar from "./Sidebar";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const chatContainer = useRef(null);

  const deleteMessage = async (id) => {
    if (id.startsWith("temp-")) {
      setMessages((prev) => prev.filter((msg) => msg?._id !== id));
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/delete/${id}`);

      setMessages((prev) => prev.filter((msg) => msg?._id !== id));

      if (currentSessionId) {
        const res = await axios.get(
          `http://localhost:5000/api/history/${currentSessionId}`
        );
        setMessages(res?.data?.messages);
      }
    } catch (err) {
      console.log("Failed to delete message", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const sessionId = currentSessionId || new Date().toISOString();
    setCurrentSessionId(sessionId);
    const tempUserId = `temp-user-${Date.now()}`;
    const tempBotId = `temp-bot-${Date.now()}`;
    const tempUserMsg = { _id: tempUserId, type: "user", text: input };
    const tempBotMsg = { _id: tempBotId, type: "bot", text: "Loading..." };
    setMessages((prev) => [...prev, tempUserMsg, tempBotMsg]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: input,
        sessionId,
      });

      const user = res?.data?.user;
      const bot = res?.data?.bot;

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === tempUserId) return user;
          if (msg._id === tempBotId) return bot;
          return msg;
        })
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempBotId
            ? { ...msg, text: "Unable to get data from API" }
            : msg
        )
      );
    }
  };

  const renameSession = async (sessionId) => {
    try {
      await axios.put(`http://localhost:5000/api/rename/${sessionId}`, {
        newName: editedName,
      });
      const updated = sessions.map((s) =>
        s._id === sessionId ? { ...s, firstMessage: editedName } : s
      );
      setSessions(updated);
      setEditingSessionId(null);
    } catch (err) {
      console.error("Failed to rename session", err);
    }
  };

  const loadSessionMessages = async (sessionId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/history/${sessionId}`
      );
      setMessages(res?.data?.messages);
      setCurrentSessionId(sessionId);
    } catch (err) {
      console.error("Failed to load session", err);
    }
  };

  useEffect(() => {
    if (chatContainer.current) {
      chatContainer.current.scrollTo({
        top: chatContainer.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/sessions")
      .then((res) => {
        setSessions(res?.data?.sessions);
      })
      .catch((err) => console.error("Failed to load sessions", err));
  }, []);

  return (
    <div className="h-screen flex flex-col md:flex-row font-sans">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        setMessages={setMessages}
        setCurrentSessionId={setCurrentSessionId}
        drawerVisible={drawerVisible}
        setDrawerVisible={setDrawerVisible}
        editingSessionId={editingSessionId}
        setEditingSessionId={setEditingSessionId}
        editedName={editedName}
        setEditedName={setEditedName}
        renameSession={renameSession}
        loadSessionMessages={loadSessionMessages}
      />

      <div className="flex-1 flex flex-col bg-gray-200 h-full">
        <div className="bg-gray-900 p-4 text-white shadow-md sticky top-0 z-10 flex justify-between items-center ">
          <h1 className="text-2xl font-semibold">ChatGPT lite</h1>
          <div className="block md:hidden">
            <MenuOutlined
              onClick={() => setDrawerVisible(true)}
              className="text-white text-2xl cursor-pointer"
            />
          </div>
        </div>

        <div
          ref={chatContainer}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center min-h-[60vh]">
              <h1 className="font-bold text-gray-800 text-2xl sm:text-3xl text-center">
                What's on your mind today?
              </h1>
              <div className="mt-4 w-full max-w-md bg-gray-200 flex gap-2 p-3 rounded-lg">
                <Input
                  value={input}
                  onChange={(e) => setInput(e?.target?.value)}
                  onPressEnter={sendMessage}
                  placeholder="Ask me anything..."
                  size="large"
                  className="flex-1"
                />
                <ArrowUpOutlined
                  className="bg-gray-500 text-white p-3 rounded-full hover:bg-gray-600 cursor-pointer"
                  onClick={sendMessage}
                />
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`relative max-w-full sm:max-w-lg px-4 py-3 rounded-xl shadow ${
                  msg.type === "user"
                    ? "bg-gray-600 text-white ml-auto rounded-br-none"
                    : "bg-gray-300 text-gray-800 mr-auto rounded-bl-none"
                }`}
              >
                <div className="mb-1">
                  {msg.type === "user" ? "🧑:" : "🤖:"}
                </div>
                <DeleteOutlined
                  className="absolute top-2 right-2 cursor-pointer"
                  onClick={() => deleteMessage(msg?._id)}
                />
                <div className="whitespace-pre-wrap break-words">
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        {messages.length > 0 && (
          <div className="bg-gray-200 p-4 sticky bottom-0 z-10">
            <div className="flex gap-2 max-w-full sm:max-w-2xl mx-auto">
              <Input
                value={input}
                onChange={(e) => setInput(e?.target?.value)}
                onPressEnter={sendMessage}
                placeholder="Ask me anything..."
                size="large"
                className="flex-1"
              />
              <ArrowUpOutlined
                className="bg-gray-500 text-white p-3 rounded-full hover:bg-gray-600 cursor-pointer"
                onClick={sendMessage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
