import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { store } from "../App";
import axios from "axios";
import UserAvatar from "./UserAvatar";

const Header = ({ user }) => {
  const [token, setToken] = useContext(store);
  const navigate = useNavigate();
  const logOut = (e) => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/");
  };

  const deleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      axios
        .delete(`${process.env.REACT_APP_API_URL}/delete-account`, {
          headers: {
            "x-token": token,
          },
        })
        .then((res) => {
          alert(res.data);
          localStorage.removeItem("token");
          setToken(null);
          navigate("/");
        })
        .catch((err) => console.log(err));
    }
  };
  return (
    <nav className="navbar navbar-expand-lg px-4">
      <a className="navbar-brand" href="/">
        <img className="brand-logo" src="/Mitrama-logo.png" alt="Mitrama" />
      </a>
      <ul className="navbar-nav header-actions">
        <li className="profile-box">
          <UserAvatar user={user} />
          <span className="profile-name">{user?.username || "User"}</span>
        </li>
        <li className="nav-item dropdown">
          <button
            className="btn-outline-light dropdown-toggle"
            id="userDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img src="/Horizantal-dots.svg" alt="Menu"></img>
          </button>
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="userDropdown"
          >
            <li>{user?.username}</li>
            <li onClick={() => navigate("/settings")}>Settings</li>
            <li onClick={logOut}>Logout</li>
            <li onClick={deleteAccount}>Delete account</li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
