// Central API base URL for the whole frontend.
// If REACT_APP_API_URL is set (e.g. in production), it wins. Otherwise the backend host is
// auto-detected from wherever the app is opened — the same hostname you loaded the app on
// (localhost, or any LAN IP for phone testing), on port 5000. This means it keeps working
// even when your router hands the PC a new IP, with no config edits.
const API_URL =
  process.env.REACT_APP_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000`;

export default API_URL;
