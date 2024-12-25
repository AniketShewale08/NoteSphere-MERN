import React from "react";
import Notes from "../notes/Notes";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="container my-3">
      {localStorage.getItem("token") ? (
        <Notes />
      ) : (
        <>
          <div className="hero-section text-center py-5 bg-light">
            <div className="container">
              <h1>
                <span
                  style={{
                    transform: "rotate(28deg)",
                    display: "inline-block",
                    textAlign: "center",
                    fontFamily: "Georgia, serif",
                    fontSize: "64px",
                  }}
                >
                  N
                </span>
                <span
                  style={{
                    fontSize: "26px",
                    display: "inline-block",
                    marginLeft: "-10px",
                    textAlign: "center",
                  }}
                >
                  oteSphere
                </span>
              </h1>
              <p className="lead mt-3">
                Capture Your Thoughts Anytime, Anywhere
              </p>
              <p>Organize, edit, and keep your notes secure with NoteSphere.</p>
              <button
                className="cta-button mt-3"
                onClick={handleGetStarted}
              >
                Get Started
              </button>
            </div>
          </div>
          <div className="features py-5 bg-white">
            <div className="container">
              <h2 className="text-center mb-4">Why Choose NoteSphere?</h2>
              <div className="row text-center">
                <div className="col-md-4 mb-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <div className="feature-icon mb-3">
                        <i className="fas fa-folder-open fa-3x text-primary"></i>
                      </div>
                      <h4>Organize Notes Effortlessly</h4>
                      <p className="text-muted">
                        Create, categorize, and manage all your notes in one place.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <div className="feature-icon mb-3">
                        <i className="fas fa-tags fa-3x text-success"></i>
                      </div>
                      <h4>Add Tags for Quick Access</h4>
                      <p className="text-muted">
                        Filter and find your notes easily with tags.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <div className="feature-icon mb-3">
                        <i className="fas fa-lock fa-3x text-danger"></i>
                      </div>
                      <h4>Secure and Private</h4>
                      <p className="text-muted">
                        Your data is protected with industry-standard encryption.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
