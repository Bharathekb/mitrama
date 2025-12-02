import React, { useContext } from "react";
import {useNavigate } from "react-router-dom";
import { store } from '../App'

const Header = ({ user }) => {

  const [token, setToken] = useContext(store)
  const navigate = useNavigate();
  const logOut = (e) => {
     setToken(null);
  localStorage.removeItem("token"); 
  navigate("/");
  }
  return (
    <nav className="navbar navbar-expand-lg px-4">
      <a className="navbar-brand" href="/">
        Mitravan
      </a>
      <ul className="navbar-nav">
        <li className="nav-item dropdown">
          <button
            className="btn-outline-light dropdown-toggle"
            id="userDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img src="/Horizantal-dots.svg"></img>
          </button>
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="userDropdown"
          >
            <li>{user?.username}</li>
            <li onClick={logOut}>Logout</li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
