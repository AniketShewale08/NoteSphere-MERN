import React, { useContext, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
  // Each password field toggles its own visibility independently, so
  // checking the new password doesn't force the confirm field to reveal too.
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  // Live validation feedback — recalculated on every keystroke so the user
  // sees the problem before hitting submit, not just after.
  const passwordError =
    passwords.password.length > 0 && passwords.password.length < 6
      ? "Password must be at least 6 characters."
      : "";
  const cpasswordError =
    passwords.cpassword.length > 0 &&
    passwords.password !== passwords.cpassword
      ? "Passwords don't match."
      : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (passwords.password !== passwords.cpassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }
    if (passwords.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
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
        {errorMessage && (
          <div className="alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-1">
            <label htmlFor="password" className="form-label">
              New Password
            </label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control${passwordError ? " is-invalid" : ""}`}
                id="password"
                name="password"
                value={passwords.password}
                onChange={onChange}
                minLength={6}
                required
                autoFocus
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {passwordError && (
              <div className="invalid-feedback d-block">{passwordError}</div>
            )}
          </div>
          <div className="mb-1">
            <label htmlFor="cpassword" className="form-label mt-1">
              Confirm Password
            </label>
            <div className="password-field">
              <input
                type={showCPassword ? "text" : "password"}
                className={`form-control${cpasswordError ? " is-invalid" : ""}`}
                id="cpassword"
                name="cpassword"
                value={passwords.cpassword}
                onChange={onChange}
                minLength={6}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowCPassword((prev) => !prev)}
                aria-label={showCPassword ? "Hide password" : "Show password"}
                aria-pressed={showCPassword}
              >
                {showCPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {cpasswordError && (
              <div className="invalid-feedback d-block">{cpasswordError}</div>
            )}
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
