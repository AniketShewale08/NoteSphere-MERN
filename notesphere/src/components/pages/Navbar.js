import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import { getAvatarGradient, getInitials } from "../../utils/avatar";
import API_URL from "../../config";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "light"
  );

  // Bumped to force a re-read of localStorage below once the background
  // fetch (right below) fills it in — doesn't need to be read itself.
  const [, forceAvatarRefresh] = useState(0);

  // A session logged in before name-caching existed (or one where storage
  // was cleared) has a valid token but no cached name, which would show a
  // bare "?" avatar with no way to tell what it means. Fill it in quietly
  // in the background instead, rather than ever showing that to a user.
  // Same gap can leave isVerified missing (e.g. a session from before email
  // verification existed at all), so this backfills that too.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || localStorage.getItem("userName")) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
          headers: { "auth-token": token },
        });
        if (!response.ok || cancelled) return;
        const json = await response.json();
        localStorage.setItem("userName", json.user.name);
        localStorage.setItem("userEmail", json.user.email);
        if (!cancelled) forceAvatarRefresh((v) => v + 1);
      } catch (error) {
        // No network/API issue is worth surfacing here — the avatar just
        // keeps showing its graceful fallback until the next mount/login.
      }
    })();
    return () => {
      cancelled = true;
    };
    // Re-checked on every route change (cheap early-return when already
    // cached) so a fresh login elsewhere in the app is picked up too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      /* ignore storage errors */
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      {/* Brand Logo */}

      <Link className="navbar-brand align-items-center mx-3" to="/">
        <span className="logo-letter">N</span>
        <span className="logo-text">oteSphere</span>
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
        style={{ paddingTop: "1px" }}
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

        {/* Right side: theme toggle + authentication */}
        <div className="nav-right d-flex align-items-center">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>

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
            <div className="d-flex align-items-center">
              <Link
                to="/profile"
                className="navbar-avatar-link me-2"
                aria-label="View your profile"
                title="Profile"
              >
                <span
                  className="navbar-avatar"
                  style={{
                    background: getAvatarGradient(
                      localStorage.getItem("userEmail")
                    ),
                  }}
                >
                  {getInitials(localStorage.getItem("userName"))}
                </span>
              </Link>
              <button
                className="btn btn-danger btn-sm"
                style={{ width: "auto" }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
