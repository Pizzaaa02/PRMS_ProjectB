import { listFiles, getFile, deleteFile } from '../api/file';
import { useState, useEffect } from 'react';
import { Image, Video, FileText, Upload, Trash2 } from 'lucide-react';

const FILTERS = ['all', 'image', 'document', 'video'];

function ProfileMedia() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    async function loadFiles() {
      setLoading(true);
      try {
        const result = await listFiles(1, 100, undefined);
        if (result?.success === false && result?.error) {
          setFiles([]);
        } else {
          const data = result?.data || result;
          setFiles(data?.files || []);
        }
      } catch (err) {
        console.error('Failed to load files:', err);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    }
    loadFiles();
  }, []);

  const filteredFiles = files.filter((f) => {
    if (filter === 'all') return true;
    if (filter === 'image') return f.mimeType?.startsWith('image/');
    if (filter === 'video') return f.mimeType?.startsWith('video/');
    if (filter === 'document') return f.mimeType?.includes('pdf') || f.mimeType?.includes('word') || ['doc', 'docx', 'txt'].includes(f.mimeType);
    return true;
  });

  const handleDelete = async (fileId) => {
    await deleteFile(fileId);
    setFiles(files.filter(f => f.id !== fileId));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await listFiles(/* upload file */);
  };

  if (loading) return <div className="loading">Loading files...</div>;

  return (
    <div className="profile-media">
      <div className="filter-bar">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <input
          type="file"
          id="file-upload"
          className="file-upload-input"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleUpload}
        />
        <label htmlFor="file-upload" className="upload-btn">
          <Upload size={16} />
          Upload
        </label>
      </div>
      <div className="file-grid">
        {filteredFiles.map(f => (
          <div key={f.id} className="file-item">
            {f.mimeType?.startsWith('image/') ? (
              <Image size={32} />
            ) : f.mimeType?.startsWith('video/') ? (
              <Video size={32} />
            ) : (
              <FileText size={32} />
            )}
            <span>{f.name}</span>
            <button onClick={() => handleDelete(f.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      {previewFile && (
        <div className="preview-overlay" onClick={() => setPreviewFile(null)}>
          <div className="preview-content">
            {previewFile.mimeType?.startsWith('image/') && <img src={previewFile.url} alt={previewFile.name} />}
            {previewFile.mimeType?.startsWith('video/') && <video src={previewFile.url} controls />}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileMedia;
