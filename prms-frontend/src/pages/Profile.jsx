import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileHeader from '../components/ProfileHeader';
import ProfileFooter from '../components/ProfileFooter';
import ProfileMedia from '../components/ProfileMedia';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="profile">
      <ProfileHeader />
      <div className="profile-body">
        <ProfileMedia />
      </div>
      <div className="profile-footer">
        <ProfileFooter />
      </div>
    </div>
  );
}

export { Profile };