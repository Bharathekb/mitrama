import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { store } from "../App";
import LoadingSpinner from "../components/LoadingSpinner";
import UserAvatar from "../components/UserAvatar";
import PasswordInput from "../components/PasswordInput";

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
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);

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

  const updateProfileImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      setError("Profile image must be under 1.5MB");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setIsUploadingProfileImage(true);

      axios
        .put(
          `${process.env.REACT_APP_API_URL}/profile-image`,
          { profileImage: reader.result },
          { headers: { "x-token": token } }
        )
        .then((res) => {
          setUser(res.data);
          setMessage("Profile photo updated");
        })
        .catch((err) =>
          setError(err.response?.data || "Could not update profile photo")
        )
        .finally(() => setIsUploadingProfileImage(false));
    };

    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setError("");
    setMessage("");
    setIsUploadingProfileImage(true);

    axios
      .put(
        `${process.env.REACT_APP_API_URL}/profile-image`,
        { profileImage: "" },
        { headers: { "x-token": token } }
      )
      .then((res) => {
        setUser(res.data);
        setMessage("Profile photo removed");
      })
      .catch((err) =>
        setError(err.response?.data || "Could not remove profile photo")
      )
      .finally(() => setIsUploadingProfileImage(false));
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
                <UserAvatar user={user} size="md" />
                <div>
                  <strong>{user.username}</strong>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="settings-profile-actions">
                <label>
                  {isUploadingProfileImage ? "Uploading..." : "Upload photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={updateProfileImage}
                    disabled={isUploadingProfileImage}
                  />
                </label>
                {user.profileImage && (
                  <button
                    type="button"
                    onClick={removeProfileImage}
                    disabled={isUploadingProfileImage}
                  >
                    Remove photo
                  </button>
                )}
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
                <PasswordInput
                  name="currentPassword"
                  placeholder="Current password"
                  value={passwords.currentPassword}
                  onChange={changeHandler}
                />
                <PasswordInput
                  name="password"
                  placeholder="New password"
                  value={passwords.password}
                  onChange={changeHandler}
                />
                <PasswordInput
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
