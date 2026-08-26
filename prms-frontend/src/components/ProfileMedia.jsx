import { getUserMedia, deleteFile, deletePropertyImage, uploadFile } from '../api/file';
import { getFullUrl } from '../config/apiBaseUrl';
import { useState, useEffect } from 'react';
import { Image, Video, FileText, Upload, Trash2, X } from 'lucide-react';

const FILTERS = ['all', 'image', 'document', 'video'];

function ProfileMedia() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [previewItem, setPreviewItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    setLoading(true);
    try {
      const result = await getUserMedia();
      if (result?.success === false) {
        setMedia([]);
        setMessage('Failed to load media.');
      } else {
        const items = result?.data?.media || [];
        setMedia(items);
      }
    } catch (err) {
      console.error('Failed to load media:', err);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }

  // Filter media items by type
  const filtered = media.filter((item) => {
    if (filter === 'all') return true;
    const mime = item.mime_type || '';
    if (filter === 'image') return mime.startsWith('image/');
    if (filter === 'video') return mime.startsWith('video/');
    if (filter === 'document') return !mime.startsWith('image/') && !mime.startsWith('video/');
    return true;
  });

  // Delete handler - route to correct API based on item type
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;

    try {
      if (item.type === 'property') {
        await deletePropertyImage(item.id);
      } else {
        await deleteFile(item.id);
      }
      loadMedia();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  // Upload handler
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');
    try {
      const result = await uploadFile(file);
      if (result?.success === false) {
        setMessage(result?.error?.message || 'Upload failed');
      } else {
        setMessage('File uploaded successfully');
        loadMedia();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Preview URL construction
  const previewUrl = (item) => {
    return getFullUrl(item.url || item.thumbnail_url || '');
  };

  return (
    <div className="profile-media">
      <input
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
        onChange={handleUpload}
        style={{ display: 'none' }}
        id="hidden-file-input"
      />
      <div className="filter-bar">
        <div className="filter-buttons">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
                {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <label htmlFor="hidden-file-input" className="upload-button-label">
          <input type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" onChange={handleUpload} style={{display: 'none'}} />
          <Upload size={18} />
          Upload
        </label>
      </div>

      {uploading && <p style={{textAlign: 'center', color: '#3b82f6'}}>Uploading...</p>}
      {message && (
        <div className="upload-message" style={{
          textAlign: 'center',
          padding: '8px 16px',
          borderRadius: '6px',
          background: '#f0fdf4',
          color: '#166534',
          marginBottom: '1rem',
        }}>
          {message}
        </div>
      )}

      {loading && <p style={{ textAlign: 'center', color: '#575757' }}>Loading files...</p>}
      {!loading && filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: '#575757', padding: '3rem 0' }}>
          No files found.
        </p>
      )}

      <div className="file-grid">
        {filtered.map((item) => {
          const isImage = (item.mime_type || '').startsWith('image/');
          const isVideo = (item.mime_type || '').startsWith('video/');
          const url = previewUrl(item);

          return (
            <div key={item.id} className="file-card" onClick={() => setPreviewItem(item)}>
              <div className="file-card-preview">
                {isImage ? (
                  <img src={url} alt={item.name} />
                ) : isVideo ? (
                  <video src={url} />
                  ) : (
                  <FileText size={36} style={{ color: '#888' }} />
                  )}
              </div>
              <div className="file-card-info">
                <span className="file-card-name">{item.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview overlay */}
      {previewItem && (
        <div className="preview-overlay" onClick={() => setPreviewItem(null)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close" onClick={() => setPreviewItem(null)}>
              <X size={18} />
            </button>
            <button className="preview-delete" onClick={() => handleDelete(previewItem)}>
              <Trash2 size={14} />
              Delete
            </button>
            {(() => {
              const img = (previewItem.mime_type || '').startsWith('image/');
              const vid = (previewItem.mime_type || '').startsWith('video/');
              const src = previewUrl(previewItem);
              if (img) return <img src={src} alt={previewItem.name} />;
              if (vid) return <video src={src} controls style={{ maxWidth: '90%', maxHeight: '70vh' }} />;
              return (
                <div>
                  <FileText size={56} style={{ color: '#888' }} />
                  <p style={{ color: '#575757' }}>{previewItem.name}</p>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileMedia;
