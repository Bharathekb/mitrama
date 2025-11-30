import React from "react";

const Header = () => {
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
            <li>{username}</li>
            <li onClick={handleLogout}>Logout</li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
