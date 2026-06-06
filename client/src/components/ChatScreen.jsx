import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import MessageInput from "./MessageInput";
import MessageBox from "./MessageBox";
import ChatList from "./ChatList";
import PeoplePanel from "./PeoplePanel";
import Toast from "./Toast";
import FollowersPanel from "./FollowersPanel";
import RequestsPanel from "./RequestsPanel";
import LoadingSpinner from "./LoadingSpinner";
import ConfirmModal from "./ConfirmModal";
import ProfilePanel from "./ProfilePanel";
import UserAvatar from "./UserAvatar";

const ChatScreen = ({ user, token, onChatActiveChange }) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [activeView, setActiveView] = useState("home");
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const socketRef = useRef(null);
  const selectedUserRef = useRef(null);
  const messagesEndRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const loadChatUsers = useCallback(() => {
    setIsLoadingChats(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/chat-users`, {
        headers: { "x-token": token },
      })
      .then((res) => {
        setChatUsers(res.data);

        if (res.data.length === 0) {
          setSelectedUser(null);
          setMessages([]);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoadingChats(false));
  }, [token]);

  const loadRequests = useCallback(() => {
    const headers = { "x-token": token };

    axios
      .get(`${process.env.REACT_APP_API_URL}/connections/pending`, { headers })
      .then((res) => setIncomingRequests(res.data))
      .catch((err) => console.log(err));

    axios
      .get(`${process.env.REACT_APP_API_URL}/users`, { headers })
      .then((res) => {
        const requestedUsers = res.data.filter((person) => {
          return (
            person.connectionStatus === "pending" &&
            person.connectionDirection === "sent"
          );
        });

        setSentRequests(requestedUsers);
      })
      .catch((err) => console.log(err));
  }, [token]);

  const refreshSocialData = useCallback(() => {
    loadChatUsers();
    loadRequests();
  }, [loadChatUsers, loadRequests]);

  const updateUserOnlineStatus = useCallback((userId, isOnline) => {
    setChatUsers((prev) =>
      prev.map((chatUser) =>
        chatUser._id === userId ? { ...chatUser, isOnline } : chatUser
      )
    );

    setSelectedUser((prev) =>
      prev?._id === userId ? { ...prev, isOnline } : prev
    );
  }, []);

  const markChatAsRead = useCallback((senderId) => {
    if (!senderId) return;

    setChatUsers((prev) =>
      prev.map((chatUser) =>
        chatUser._id === senderId ? { ...chatUser, unreadCount: 0 } : chatUser
      )
    );

    axios
      .put(
        `${process.env.REACT_APP_API_URL}/messages/${senderId}/read`,
        {},
        { headers: { "x-token": token } }
      )
      .catch((err) => console.log(err));
  }, [token]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
    onChatActiveChange?.(Boolean(selectedUser));
  }, [onChatActiveChange, selectedUser]);

  useEffect(() => {
    loadChatUsers();
    loadRequests();

    socketRef.current = io(process.env.REACT_APP_API_URL, {
      auth: { token },
    });

    socketRef.current.on("chat:new-message", (message) => {
      const activeUser = selectedUserRef.current;
      const senderId = message.sender?._id;
      const receiverId = message.receiver?._id;
      const isIncomingMessage = receiverId === user?._id;

      if (isIncomingMessage && activeUser?._id !== senderId) {
        setChatUsers((prev) =>
          prev.map((chatUser) =>
            chatUser._id === senderId
              ? { ...chatUser, unreadCount: (chatUser.unreadCount || 0) + 1 }
              : chatUser
          )
        );
      }

      if (!activeUser) return;

      const belongsToOpenChat =
        senderId === activeUser._id ||
        receiverId === activeUser._id;

      if (!belongsToOpenChat) return;

      setMessages((prev) => [...prev, message]);

      if (isIncomingMessage) {
        markChatAsRead(senderId);
      }
    });

    socketRef.current.on("chat:error", (error) => {
      showToast(error, "error");
    });

    socketRef.current.on("chat:message-deleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((message) => message._id !== messageId));
    });

    socketRef.current.on("chat:messages-read", ({ readerId }) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.receiver?._id === readerId
            ? { ...message, isRead: true, isDelivered: true }
            : message
        )
      );
    });

    socketRef.current.on("chat:messages-delivered", ({ receiverId }) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.receiver?._id === receiverId
            ? { ...message, isDelivered: true }
            : message
        )
      );
    });

    socketRef.current.on("user:online", ({ userId }) => {
      updateUserOnlineStatus(userId, true);
    });

    socketRef.current.on("user:offline", ({ userId }) => {
      updateUserOnlineStatus(userId, false);
    });

    socketRef.current.on("chat:cleared", ({ receiverId }) => {
      const activeUser = selectedUserRef.current;

      if (activeUser?._id === receiverId) {
        setMessages([]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [loadChatUsers, loadRequests, markChatAsRead, showToast, token, updateUserOnlineStatus, user?._id]);

  useEffect(() => {
    if (!selectedUser) return;

    setIsLoadingMessages(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/messages/${selectedUser._id}`, {
        headers: { "x-token": token },
      })
      .then((res) => {
        setMessages(res.data);
        setChatUsers((prev) =>
          prev.map((chatUser) =>
            chatUser._id === selectedUser._id
              ? { ...chatUser, unreadCount: 0 }
              : chatUser
          )
        );
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoadingMessages(false));
  }, [selectedUser, token]);

  useEffect(() => {
    if (!selectedUser || isLoadingMessages) return;

    const scrollToLatestMessage = () => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    };

    scrollToLatestMessage();
    const mediaRenderTimer = setTimeout(scrollToLatestMessage, 150);

    return () => clearTimeout(mediaRenderTimer);
  }, [messages, selectedUser, isLoadingMessages]);

  const sendMessage = (text) => {
    if (!selectedUser) return;

    socketRef.current.emit("chat:send", {
      receiverId: selectedUser._id,
      text,
    });
  };

  const sendAudioMessage = ({ audioData, audioMimeType }) => {
    if (!selectedUser) return;

    socketRef.current.emit("chat:send", {
      receiverId: selectedUser._id,
      audioData,
      audioMimeType,
    });
  };

  const sendMediaMessage = ({ mediaData, mediaMimeType, mediaName }) => {
    if (!selectedUser) return;

    socketRef.current.emit("chat:send", {
      receiverId: selectedUser._id,
      mediaData,
      mediaMimeType,
      mediaName,
    });
  };

  const requestDeleteMessage = (messageId) => {
    setConfirmState({
      title: "Delete message?",
      message: "This message will be removed from the chat for both users.",
      confirmText: "Delete",
      danger: true,
      onConfirm: () => {
        socketRef.current.emit("chat:delete", { messageId });
        setConfirmState(null);
      },
    });
  };

  const requestClearChat = () => {
    if (!selectedUser) return;

    setIsChatMenuOpen(false);
    setConfirmState({
      title: "Clear chat?",
      message: `All messages with ${selectedUser.username} will be deleted for both users.`,
      confirmText: "Clear",
      danger: true,
      onConfirm: () => {
        socketRef.current.emit("chat:clear", { receiverId: selectedUser._id });
        setConfirmState(null);
      },
    });
  };

  return (
    <div className="chat-screen">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {profileUser ? (
        <ProfilePanel
          profileUser={profileUser}
          onBack={() => setProfileUser(null)}
          onMessage={() => setProfileUser(null)}
          onClearChat={() => {
            setProfileUser(null);
            requestClearChat();
          }}
        />
      ) : selectedUser ? (
        <>
          <div className="chat-title">
            <button
              type="button"
              className="back-btn"
              aria-label="Back to chats"
              onClick={() => {
                setSelectedUser(null);
                setMessages([]);
              }}
            >
              <img src="/Arrow-left-gray.svg" alt="" />
            </button>
            <UserAvatar user={selectedUser} />
            <div className="chat-title-user">
              <span>{selectedUser.username}</span>
              <small className={selectedUser.isOnline ? "online" : ""}>
                {selectedUser.isOnline ? "Online" : "Offline"}
              </small>
            </div>
            <div className="chat-title-actions">
              <button
                type="button"
                className="chat-menu-btn"
                aria-label="Chat options"
                onClick={() => setIsChatMenuOpen((value) => !value)}
              >
                <img src="/verticol-dots.svg" alt="" />
              </button>

              {isChatMenuOpen && (
                <div className="chat-menu">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChatMenuOpen(false);
                      setProfileUser(selectedUser);
                    }}
                  >
                    View profile
                  </button>
                  <button type="button" className="danger" onClick={requestClearChat}>
                    Clear chat
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="messages-list">
            {isLoadingMessages ? (
              <LoadingSpinner label="Loading messages" />
            ) : (
              messages.map((message) => (
                <MessageBox
                  key={message._id}
                  message={message}
                  isOwnMessage={message.sender?._id === user?._id}
                  onDelete={requestDeleteMessage}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <MessageInput
            onSend={sendMessage}
            onSendAudio={sendAudioMessage}
            onSendMedia={sendMediaMessage}
          />
        </>
      ) : (
        <>
          {activeView === "followers" ? (
            <FollowersPanel
              users={chatUsers}
              onBack={() => setActiveView("home")}
              onSelectUser={setSelectedUser}
            />
          ) : activeView === "requests" ? (
            <RequestsPanel
              incomingRequests={incomingRequests}
              sentRequests={sentRequests}
              token={token}
              onBack={() => setActiveView("home")}
              onChanged={refreshSocialData}
              onNotify={showToast}
            />
          ) : activeView === "findPeople" ? (
            <PeoplePanel
              token={token}
              onBack={() => setActiveView("home")}
              onNotify={showToast}
              onChanged={refreshSocialData}
            />
          ) : (
            <div className="chat-home">
              <ChatList
                users={chatUsers}
                isLoading={isLoadingChats}
                requestCount={incomingRequests.length + sentRequests.length}
                onSelectUser={setSelectedUser}
                onOpenFindPeople={() => setActiveView("findPeople")}
                onOpenFollowers={() => setActiveView("followers")}
                onOpenRequests={() => setActiveView("requests")}
              />
            </div>
          )}
        </>
      )}

      {confirmState && (
        <ConfirmModal
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          danger={confirmState.danger}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
};

export default ChatScreen;
