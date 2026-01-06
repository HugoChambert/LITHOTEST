import { useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { loadImage, normalizeImage } from '../utils/imageProcessing';

export function PhotoUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setOriginalPhoto, setNormalizedPhoto, setIsProcessing } = useAppStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG or PNG)');
      return;
    }

    setIsProcessing(true);

    try {
      const img = await loadImage(file);
      setOriginalPhoto(img);

      const normalized = normalizeImage(img);

      normalized.onload = () => {
        setNormalizedPhoto(normalized);
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Error loading image:', error);
      alert('Failed to load image. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div style={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        style={styles.fileInput}
        onChange={handleFileSelect}
      />
      <button
        className="btn btn-primary"
        onClick={() => fileInputRef.current?.click()}
        style={styles.uploadButton}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Upload Kitchen or Bathroom Photo
      </button>
      <p style={styles.hint}>JPG or PNG, up to 10MB</p>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 'var(--spacing-md)'
  },
  fileInput: {
    display: 'none'
  },
  uploadButton: {
    fontSize: '1rem',
    padding: 'var(--spacing-md) var(--spacing-xl)'
  },
  hint: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem'
  }
};
