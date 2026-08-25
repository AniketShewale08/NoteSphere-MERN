import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import API_URL from "../../config";
import alertContext from "../../context/alert/alertContext";
import "./VerifyBanner.css";

// Soft, non-blocking email-verification reminder (Option B). A logged-in user
// who hasn't clicked their verification link yet sees this quiet strip on
// every page — never a blocking modal, never a locked-out login — with a
// one-click way to resend the link. Dismissing it just hides it for the rest
// of this browser session; it comes back on next login until the user
// actually verifies.
const VerifyBanner = () => {
  // Read on every render (App re-renders on route change via the Router
  // context) so a fresh login, or a just-completed verification, is picked
  // up without needing a full page reload.
  useLocation();
  const { showAlert } = useContext(alertContext);

  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const token = localStorage.getItem("token");
  const isVerified = localStorage.getItem("isVerified");

  if (!token || isVerified === "true" || dismissed) {
    return null;
  }

  const handleResend = async () => {
    if (sending || cooldown) return;
    setSending(true);
    try {
      // The authenticated endpoint — it resends to whatever address the account
      // actually has on the server, and reports honestly if the send fails,
      // rather than the public endpoint's deliberately vague response.
      const response = await fetch(`${API_URL}/api/auth/send-verification`, {
        method: "POST",
        headers: { "auth-token": token },
      });
      const json = await response.json();
      setSending(false);

      if (json.success && json.alreadyVerified) {
        // Nothing to send — the cached flag was just stale. Take the banner down.
        try {
          localStorage.setItem("isVerified", "true");
        } catch (e) {
          /* ignore storage errors */
        }
        showAlert("Your email is already verified.", "success");
        setDismissed(true);
        return;
      }

      if (json.success) {
        showAlert(json.message || "Verification email sent — check your inbox.", "success");
        // Prevent spamming the resend button; server-side rate limiting is
        // the real backstop, this just keeps the UI honest in the meantime.
        setCooldown(true);
        setTimeout(() => setCooldown(false), 60 * 1000);
      } else {
        showAlert(
          json.message || "Couldn't resend right now. Please try again shortly.",
          "danger"
        );
      }
    } catch (error) {
      setSending(false);
      showAlert("Couldn't resend right now. Please try again shortly.", "danger");
    }
  };

  return (
    <div className="verify-banner" role="status">
      <span className="verify-banner-text">
        Please verify your email address to secure your account.
      </span>
      <div className="verify-banner-actions">
        <button
          type="button"
          className="verify-banner-resend"
          onClick={handleResend}
          disabled={sending || cooldown}
        >
          {sending ? "Sending..." : cooldown ? "Sent" : "Resend link"}
        </button>
        <button
          type="button"
          className="verify-banner-dismiss"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss verification reminder"
          title="Dismiss"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default VerifyBanner;
