import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import alertContext from "../../context/alert/alertContext";
import API_URL from "../../config";
import BrandLogo from "../common/BrandLogo";
import "./SignUp.css";

const SignUp = () => {
  const navigate = useNavigate();
  const context = useContext(alertContext);
  const { showAlert } = context;
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
  });
  const [loading, setLoading] = useState(false);
  // Each password field toggles its own visibility independently, so
  // checking the password doesn't force the confirm field to reveal too.
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  // Live validation feedback — recalculated on every keystroke so the user
  // sees the problem before hitting submit, not just after.
  const passwordError =
    credentials.password.length > 0 && credentials.password.length < 6
      ? "Password must be at least 6 characters long"
      : "";
  const cpasswordError =
    credentials.cpassword.length > 0 &&
    credentials.password !== credentials.cpassword
      ? "Passwords don't match"
      : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, cpassword } = credentials;
    if (password !== cpassword) {
      showAlert("Passwords don't match!", "danger");
      return;
    }
    if (password.length < 6) {
      showAlert("Password must be at least 6 characters long", "danger");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/auth/createuser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );
      const json = await response.json();
      if (json.success) {
        showAlert("SignUp Successfully.", "success");
        navigate("/login");
      } else {
        showAlert("Credentials fail", "danger");
      }
    } catch (error) {
      showAlert("Something went wrong. Please try again later.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="signup-container my-5">
        <div className="signup-row align-items-center">
          {/* Left side - Form section */}
          <div className="col-md-6 signup-form-container">
            <h2 className="mb-2">Sign Up</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-1">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control signup-input"
                  name="name"
                  id="name"
                  onChange={onChange}
                  required
                />
              </div>

              <div className="mb-1">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control signup-input"
                  id="email"
                  name="email"
                  aria-describedby="emailHelp"
                  onChange={onChange}
                  required
                />
              </div>

              <div className="mb-1">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control signup-input${
                      passwordError ? " is-invalid" : ""
                    }`}
                    name="password"
                    id="password"
                    onChange={onChange}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {/* Hint shows before/while typing so the requirement is
                    visible up front; once the live error fires it takes
                    over that space instead of stacking both messages. */}
                {passwordError ? (
                  <div className="invalid-feedback d-block">
                    {passwordError}
                  </div>
                ) : (
                  <small className="form-text password-hint">
                    At least 6 characters
                  </small>
                )}
              </div>

              <div className="mb-1">
                <label htmlFor="cpassword" className="form-label">
                  Confirm Password
                </label>
                <div className="password-field">
                  <input
                    type={showCPassword ? "text" : "password"}
                    className={`form-control signup-input${
                      cpasswordError ? " is-invalid" : ""
                    }`}
                    name="cpassword"
                    id="cpassword"
                    onChange={onChange}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowCPassword((prev) => !prev)}
                    aria-label={
                      showCPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showCPassword}
                  >
                    {showCPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {cpasswordError && (
                  <div className="invalid-feedback d-block">
                    {cpasswordError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="signup-btn btn btn-primary my-2"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>
          </div>

          {/* Right side - Meaningful Content */}
          <div className="col-md-6 signup-right text-center">
            <h2>
              Welcome to{" "}
              <div>
                <BrandLogo nSize={50} restSize={20} gradient />
              </div>
            </h2>

            <p className="mt-4" style={{ fontSize: "1.2rem" }}>
              NoteSphere is your personal note management app. Create, organize,
              and manage your notes efficiently with features like:
            </p>
            <ul className="list-unstyled mt-3" style={{ fontSize: "1.1rem" }}>
              <li>✅ Easy-to-use interface</li>
              <li>✅ Secure login with data encryption</li>
              <li>✅ Create and tag notes for better organization</li>
              <li>✅ Edit and delete notes with a single click</li>
              <li>✅ Accessible from anywhere</li>
            </ul>
            <p className="mt-4" style={{ fontStyle: "italic" }}>
              Start your journey with us and never miss a thought again!
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
