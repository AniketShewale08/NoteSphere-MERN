import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import alertContext from "../../context/alert/alertContext";
import API_URL from "../../config";
import { getAvatarGradient, getInitials } from "../../utils/avatar";
import {
  FaStickyNote,
  FaCalendarAlt,
  FaPen,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "./Profile.css";

const Profile = () => {
  const { showAlert } = useContext(alertContext);
  const navigate = useNavigate();
  const closeModalRef = useRef(null);
  const closePasswordModalRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Delete-account confirmation state
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Inline name-edit state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameError, setNameError] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Change-password modal state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const json = await response.json();
        setProfile(json);
      } catch (error) {
        showAlert("Failed to load your profile. Please try again.", "danger");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // Runs once on mount only — navigate/showAlert identities are stable enough
    // for this one-shot fetch, matching the pattern used elsewhere in the app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEditingName = () => {
    setNameDraft(profile.user.name);
    setNameError("");
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setNameError("");
  };

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (trimmed.length < 3) {
      setNameError("Name must be at least 3 characters long.");
      return;
    }

    setSavingName(true);
    setNameError("");
    try {
      const response = await fetch(`${API_URL}/api/auth/updateprofile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ name: trimmed }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const json = await response.json();
      if (response.ok && json.success) {
        setProfile((prev) => ({ ...prev, user: { ...prev.user, name: json.user.name } }));
        // Keep the navbar avatar's initials in sync without a page reload.
        localStorage.setItem("userName", json.user.name);
        setIsEditingName(false);
        showAlert("Name updated successfully", "success");
      } else {
        setNameError(
          json.errors?.[0]?.msg || json.error || "Failed to update name."
        );
      }
    } catch (error) {
      setNameError("Something went wrong. Please try again.");
    } finally {
      setSavingName(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      setDeleteError("Please enter your password to confirm.");
      return;
    }

    setDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`${API_URL}/api/auth/deleteaccount`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ password }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const json = await response.json();

      if (response.ok && json.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        // Dismiss the modal (this also fires its own onClick, which just clears
        // local state — harmless right before navigating away).
        closeModalRef.current?.click();
        showAlert("Your account has been deleted.", "success");
        navigate("/");
      } else {
        setDeleteError(
          json.error || "Failed to delete account. Please try again."
        );
      }
    } catch (error) {
      setDeleteError("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const resetDeleteState = () => {
    setPassword("");
    setDeleteError("");
  };

  const resetPasswordModalState = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordError("");
    setShowPasswords(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }

    setChangingPassword(true);
    setPasswordError("");
    try {
      const response = await fetch(`${API_URL}/api/auth/changepassword`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = await response.json();

      if (response.ok && json.success) {
        // A changed password bumps tokenVersion server-side, invalidating the
        // token used for this very request — the response includes a fresh
        // one so the user stays logged in instead of being bounced to /login
        // right after changing their own password.
        localStorage.setItem("token", json.authenticate);
        closePasswordModalRef.current?.click();
        showAlert("Password changed successfully", "success");
      } else if (response.status === 401) {
        // Only reachable if the OLD token was already invalid for some other
        // reason (e.g. a previous password reset elsewhere) — not the normal
        // path, since a successful change above returns a fresh token.
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setPasswordError(
          json.errors?.[0]?.msg || json.error || "Failed to change password."
        );
      }
    } catch (error) {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <p className="text-center profile-loading">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <>
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
          <span
            className="profile-avatar"
            style={{ background: getAvatarGradient(profile.user.email) }}
          >
            {getInitials(profile.user.name)}
          </span>

          {isEditingName ? (
            <div className="profile-name-edit">
              <input
                type="text"
                className={`form-control${nameError ? " is-invalid" : ""}`}
                value={nameDraft}
                onChange={(e) => {
                  setNameDraft(e.target.value);
                  setNameError("");
                }}
                autoFocus
                aria-label="Edit your name"
              />
              <button
                type="button"
                className="profile-name-edit-btn profile-name-save"
                onClick={saveName}
                disabled={savingName}
                aria-label="Save name"
                title="Save"
              >
                <FaCheck />
              </button>
              <button
                type="button"
                className="profile-name-edit-btn profile-name-cancel"
                onClick={cancelEditingName}
                disabled={savingName}
                aria-label="Cancel editing name"
                title="Cancel"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <h1 className="profile-name">
              {profile.user.name}
              <button
                type="button"
                className="profile-name-edit-trigger"
                onClick={startEditingName}
                aria-label="Edit your name"
                title="Edit name"
              >
                <FaPen />
              </button>
            </h1>
          )}
          {nameError && (
            <p className="profile-name-error" role="alert">
              {nameError}
            </p>
          )}

          <p className="profile-email">{profile.user.email}</p>
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <FaStickyNote className="profile-stat-icon" />
              <div>
                <span className="profile-stat-value">
                  {profile.notesCount}
                </span>
                <span className="profile-stat-label">
                  {profile.notesCount === 1 ? "Note" : "Notes"}
                </span>
              </div>
            </div>
            <div className="profile-stat">
              <FaCalendarAlt className="profile-stat-icon" />
              <div>
                <span className="profile-stat-value">
                  {new Date(profile.user.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="profile-stat-label">Member since</span>
              </div>
            </div>
          </div>

          <div className="profile-security">
            <button
              type="button"
              className="btn btn-secondary profile-change-password-btn"
              data-bs-toggle="modal"
              data-bs-target="#changePasswordModal"
            >
              Change Password
            </button>
          </div>

          <div className="profile-footer">
            <button
              type="button"
              className="profile-delete-link"
              data-bs-toggle="modal"
              data-bs-target="#deleteAccountModal"
            >
              Delete my account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account confirmation modal */}
      <div
        className="modal fade"
        id="deleteAccountModal"
        tabIndex="-1"
        aria-labelledby="deleteAccountModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteAccountModalLabel">
                Delete your account?
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={resetDeleteState}
              ></button>
            </div>
            <div className="modal-body">
              <p className="delete-warning-text">
                This permanently deletes your account and every note you've
                created. This can't be undone.
              </p>
              <label htmlFor="confirmPassword" className="form-label">
                Enter your password to confirm
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="form-control"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setDeleteError("");
                }}
                autoComplete="current-password"
              />
              {deleteError && (
                <p className="delete-error-text" role="alert">
                  {deleteError}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                ref={closeModalRef}
                onClick={resetDeleteState}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, delete my account"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password modal */}
      <div
        className="modal fade"
        id="changePasswordModal"
        tabIndex="-1"
        aria-labelledby="changePasswordModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="changePasswordModalLabel">
                Change Password
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={resetPasswordModalState}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label">
                  Current password
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  id="currentPassword"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordError("");
                  }}
                  autoComplete="current-password"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  New password
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  id="newPassword"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError("");
                  }}
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div className="mb-2">
                <label htmlFor="confirmNewPassword" className="form-label">
                  Confirm new password
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  id="confirmNewPassword"
                  className="form-control"
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    setPasswordError("");
                  }}
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <button
                type="button"
                className="profile-show-passwords-toggle"
                onClick={() => setShowPasswords((prev) => !prev)}
              >
                {showPasswords ? <FaEyeSlash /> : <FaEye />}{" "}
                {showPasswords ? "Hide" : "Show"} passwords
              </button>
              {passwordError && (
                <p className="delete-error-text" role="alert">
                  {passwordError}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                ref={closePasswordModalRef}
                onClick={resetPasswordModalState}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
