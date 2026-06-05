import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { store } from "../App";
import LoadingSpinner from "../components/LoadingSpinner";

const Settings = () => {
  const [token, setToken] = useContext(store);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    password: "",
    confirmpassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${process.env.REACT_APP_API_URL}/main`, {
        headers: { "x-token": token },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      });
  }, [setToken, token]);

  if (!token) return <Navigate to="/" />;

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
  };

  const deleteAccount = () => {
    const confirmed = window.confirm(
      "Delete your account permanently? This cannot be undone."
    );

    if (!confirmed) return;

    axios
      .delete(`${process.env.REACT_APP_API_URL}/delete-account`, {
        headers: { "x-token": token },
      })
      .then(() => logout())
      .catch((err) => setError(err.response?.data || "Could not delete account"));
  };

  const clearLocalData = () => {
    localStorage.removeItem("token");
    setMessage("Local app data cleared");
  };

  const changeHandler = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setError("");
    setMessage("");
  };

  const changePassword = (e) => {
    e.preventDefault();

    axios
      .put(`${process.env.REACT_APP_API_URL}/change-password`, passwords, {
        headers: { "x-token": token },
      })
      .then((res) => {
        setMessage(res.data);
        setPasswords({
          currentPassword: "",
          password: "",
          confirmpassword: "",
        });
      })
      .catch((err) =>
        setError(err.response?.data || "Could not change password")
      );
  };

  return (
    <div className="Main-container">
      {!user ? (
        <LoadingSpinner label="Loading settings" />
      ) : (
        <div className="settings-screen">
          <div className="chat-title">
            <Link className="settings-back" to="/main">
              <img src="/Arrow-left-gray.svg" alt="" />
            </Link>
            <span>Settings</span>
          </div>

          <div className="settings-content">
            <section className="settings-card">
              <h4>Profile</h4>
              <div className="settings-profile">
                <span className="profile-avatar">
                  {user.username?.charAt(0)?.toUpperCase()}
                </span>
                <div>
                  <strong>{user.username}</strong>
                  <p>{user.email}</p>
                </div>
              </div>
            </section>

            <section className="settings-card">
              <h4>Privacy</h4>
              <p>
                Mitrama uses account details for login, follow requests, and
                chat features. We do not sell personal data. Shared messages,
                audio, images, and videos are used only for the chat experience
                between connected users.
              </p>
            </section>

            <section className="settings-card">
              <h4>Security</h4>
              <form className="settings-form" onSubmit={changePassword}>
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Current password"
                  value={passwords.currentPassword}
                  onChange={changeHandler}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="New password"
                  value={passwords.password}
                  onChange={changeHandler}
                />
                <input
                  type="password"
                  name="confirmpassword"
                  placeholder="Confirm new password"
                  value={passwords.confirmpassword}
                  onChange={changeHandler}
                />
                <button type="submit">Change password</button>
              </form>
            </section>

            {message && <p className="form-success">{message}</p>}
            {error && <p className="settings-error">{error}</p>}

            <section className="settings-card">
              <h4>Account</h4>
              <button onClick={clearLocalData}>Clear local data</button>
              <button onClick={logout}>Logout</button>
              <button className="danger" onClick={deleteAccount}>
                Delete account
              </button>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
