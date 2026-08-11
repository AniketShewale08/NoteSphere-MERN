import React from "react";

// NoteSphere wordmark — a rotated serif "N" followed by "oteSphere".
// Centralized so the logo renders consistently everywhere (replaces ~4 copies of the
// same markup and the brittle block-inside-inline "N" that varied per page).
//   nSize    – font size (px) of the big "N"
//   restSize – font size (px) of "oteSphere" (optional; inherits if omitted)
//   gradient – apply the primary gradient to "oteSphere"
const BrandLogo = ({ nSize = 50, restSize, gradient = false, style = {} }) => {
  const restStyle = {
    display: "inline-block",
    marginLeft: "-6px",
    textAlign: "center",
  };
  if (restSize) restStyle.fontSize = `${restSize}px`;
  if (gradient) {
    Object.assign(restStyle, {
      background: "var(--grad-primary)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
    });
  }

  return (
    <span style={{ whiteSpace: "nowrap", ...style }}>
      <span
        style={{
          transform: "rotate(28deg)",
          display: "inline-block",
          textAlign: "center",
          fontFamily: "Georgia, serif",
          fontSize: `${nSize}px`,
          marginRight:"5px",
        }}
      >
        N
      </span>
      <span style={restStyle}>oteSphere</span>
    </span>
  );
};

export default BrandLogo;
