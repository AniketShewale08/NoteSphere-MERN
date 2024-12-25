import React from "react";
import "./About.css";

export default function About() {
  return (
    <>
      {/* About Section */}
      <div className="about-container py-5">
        <div className="container text-center">
          <h1>About <span
              style={{
                transform: "rotate(28deg)",
                display: "inline-block",
                textAlign: "center",
                fontFamily: "Georgia, serif",
                marginRight:"2px"
              }}
            >
              <div id="full">N</div>
            </span>
            <span
              className="n"
              style={{
                fontSize: "25px",
                display: "inline-block",
                marginLeft: "-6px",
                textAlign: "center",
              }}
            >
              oteSphere
            </span></h1>
          <p className="lead mt-3">
            NoteSphere is your personal note-taking application designed to help you stay organized and productive. Whether you're jotting down ideas, tracking tasks, or storing important information, NoteSphere has you covered.
          </p>
        </div>

        {/* Features Overview */}
        <div className="features-overview container mt-5">
          <div className="row">
            <div className="col-md-4 text-center">
              <i className="fa fa-sticky-note fa-3x mb-3"></i>
              <h4>Create & Manage Notes</h4>
              <p>Easily create, update, and organize your notes with tags and categories.</p>
            </div>
            <div className="col-md-4 text-center">
              <i className="fa fa-lock fa-3x mb-3"></i>
              <h4>Secure & Private</h4>
              <p>Your notes are securely stored with robust authentication and encryption.</p>
            </div>
            <div className="col-md-4 text-center">
              <i className="fa fa-globe fa-3x mb-3"></i>
              <h4>Accessible Anywhere</h4>
              <p>Access your notes on any device, anytime, anywhere, with a seamless experience.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
