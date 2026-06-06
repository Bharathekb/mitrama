import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { store } from "../App";
import UserAvatar from "./UserAvatar";
import ConfirmModal from "./ConfirmModal";

const Header = ({ user }) => {
  const [, setToken] = useContext(store);
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const logOut = () => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg px-4">
        <a className="navbar-brand" href="/">
          <img className="brand-logo" src="/Mitrama-logo.png" alt="Mitrama" />
        </a>

        <ul className="navbar-nav header-actions">
          <li className="profile-box">
            <UserAvatar user={user} />
          </li>
          <li className="nav-item dropdown">
            <button
              className="btn-outline-light dropdown-toggle"
              id="userDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img src="/Horizantal-dots.svg" alt="Menu" />
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end app-dropdown-menu"
              aria-labelledby="userDropdown"
            >
              <li className="dropdown-user-card">
                <UserAvatar user={user} />
                <div>
                  <strong>{user?.username || "User"}</strong>
                  <span>Account menu</span>
                </div>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/settings")}>
                  <img src="/Settings.svg" alt="" />
                  <span>Settings</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="logout-option"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      {showLogoutConfirm && (
        <ConfirmModal
          title="Logout?"
          message="Are you sure you want to logout from Mitrama?"
          confirmText="Logout"
          danger
          onConfirm={logOut}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
};

export default Header;
