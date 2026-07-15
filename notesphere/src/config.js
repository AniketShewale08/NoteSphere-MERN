// Central API base URL for the whole frontend.
// Override per-environment with REACT_APP_API_URL (see .env.sample).
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default API_URL;
