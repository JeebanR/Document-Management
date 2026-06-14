import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { uploadDocument } from '../api/documents';
import { getErrorMessage } from '../api/client';
import './UploadModal.css';

interface UploadModalProps {
  onClose: () => void;
  onUploaded: () => void;
}

export function UploadModal({ onClose, onUploaded }: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(selected: File | null) {
    setError(null);
    if (selected && selected.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      setFile(null);
      return;
    }
    setFile(selected);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError('Please choose a PDF file to upload.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await uploadDocument(title.trim(), file);
      onUploaded();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <div className="page-header__eyebrow">New Entry</div>
            <h2>Add a document</h2>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="doc-title">Title</label>
            <input
              id="doc-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Financial Report"
              required
              maxLength={255}
            />
          </div>

          <div className="field">
            <label htmlFor="doc-file">File (PDF only)</label>
            <div
              className={`dropzone ${file ? 'dropzone--filled' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileChange(e.dataTransfer.files[0] ?? null);
              }}
            >
              {file ? (
                <>
                  <span className="dropzone__filename">{file.name}</span>
                  <span className="dropzone__size">{(file.size / 1024).toFixed(1)} KB</span>
                </>
              ) : (
                <>
                  <span>Drop a PDF here, or click to browse</span>
                  <span className="dropzone__hint">Max size set by server configuration</span>
                </>
              )}
              <input
                ref={fileInputRef}
                id="doc-file"
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                hidden
              />
            </div>
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--stamp" disabled={loading}>
              {loading ? <span className="spinner" /> : 'File document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
