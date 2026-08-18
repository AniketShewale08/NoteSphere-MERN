import React from "react";
import "./BackToTop.css";

// Scrolls the window back to the top of the list. Rendered inline in the notes
// action row alongside "Load More" rather than as a floating button, so it can
// never overlap card content.
//
// `hideOnWideScreens` is set by the caller when the rendered list is short. The
// breakpoint itself lives in CSS (.back-to-top-narrow-only) so no resize
// listener is needed — the media query re-evaluates on its own.
const BackToTop = ({ hideOnWideScreens = false }) => {
  const handleClick = () => {
    // Deliberately not passing `behavior: 'smooth'` here — html already sets
    // `scroll-behavior: smooth` in index.css, and that same file overrides it
    // to `auto` under `prefers-reduced-motion: reduce`. Passing an explicit
    // `behavior` on scrollTo would take priority over the CSS property and
    // silently break that reduced-motion handling.
    window.scrollTo(0, 0);
  };

  const className = [
    "btn",
    "btn-primary",
    "back-to-top",
    hideOnWideScreens ? "back-to-top-narrow-only" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      aria-label="Back to top"
    >
      <i className="fas fa-arrow-up" aria-hidden="true"></i>
    </button>
  );
};

export default BackToTop;
