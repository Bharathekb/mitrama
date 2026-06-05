import React from "react";
import UserAvatar from "./UserAvatar";

const ProfilePanel = ({ profileUser, onBack, onMessage, onClearChat }) => {
  return (
    <div className="profile-screen">
      <div className="chat-title">
        <button
          type="button"
          className="back-btn"
          aria-label="Back to chat"
          onClick={onBack}
        >
          <img src="/Arrow-left-gray.svg" alt="" />
        </button>
        <span>Profile</span>
      </div>

      <div className="profile-content">
        <div className="profile-hero">
          <UserAvatar user={profileUser} size="lg" />
          <h3>{profileUser?.username}</h3>
          <span className="profile-status">Connected</span>
        </div>

        <div className="profile-actions">
          <button type="button" onClick={onMessage}>
            Message
          </button>
          <button type="button" className="danger" onClick={onClearChat}>
            Clear chat
          </button>
        </div>

        <div className="profile-info">
          <h4>About</h4>
          <p>
            You can chat, share media, and exchange voice messages with this
            accepted connection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
