import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Camera,
  Lock,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile, changePassword, clearError } = useAuth();

  /* ---- Profile state ---- */
  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    profile_img_url: user?.profile_img_url || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  /* ---- Password state ---- */
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNew: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ---- Handlers ---- */
  function goBack() {
    const role = user?.role?.toLowerCase() || 'tenant';
    navigate(`/${role}`);
  }

  const rolePath = ['admin', 'landlord', 'tenant', 'agent'].find((r) =>
    location.pathname.startsWith(`/${r}`)
  );

  async function handleSaveProfile() {
    setProfileSaving(true);
    setProfileMsg('');
    setProfileError('');
    clearError?.();
    try {
      const result = await updateProfile(profile);
      if (result.success) {
        setProfileMsg('Profile updated successfully');
      } else {
        setProfileError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!passwordForm.currentPassword.trim() || !passwordForm.newPassword.trim()) {
      setPasswordError('Current and new password are required');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNew) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg('');
    setPasswordError('');
    clearError?.();
    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (result.success) {
        setPasswordMsg('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmNew: '' });
      } else {
        setPasswordError(result.error || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  }

  function handleAvatarChange(e) {
    const url = e.target.value;
    setProfile((prev) => ({ ...prev, profile_img_url: url }));
  }

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="profile-header">
        <button type="button" className="back-btn" onClick={goBack} title="Go back">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1>My Profile</h1>
      </div>

      {/* Avatar section */}
      <div className="profile-section">
        <div className="profile-avatar-row">
          <div
            className="profile-avatar-lg"
            style={{
              backgroundImage: profile.profile_img_url
                ? `url(${profile.profile_img_url})`
                : 'none',
            }}
          >
            {(!profile.profile_img_url) && (
              <div className="profile-avatar-initials">
                {(user?.full_name || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-avatar-info">
            <p>Email address</p>
            <span>{user?.email || '—'}</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="avatar-url">Profile Image URL</label>
          <div className="input-with-icon">
            <Camera size={16} className="input-icon" />
            <input
              id="avatar-url"
              type="url"
              className="form-input"
              placeholder="https://example.com/avatar.jpg"
              value={profile.profile_img_url}
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="full-name">Full Name</label>
          <div className="input-with-icon">
            <User size={16} className="input-icon" />
            <input
              id="full-name"
              type="text"
              className="form-input"
              placeholder="Your full name"
              value={profile.full_name}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, full_name: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <div className="input-with-icon">
            <Phone size={16} className="input-icon" />
            <input
              id="phone"
              type="tel"
              className="form-input"
              placeholder="Your phone number"
              value={profile.phone}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>
        </div>

        <button
          type="button"
          className="save-btn"
          disabled={profileSaving}
          onClick={handleSaveProfile}
        >
          <Save size={16} />
          <span>{profileSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>

        {profileMsg && (
          <div className="msg success">
            <CheckCircle size={16} />
            <span>{profileMsg}</span>
          </div>
        )}
        {profileError && (
          <div className="msg error">
            <XCircle size={16} />
            <span>{profileError}</span>
          </div>
        )}
      </div>

      {/* Change password section */}
      <div className="profile-section">
        <h2>
          <Lock size={18} />
          <span>Change Password</span>
        </h2>

        <div className="form-group">
          <label htmlFor="current-password">Current Password</label>
          <div className="input-with-icon">
            <Eye size={16} className="input-icon" />
            <input
              id="current-password"
              type={showCurrent ? 'text' : 'password'}
              className="form-input"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
            />
            <button
              type="button"
              className="toggle-vis"
              onClick={() => setShowCurrent((v) => !v)}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="new-password">New Password</label>
          <div className="input-with-icon">
            <Lock size={16} className="input-icon" />
            <input
              id="new-password"
              type={showNew ? 'text' : 'password'}
              className="form-input"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
            />
            <button
              type="button"
              className="toggle-vis"
              onClick={() => setShowNew((v) => !v)}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password">Confirm New Password</label>
          <div className="input-with-icon">
            <Lock size={16} className="input-icon" />
            <input
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              className="form-input"
              value={passwordForm.confirmNew}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  confirmNew: e.target.value,
                }))
              }
            />
            <button
              type="button"
              className="toggle-vis"
              onClick={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="button"
          className="password-save-btn"
          disabled={passwordSaving}
          onClick={handleChangePassword}
        >
          <Lock size={16} />
          <span>{passwordSaving ? 'Updating...' : 'Update Password'}</span>
        </button>

        {passwordMsg && (
          <div className="msg success">
            <CheckCircle size={16} />
            <span>{passwordMsg}</span>
          </div>
        )}
        {passwordError && (
          <div
            className="msg error"
            onClick={() => setPasswordError('')}
            style={{ cursor: 'pointer' }}
          >
            <XCircle size={16} />
            <span>{passwordError}</span>
          </div>
        )}

        {user?.firebase_uid && (
          <p className="info-note">
            Note: If you log in with Google, password changes still apply for email/password login.
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default Profile;
