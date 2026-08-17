import { useCallback, useEffect, useRef, useState } from 'react';
import { User, Mail, Phone, Lock, Edit3, Save, X, Camera, ImagePlus, FileText, Upload, Trash2, File as FileIcon, Download, Filter, ChevronLeft, ChevronRight, Eye, FileSpreadsheet, FileAudio, FileVideo } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile, listFiles, deleteFile } from '../api/file';
import defaultAvatar from '../assets/default-avatar.png';
import './Profile.css';

// Inline CropModal so we don't have to install react-easy-crop.
// Implements a minimal circular crop overlay + canvas export.
function CropModal({ imageSrc, onDone, onCancel, aspect = 1, cropSize = 256 }) {
  const wrapperRef = useRef(null);
  const [img, setImg] = useState({ w: 0, h: 0 });
  const [loaded, setLoaded] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const handlePointerDown = (e) => {
    dragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handlePointerMove = (e) => {
    if (!dragging.current || !img.w) return;
    const dx = (e.clientX - start.current.x) / scale;
    const dy = (e.clientY - start.current.y) / scale;
    setCrop(prev => ({
      x: clamp(prev.x + dx, -img.w + cropSize, 0),
      y: clamp(prev.y + dy, -img.h + cropSize, 0),
    }));
    start.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  const handleWheel = (e) => {
    if (!img.w) return;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => clamp(prev * delta, 0.5, 5));
  };

  const getCroppedFile = (callback) => {
    const image = document.getElementById('crop-image');
    if (!image) return;
    const canvas = document.createElement('canvas');
    canvas.width = cropSize;
    canvas.height = cropSize;
    const ctx = canvas.getContext('2d');
    const sx = (-crop.x) / scale;
    const sy = (-crop.y) / scale;
    const sw = cropSize / scale;
    const sh = cropSize / scale;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, cropSize, cropSize);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'avatar.png', { type: 'image/png' });
      callback(file);
    }, 'image/png', 0.95);
  };

  return (
    <div className="crop-overlay" onClick={onCancel}>
      <div className="crop-container" onClick={e => e.stopPropagation()} onWheel={handleWheel}>
        <div className="crop-header">
          <h3>Position & Zoom</h3>
          <button className="crop-close" onClick={onCancel}><X size={20} /></button>
        </div>
        <div
          className="crop-viewer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <img
            id="crop-image"
            src={imageSrc}
            onLoad={(e) => {
              const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
              setImg({ w, h });
              // Fit the image within the crop-viewer (360px tall, ~472px wide)
              const containerH = 360;
              const containerW = 472;
              setScale(Math.min(containerW / w, containerH / h));
              setCrop({ x: -(w - cropSize) / 2, y: -(h - cropSize) / 2 });
            }}
            style={{
              width: img.w * scale,
              height: img.h * scale,
              transform: `translate(${crop.x * scale}px, ${crop.y * scale}px)`,
            }}
            draggable={false}
          />
          <div className="crop-circle" />
        </div>
        <div className="crop-actions">
          <button className="crop-cancel" onClick={onCancel}>Cancel</button>
          <button className="crop-confirm" onClick={() => getCroppedFile(onDone)}>Use This Crop</button>
        </div>
      </div>
    </div>
  );
}

/* ====================== MAIN ====================== */

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3500';

function ProfilePage() {
  const { user, updateProfile, changePassword, uploadProfileImage: apiUploadImage, clearError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [cropSrc, setCropSrc] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  /* ---- Document file gallery ---- */

  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesUploading, setFilesUploading] = useState(false);
  const [filePage, setFilePage] = useState(1);
  const [fileTotalPages, setFileTotalPages] = useState(1);
  const [fileFilter, setFileFilter] = useState('all'); // all | image | document
  const [previewFile, setPreviewFile] = useState(null); // file object for preview modal
  const fileInputRef2 = useRef(null);
  const FILES_PER_PAGE = 6;

  /* Keep a live ref so async callbacks don't capture a stale page number */
  const filePageRef = useRef(filePage);
  useEffect(() => { filePageRef.current = filePage; }, [filePage]);

  const loadFiles = async (page = filePageRef.current) => {
    setFilesLoading(true);
    try {
      const category = fileFilter === 'all' ? undefined : fileFilter;
      const result = await listFiles(page, FILES_PER_PAGE, category);
      if (result?.success === false && result.error) {
        return;
      }
      const data = result?.data || result;
      setFiles(data?.files || []);
      const total = data?.total ?? data?.files?.length ?? 0;
      setFileTotalPages(Math.ceil(total / FILES_PER_PAGE) || 1);
    } catch {
      /* ignore */
    } finally {
      setFilesLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(1);
  }, [fileFilter]);

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilesUploading(true);
    try {
      await uploadFile(file);
      loadFiles(filePage);
    } catch {
      /* ignore */
    } finally {
      setFilesUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Delete this file?')) return;
    await deleteFile(fileId);
    loadFiles(filePage);
  };

  const handleFilePageChange = (p) => {
    if (p >= 1 && p <= fileTotalPages) {
      setFilePage(p);
      loadFiles(p);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <ImagePlus size={20} />;
    if (mimeType?.includes('pdf')) return <FileText size={20} />;
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return <FileSpreadsheet size={20} />;
    if (mimeType?.includes('audio')) return <FileAudio size={20} />;
    if (mimeType?.includes('video')) return <FileVideo size={20} />;
    return <FileIcon size={20} />;
  };

  const getPublicUrl = (url) => {
    if (!url) return '';
    if (url?.startsWith('http')) return url;
    return API + (url?.startsWith('/') ? url : '/' + url);
  };

  const effectiveProfile = getPublicUrl(user?.profile_img_url || user?.profile?.profile_img_url || '');

  useEffect(() => {
    if (user) {
      setFormData({ full_name: user.full_name || '', phone: user.phone || '' });
    }
  }, [user]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSaveProfile = async () => {
    const result = await updateProfile(formData);
    if (result.success) setIsEditing(false);
  };

  const handleChangePassword = async () => {
    const result = await changePassword(passwordData);
    if (result.success) {
      setPasswordData({ currentPassword: '', newPassword: '' });
    }
  };

  /* ---- Avatar upload flow ---- */

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Open crop modal
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    setShowCrop(true);
  };

  const handleCropped = async (croppedFile) => {
    setShowCrop(false);
    URL.revokeObjectURL(cropSrc);
    setPreviewUrl(URL.createObjectURL(croppedFile));
    setIsUploading(true);
    try {
      const result = await apiUploadImage(croppedFile);
      if (!result.success) return;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    setShowCrop(true);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header-content">
          <h1>User Profile</h1>
          <p>Manage your account information and preferences</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-avatar-section">
          <div
            className="profile-avatar-upload-zone"
            data-dragging="false"
            onDragOver={handleDragOver}
            onDragLeave={(e) => { e.currentTarget.dataset.dragging = 'false'; }}
            onDragEnter={(e) => { e.currentTarget.dataset.dragging = 'true'; }}
            onDrop={handleDrop}
            onClick={handleAvatarClick}
          >
            <div className="avatar-preview">
              {isUploading && <div className="avatar-uploading"><img src={previewUrl || effectiveProfile || defaultAvatar} alt="" /></div>}
              <img
                src={previewUrl || effectiveProfile || defaultAvatar}
                alt="Profile"
                className={isUploading ? 'avatar-ghost' : ''}
              />
            </div>
            <div className="avatar-overlay">
              <ImagePlus size={24} />
              <span>Change Photo</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelected}
              className="avatar-input hidden"
            />
          </div>
          <p className="avatar-hint">Click or drag &amp; drop to change. JPEG, PNG, GIF, WebP up to 5MB.</p>
        </div>

        {/* Personal Info */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-left">
              <div className="card-icon"><User size={20} /></div>
              <div>
                <h2>Personal Information</h2>
                <p>Update your personal details and profile photo</p>
              </div>
            </div>
            {!isEditing ? (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                <Edit3 size={16} /> Edit
              </button>
            ) : (
              <div className="btn-group">
                <button className="btn-save" onClick={handleSaveProfile}>
                  <Save size={16} /> Save
                </button>
                <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <input id="full_name" type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} disabled={!isEditing} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input id="email" type="email" value={user?.email || ''} disabled />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <div className="input-with-icon">
                  <Phone size={16} />
                  <input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!isEditing} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <input id="role" type="text" value={user?.role || ''} disabled />
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-left">
              <div className="card-icon"><Lock size={20} /></div>
              <div>
                <h2>Change Password</h2>
                <p>Update your account password</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <button className="btn-password" onClick={handleChangePassword}>
                <Lock size={16} /> Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Document File Gallery */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-left">
              <div className="card-icon"><FileText size={20} /></div>
              <div>
                <h2>My Documents</h2>
                <p>Upload and manage your files</p>
              </div>
            </div>
            <button className="btn-edit" onClick={() => fileInputRef2.current?.click()}>
              <Upload size={16} /> Upload
            </button>
            <input
              ref={fileInputRef2}
              type="file"
              onChange={handleDocumentUpload}
              className="avatar-input hidden"
              disabled={filesLoading || filesUploading}
            />
          </div>
          <div className="card-body">
            {/* Filters */}
            <div className="file-filters">
              <span className="file-filter-label"><Filter size={14} /> Filter:</span>
              {['all', 'image', 'document'].map((f) => (
                <button
                  key={f}
                  className={`file-filter-btn ${fileFilter === f ? 'active' : ''}`}
                  onClick={() => setFileFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Loading states */}
            {filesLoading && <div className="file-gallery-loading">Loading files...</div>}
            {filesUploading && <div className="file-gallery-uploading">Uploading...</div>}

            {/* Gallery grid */}
            {!filesLoading && files.length > 0 && (
              <div className="file-gallery">
                {files.map((f) => (
                  <div key={f.id || f.fileId} className="file-card">
                    <div className="file-card-preview" onClick={() => setPreviewFile(f)} style={{ cursor: 'pointer' }}>
                      {f.mimeType?.startsWith('image/') ? (
                        <img src={getPublicUrl(f.url)} alt={f.originalName} />
                      ) : (
                        <div className="file-icon-placeholder">{getFileIcon(f.mimeType)}</div>
                      )}
                      <div className="file-preview-overlay"><Eye size={18} /></div>
                    </div>
                    <div className="file-card-info">
                      <span className="file-name" title={f.originalName}>{f.originalName}</span>
                      <span className="file-meta">{formatFileSize(f.fileSize)}</span>
                    </div>
                    <div className="file-card-actions">
                      <a
                        href={getPublicUrl(f.url)}
                        download={f.originalName}
                        className="file-action-btn"
                        title="Download"
                      >
                        <Download size={16} />
                      </a>
                      <button
                        className="file-action-btn file-delete-btn"
                        onClick={() => handleDeleteFile(f.id || f.fileId)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!filesLoading && files.length === 0 && (
              <div className="file-gallery-empty">
                <FileText size={48} />
                <p>No files yet. Upload your first document.</p>
              </div>
            )}

            {/* Pagination */}
            {!filesLoading && fileTotalPages > 1 && (
              <div className="file-pagination">
                <button
                  className="file-page-btn"
                  disabled={filePage <= 1}
                  onClick={() => handleFilePageChange(filePage - 1)}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span className="file-page-info">Page {filePage} of {fileTotalPages}</span>
                <button
                  className="file-page-btn"
                  disabled={filePage >= fileTotalPages}
                  onClick={() => handleFilePageChange(filePage + 1)}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {showCrop && (
        <CropModal
          imageSrc={cropSrc}
          onDone={handleCropped}
          onCancel={() => { setShowCrop(false); URL.revokeObjectURL(cropSrc); }}
        />
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="preview-overlay" onClick={() => setPreviewFile(null)}>
          <div className="preview-container" onClick={e => e.stopPropagation()}>
            <div className="preview-header">
              <span className="preview-title" title={previewFile.originalName}>{previewFile.originalName}</span>
              <button className="preview-close" onClick={() => setPreviewFile(null)}><X size={20} /></button>
            </div>
            <div className="preview-body">
              {previewFile.mimeType?.startsWith('image/') && (
                <img src={getPublicUrl(previewFile.url)} alt={previewFile.originalName} />
              )}
              {(previewFile.mimeType?.includes('pdf') || previewFile.mimeType?.includes('application/pdf')) && (
                <iframe src={getPublicUrl(previewFile.url)} title={previewFile.originalName} />
              )}
              {(previewFile.mimeType?.startsWith('video/') || previewFile.mimeType?.includes('video')) && (
                <video src={getPublicUrl(previewFile.url)} controls autoPlay title={previewFile.originalName} />
              )}
              {(previewFile.mimeType?.startsWith('audio/') || previewFile.mimeType?.includes('audio')) && (
                <div className="preview-audio">
                  <FileAudio size={64} />
                  <audio src={getPublicUrl(previewFile.url)} controls autoPlay />
                  <p className="preview-audio-name">{previewFile.originalName}</p>
                </div>
              )}
              {!previewFile.mimeType?.startsWith('image/') &&
               !previewFile.mimeType?.includes('pdf') &&
               !previewFile.mimeType?.includes('video') &&
               !previewFile.mimeType?.startsWith('audio') && (
                <div className="preview-fallback">
                  {getFileIcon(previewFile.mimeType)}
                  <p>This file type cannot be previewed inline.</p>
                </div>
              )}
            </div>
            <div className="preview-footer">
              <span className="preview-meta">{formatFileSize(previewFile.fileSize)}</span>
              <a href={getPublicUrl(previewFile.url)} download={previewFile.originalName} className="btn-edit">
                <Download size={16} /> Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
