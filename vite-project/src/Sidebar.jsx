import React from "react";
import { Drawer, Input } from "antd";

const Sidebar = ({
  sessions,
  currentSessionId,
  setMessages,
  setCurrentSessionId,
  drawerVisible,
  setDrawerVisible,
  editingSessionId,
  setEditingSessionId,
  editedName,
  setEditedName,
  renameSession,
  loadSessionMessages,
}) => {
  const handleNewChat = () => {
    const newId = new Date().toISOString();
    setMessages([]);
    setCurrentSessionId(newId);
    setDrawerVisible(false);
  };

  const renderSessionItem = (s) => (
    <div
      key={s._id}
      className={`relative group p-2 rounded mb-2 ${
        s._id === currentSessionId ? "bg-gray-700" : "hover:bg-gray-800"
      }`}
    >
      {editingSessionId === s._id ? (
        <div className="flex gap-1">
          <Input
            size="small"
            value={editedName}
            onChange={(e) => setEditedName(e?.target?.value)}
            onPressEnter={() => renameSession(s?._id)}
            onBlur={() => setEditingSessionId(null)}
            autoFocus
          />
        </div>
      ) : (
        <div
          className="flex justify-between items-center"
          onClick={() => {
            loadSessionMessages(s?._id);
            setDrawerVisible(false);
          }}
        >
          <span className="truncate max-w-[160px]">
            {s.firstMessage ? s.firstMessage.slice(0, 30) : "New Chat"}
          </span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              setEditedName(s?.firstMessage || "New Chat");
              setEditingSessionId(s?._id);
            }}
            className="text-sm text-gray-400 hover:text-white ml-2 cursor-pointer"
          >
            Edit
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Drawer
        title="Chat History"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={250}
        className="md:hidden"
      >
        <button
          onClick={handleNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-4"
        >
          + New Chat
        </button>
        {sessions.map(renderSessionItem)}
      </Drawer>

      <div className="hidden md:block w-64 bg-gray-900 text-white p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chat History</h2>
        <button
          onClick={handleNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-4"
        >
          + New Chat
        </button>
        {sessions.map(renderSessionItem)}
      </div>
    </>
  );
};

export default Sidebar;
