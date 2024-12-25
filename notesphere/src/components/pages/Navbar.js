import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  useEffect(() => {
    const div = document.getElementById("full");
    const changeColor = () => {
      if (div) {
        div.style.color = getRandomColor();
      }
    };
    changeColor();
    const colorInterval = setInterval(changeColor, 1000);

    return () => clearInterval(colorInterval);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      {/* Brand Logo */}

      <Link className="navbar-brand align-items-center mx-3" to="/">
        <span
          style={{
            transform: "rotate(28deg)",
            display: "inline-block",
            textAlign: "center",
            fontFamily: "Georgia, serif",
            fontSize: "50px",
          }}
        >
          <div id="full">N</div>
        </span>

        <span>oteSphere</span>
      </Link>

      {/* Toggle button for small screens */}
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      {/* Navbar Links */}
      <div
        className="collapse navbar-collapse mx-3"
        style={{ paddingTop: "21px" }}
        id="navbarNav"
      >
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link
              className={`nav-link ${
                location.pathname === "/" ? "active" : ""
              }`}
              to="/"
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link ${
                location.pathname === "/about" ? "active" : ""
              }`}
              to="/about"
            >
              About
            </Link>
          </li>
        </ul>

        {/* Authentication Buttons */}
        {!localStorage.getItem("token") ? (
          <div className="my-2">
            {location.pathname !== "/login" && (
              <Link className="btn btn-primary btn-sm me-2" to="/login">
                Login
              </Link>
            )}
            {location.pathname !== "/signup" && (
              <Link className="btn btn-primary btn-sm" to="/signup">
                SignUp
              </Link>
            )}
          </div>
        ) : (
          <button
            className="btn btn-danger btn-sm"
            style={{ width: "auto" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
