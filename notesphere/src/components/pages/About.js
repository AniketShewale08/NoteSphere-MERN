import React from "react";
import BrandLogo from "../common/BrandLogo";
import "./About.css";

export default function About() {
  return (
    <>
      {/* About Section */}
      <div className="about-container py-5">
        <div className="container text-center">
          <h1>About <BrandLogo nSize={40} restSize={25} gradient /></h1>
          <p className="lead mt-3">
            NoteSphere is your personal note-taking application designed to help you stay organized and productive. Whether you're jotting down ideas, tracking tasks, or storing important information, NoteSphere has you covered.
          </p>
        </div>

        {/* Features Overview */}
        <div className="features-overview container mt-5">
          {/* Sits between the page's h1 above and the h3 feature headings below,
              so the hierarchy doesn't skip a level — mirrors Home.js's own
              "Why Choose NoteSphere?" h2 above its feature cards. */}
          <h2 className="text-center mb-4">Features</h2>
          <div className="row">
            <div className="col-md-4 text-center">
              <i className="fa fa-sticky-note fa-3x mb-3"></i>
              <h3 className="fs-4">Create & Manage Notes</h3>
              <p>Easily create, update, and organize your notes with tags and categories.</p>
            </div>
            <div className="col-md-4 text-center">
              <i className="fa fa-lock fa-3x mb-3"></i>
              <h3 className="fs-4">Secure & Private</h3>
              <p>Your notes are securely stored with robust authentication and encryption.</p>
            </div>
            <div className="col-md-4 text-center">
              <i className="fa fa-globe fa-3x mb-3"></i>
              <h3 className="fs-4">Accessible Anywhere</h3>
              <p>Access your notes on any device, anytime, anywhere, with a seamless experience.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
