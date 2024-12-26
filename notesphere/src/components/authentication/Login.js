import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import alertContext from "../../context/alert/alertContext";
import "./Login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false); // Loading state
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const navigate = useNavigate();
  const context = useContext(alertContext);
  const { showAlert } = context;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous error messages
    setLoading(true); // Start loading

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const json = await response.json();
      setLoading(false); // Stop loading

      if (json.success) {
        localStorage.setItem("token", json.authenticate);
        showAlert("Login Successfully", "success");
        navigate("/");
      } else {
        setErrorMessage("Invalid credentials, please try again.");
      }
    } catch (error) {
      setLoading(false); // Stop loading
      console.log("Internal error occurred");
      setErrorMessage("Something went wrong, please try again later.");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="login-container d-flex align-items-center">
      <div className="login-form">
        <h2>Login</h2>
        {/* Display error message if any */}
        {errorMessage && <div className="alert-danger">{errorMessage}</div>}
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
              onChange={onChange}
              value={credentials.email}
              required
              autoFocus
            />
          </div>
          <div className="mb-1">
            <label htmlFor="password" className="form-label mt-1">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              onChange={onChange}
              value={credentials.password}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 mt-3"
            disabled={loading}
          >
            {loading ? "Logging In..." : "Submit"}
          </button>
        </form>
        <p className="mt-1 text-center">
          Don’t have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
