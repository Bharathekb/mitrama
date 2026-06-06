import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import UserAvatar from "./UserAvatar";

const ChatList = ({
  users,
  isLoading,
  requestCount,
  onSelectUser,
  onOpenFindPeople,
  onOpenFollowers,
  onOpenRequests,
}) => {
  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <div className="chat-list-screen">
      <div className="chat-list-header">
        <h4>Chats</h4>
        <div className="chat-list-actions">
          <button type="button" onClick={onOpenFindPeople}>
            Find
          </button>
          <button type="button" onClick={onOpenFollowers}>
            Followers {safeUsers.length > 0 && <span>{safeUsers.length}</span>}
          </button>
          <button type="button" onClick={onOpenRequests}>
            Requests {requestCount > 0 && <span>{requestCount}</span>}
          </button>
        </div>
      </div>

      {isLoading && <LoadingSpinner label="Loading chats" />}

      {!isLoading && safeUsers.length === 0 && <p>No accepted chats yet</p>}

      {!isLoading && safeUsers.map((chatUser) => (
        <button
          key={chatUser._id}
          className="chat-user-row"
          onClick={() => onSelectUser(chatUser)}
        >
          <UserAvatar user={chatUser} />
          <div>
            <span>{chatUser.username}</span>
            <small className={chatUser.isOnline ? "online" : ""}>
              {chatUser.isOnline ? "Online" : "Offline"}
            </small>
          </div>
          <div className="chat-row-meta">
            {chatUser.unreadCount > 0 && (
              <span className="chat-unread-count">
                {chatUser.unreadCount > 99 ? "99+" : chatUser.unreadCount}
              </span>
            )}
            <span className="chat-arrow">&gt;</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChatList;
