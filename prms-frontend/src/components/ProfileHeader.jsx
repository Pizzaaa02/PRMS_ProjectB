import { useAuth } from '../contexts/AuthContext';
import { Camera, Settings } from 'lucide-react';

function ProfileHeader() {
  const { user, updateProfile } = useAuth();
  const handleUpdateName = async () => {
    // Demo: update profile name
    const newName = prompt('Enter new full name:', user?.full_name || '');
    if (newName) {
      await updateProfile({ full_name: newName });
    }
  };

  return (
    <header className="profile-header">
      <div className="profile-avatar">
        {user?.profile_img_url ? (
          <img src={user.profile_img_url} alt="Profile" />
        ) : (
          <div className="avatar-fallback">
            <Camera size={32} />
          </div>
        )}
      </div>
      <div className="profile-info">
        <h1>{user?.full_name || 'User'}</h1>
        <p>{user?.email || ''}</p>
        <button
          className="btn-edit"
          onClick={handleUpdateName}
        >
          <Settings size={16} />
          Edit Profile
        </button>
      </div>
    </header>
  );
}

export default ProfileHeader;
