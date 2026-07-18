import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import alertContext from "../../context/alert/alertContext";
import API_URL from "../../config";
import "./Login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: "", type: "" }); // type: success | danger
  const { showAlert } = useContext(alertContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ text: "", type: "" });
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await response.json();
      setLoading(false);

      if (json.success) {
        setFeedback({
          text:
            json.message ||
            "If an account with that email exists, a password reset link has been sent.",
          type: "success",
        });
        showAlert("Reset link sent — check your email", "success");
      } else {
        setFeedback({ text: "Something went wrong. Please try again.", type: "danger" });
      }
    } catch (error) {
      setLoading(false);
      setFeedback({
        text: "Something went wrong, please try again later.",
        type: "danger",
      });
    }
  };

  return (
    <div className="login-container d-flex align-items-center">
      <div className="login-form">
        <h2>Forgot Password</h2>
        <p className="text-center" style={{ fontSize: "0.9rem" }}>
          Enter your account email and we'll send you a link to reset your password.
        </p>

        {feedback.text && (
          <div className={`alert alert-${feedback.type}`}>{feedback.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-1">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 mt-3"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-1 text-center">
          Remembered it? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
