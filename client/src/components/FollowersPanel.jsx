import React, { useMemo, useState } from "react";
import UserAvatar from "./UserAvatar";

const FollowersPanel = ({ users, onBack, onSelectUser }) => {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return users;

    return users.filter((chatUser) => {
      return chatUser.username?.toLowerCase().includes(value);
    });
  }, [search, users]);

  return (
    <div className="followers-screen">
      <div className="chat-title">
        <button
          type="button"
          className="back-btn"
          aria-label="Back to home"
          onClick={onBack}
        >
          <img src="/Arrow-left-gray.svg" alt="" />
        </button>
        <span>Followers ({users.length})</span>
      </div>

      <div className="followers-content">
        <input
          className="followers-search"
          type="text"
          placeholder="Search followers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredUsers.length === 0 && (
          <p className="followers-empty">No followers found</p>
        )}

        {filteredUsers.map((chatUser) => (
          <button
            key={chatUser._id}
            className="chat-user-row"
            onClick={() => onSelectUser(chatUser)}
          >
            <UserAvatar user={chatUser} />
            <div>
              <span>{chatUser.username}</span>
            </div>
            <span className="chat-arrow">&gt;</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FollowersPanel;
