import React, { useContext, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import alertContext from "../../context/alert/alertContext";
import API_URL from "../../config";
import "./Login.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useContext(alertContext);

  const [passwords, setPasswords] = useState({ password: "", cpassword: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (passwords.password !== passwords.cpassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }
    if (passwords.password.length < 5) {
      setErrorMessage("Password must be at least 5 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwords.password }),
      });
      const json = await response.json();
      setLoading(false);

      if (json.success) {
        showAlert("Password reset successfully. Please log in.", "success");
        navigate("/login");
      } else {
        setErrorMessage(
          json.message || "This reset link is invalid or has expired."
        );
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage("Something went wrong, please try again later.");
    }
  };

  const onChange = (e) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  return (
    <div className="login-container d-flex align-items-center">
      <div className="login-form">
        <h2>Reset Password</h2>
        {errorMessage && <div className="alert-danger">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-1">
            <label htmlFor="password" className="form-label">
              New Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={passwords.password}
              onChange={onChange}
              minLength={5}
              required
              autoFocus
            />
          </div>
          <div className="mb-1">
            <label htmlFor="cpassword" className="form-label mt-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="form-control"
              id="cpassword"
              name="cpassword"
              value={passwords.cpassword}
              onChange={onChange}
              minLength={5}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 mt-3"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-1 text-center">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
