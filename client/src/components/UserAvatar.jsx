import React from "react";

const UserAvatar = ({ user, size = "sm" }) => {
  const initial = user?.username?.charAt(0)?.toUpperCase() || "U";

  return (
    <span className={`user-avatar ${size}`}>
      {user?.profileImage ? (
        <img src={user.profileImage} alt="" />
      ) : (
        initial
      )}
    </span>
  );
};

export default UserAvatar;
