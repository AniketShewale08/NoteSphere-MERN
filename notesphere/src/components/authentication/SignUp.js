import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import alertContext from "../../context/alert/alertContext";
import "./SignUp.css";  // Import the CSS file

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
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/createuser",
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
                <input
                  type="password"
                  className="form-control signup-input"
                  name="password"
                  id="password"
                  onChange={onChange}
                  minLength={6}
                  required
                />
              </div>

              <div className="mb-1">
                <label htmlFor="cpassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-control signup-input"
                  name="cpassword"
                  id="cpassword"
                  onChange={onChange}
                  minLength={6}
                  required
                />
              </div>

              <button type="submit" className="signup-btn btn btn-primary my-2">
                Sign Up
              </button>
            </form>
          </div>

          {/* Right side - Meaningful Content */}
          <div className="col-md-6 signup-right text-center">
            <h2>
              Welcome to{" "}
              <div>
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
                <span
                  className="n"
                  style={{
                    fontSize: "20px",
                    display: "inline-block",
                    marginLeft: "-6px",
                    textAlign: "center",
                  }}
                >
                  oteSphere
                </span>
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
