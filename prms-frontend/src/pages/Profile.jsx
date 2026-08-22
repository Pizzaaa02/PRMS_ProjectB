import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { listFiles, uploadFile, getUserMedia, deleteFile, deletePropertyImage } from '../api/file';
import { uploadFile as uploadFileAPI, downloadFile, getFile, deleteFile as deleteFileAPI } from '../api/file';
import ProfileHeader from '../components/ProfileHeader';
import ProfileFooter from '../components/ProfileFooter';
import ProfileMedia from '../components/ProfileMedia';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const [userFiles] = useState([]);
  const [mediaItems] = useState({});
  const [loading] = useState(true);
  const [activeTab] = useState('documents');

  const handleDelete = async (fileId) => {
    const isProperty = mediaItems.find(m => m.id === fileId);
    if (isProperty) {
      // Delete via property media
      await deletePropertyImage(fileId);
    } else {
      // Delete via userFiles
      await deleteFile(fileId);
    }
  };

  return (
    <div className="profile">
      <ProfileHeader />
      <div className="profile-body">
        <ProfileMedia
          mediaItems={mediaItems}
          userFiles={userFiles}
          handleDelete={handleDelete}
          loading={loading}
        />
      </div>
      <div className="profile-footer">
        <ProfileFooter />
      </div>
    </div>
  );
}

export { Profile };