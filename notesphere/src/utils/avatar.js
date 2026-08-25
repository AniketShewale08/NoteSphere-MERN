// Deterministic "gradient by seed" avatars — every user gets a consistent,
// personalized color derived from a stable value (their email), with no
// file upload, no storage, and no color-picker UI required. Same idea
// Slack/Notion/Linear use for default avatars.
const GRADIENTS = [
  "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", // indigo -> violet
  "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)", // pink -> violet
  "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)", // cyan -> blue
  "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)", // emerald -> cyan
  "linear-gradient(135deg, #f97316 0%, #ec4899 100%)", // orange -> pink
  "linear-gradient(135deg, #f43f5e 0%, #f97316 100%)", // rose -> orange
];

// Simple, fast string hash (not cryptographic — just needs to spread
// evenly across the palette above) so the same seed always maps to the
// same gradient.
export function getAvatarGradient(seed) {
  if (!seed) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

// "John Doe" -> "JD", "Madonna" -> "M", "" / undefined -> "?"
export function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
