import React from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../common/BrandLogo";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found-container text-center">
      <p className="not-found-code">404</p>
      <h1 className="mb-2">Page not found</h1>
      <p className="lead not-found-lead">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" className="btn btn-primary not-found-home-btn">
        Back to <BrandLogo nSize={20} restSize={16} />
      </Link>
    </div>
  );
};

export default NotFound;
