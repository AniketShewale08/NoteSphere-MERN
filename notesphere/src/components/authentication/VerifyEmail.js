import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API_URL from "../../config";
import "./Login.css";

// Auto-verifies on mount by calling the token from the URL — the user just
// clicks the link in their email and lands here; there's nothing for them to
// fill in or submit.
const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    // Guards against React 18 StrictMode's double-invoke in development,
    // which would otherwise fire this network call twice on mount.
    if (calledRef.current) return;
    calledRef.current = true;

    (async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/verify-email/${token}`, {
          method: "POST",
        });
        const json = await response.json();

        if (json.success) {
          setStatus("success");
          setMessage(json.message || "Your email has been verified.");
          // Keep the cached flag in sync so the reminder banner disappears
          // immediately if the user is verifying in the same browser
          // session they're logged in on.
          try {
            localStorage.setItem("isVerified", "true");
          } catch (e) {
            /* ignore storage errors */
          }
        } else {
          setStatus("error");
          setMessage(json.message || "This verification link is invalid or has expired.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Something went wrong, please try again later.");
      }
    })();
  }, [token]);

  return (
    <div className="login-container d-flex align-items-center">
      <div className="login-form text-center">
        <h2>Email Verification</h2>

        {status === "verifying" && <p className="mt-2">Verifying your email...</p>}

        {status === "success" && (
          <div className="alert-success mt-2" role="alert">
            {message}
          </div>
        )}

        {status === "error" && (
          <div className="alert-danger mt-2" role="alert">
            {message}
          </div>
        )}

        <p className="mt-3">
          <Link to="/">Go to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
