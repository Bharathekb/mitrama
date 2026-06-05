import React from "react";
import LoadingSpinner from "./LoadingSpinner";

const ChatList = ({
  users,
  isLoading,
  requestCount,
  onSelectUser,
  onOpenFindPeople,
  onOpenFollowers,
  onOpenRequests,
}) => {
  return (
    <div className="chat-list-screen">
      <div className="chat-list-header">
        <h4>Chats</h4>
        <div className="chat-list-actions">
          <button type="button" onClick={onOpenFindPeople}>
            Find
          </button>
          <button type="button" onClick={onOpenFollowers}>
            Followers
          </button>
          <button type="button" onClick={onOpenRequests}>
            Requests {requestCount > 0 && <span>{requestCount}</span>}
          </button>
        </div>
      </div>

      {isLoading && <LoadingSpinner label="Loading chats" />}

      {!isLoading && users.length === 0 && <p>No accepted chats yet</p>}

      {!isLoading && users.map((chatUser) => (
        <button
          key={chatUser._id}
          className="chat-user-row"
          onClick={() => onSelectUser(chatUser)}
        >
          <div>
            <span>{chatUser.username}</span>
            <small>{chatUser.email}</small>
          </div>
          <span className="chat-arrow">&gt;</span>
        </button>
      ))}
    </div>
  );
};

export default ChatList;
