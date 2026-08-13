import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import './ImageUploader.css';

interface ImageUploaderProps {
  value?: string;
  onImageUploaded: (url: string) => void;
  required?: boolean;
}

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onImageUploaded,
  required = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'vxwyhut0';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'luxestay_uploads';

  const uploadFileToCloudinary = (file: File) => {
    // 1. Validate File Type
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setError('Invalid file format. Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    // 2. Validate File Size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller image.`);
      return;
    }

    // Reset error & start upload
    setError(null);
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            onImageUploaded(response.secure_url);
            setProgress(100);
          } else {
            setError('Cloudinary upload failed: No secure_url returned.');
          }
        } catch (e) {
          setError('Failed to parse Cloudinary response.');
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          setError(errRes.error?.message || `Upload failed with status ${xhr.status}`);
        } catch {
          setError(`Upload failed with status ${xhr.status}. Please check credentials.`);
        }
      }
    });

    xhr.addEventListener('error', () => {
      setUploading(false);
      setError('Network error occurred during Cloudinary upload. Please try again.');
    });

    xhr.addEventListener('abort', () => {
      setUploading(false);
      setError('Upload was cancelled.');
    });

    xhr.open('POST', uploadUrl, true);
    xhr.send(formData);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFileToCloudinary(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFileToCloudinary(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    onImageUploaded('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileBrowser = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="cloudinary-image-uploader">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        style={{ display: 'none' }}
      />

      {/* Hidden input for HTML form validation if required */}
      {required && (
        <input
          type="text"
          value={value || ''}
          required={required}
          readOnly
          style={{ opacity: 0, height: 0, width: 0, position: 'absolute', pointerEvents: 'none' }}
          tabIndex={-1}
        />
      )}

      {/* Mode 1: Image already exists (Uploaded or Editing) */}
      {value && !uploading && (
        <div className="uploader-preview-container">
          <div className="preview-media">
            <img src={value} alt="Uploaded Hotel Preview" />
            <div className="preview-overlay">
              <span className="badge-cloud">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
                Cloudinary Hosted
              </span>
            </div>
          </div>
          <div className="preview-info">
            <p className="preview-filename" title={value}>
              {value.split('/').pop() || 'Hotel Image'}
            </p>
            <div className="preview-actions">
              <button
                type="button"
                className="btn-uploader-secondary"
                onClick={triggerFileBrowser}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                Replace Image
              </button>
              <button
                type="button"
                className="btn-uploader-danger"
                onClick={handleRemoveImage}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Uploading Progress */}
      {uploading && (
        <div className="uploader-progress-card">
          <div className="spinner-cloud"></div>
          <div className="progress-details">
            <div className="progress-labels">
              <span>Uploading to Cloudinary...</span>
              <span className="percent">{progress}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Empty Dropzone */}
      {!value && !uploading && (
        <div
          className={`uploader-dropzone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileBrowser}
        >
          <div className="dropzone-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path></svg>
          </div>
          <div className="dropzone-text">
            <p className="primary-prompt">
              <strong>Click to upload</strong> or drag and drop image here
            </p>
            <p className="secondary-prompt">JPG, PNG, or WEBP (Max 10MB)</p>
          </div>
          <button type="button" className="btn-browse-file">
            Choose Image File
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="uploader-error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>{error}</span>
          <button type="button" className="btn-dismiss-err" onClick={() => setError(null)}>
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
