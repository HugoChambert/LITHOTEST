import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { PhotoUpload } from './components/PhotoUpload';
import { RenderCanvas } from './components/RenderCanvas';
import { MaskEditor } from './components/MaskEditor';
import { SlabSelector } from './components/SlabSelector';
import { Toolbar } from './components/Toolbar';
import { loadSegmentationModel } from './utils/segmentation';

function App() {
  const { normalizedPhoto, isProcessing, editMode } = useAppStore();

  useEffect(() => {
    loadSegmentationModel().catch((error) => {
      console.error('Failed to preload AI model:', error);
    });
  }, []);

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="8" width="24" height="16" rx="2" stroke="var(--accent)" strokeWidth="2" />
            <path d="M8 24 L12 18 L16 22 L20 16 L24 20" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <h1 style={styles.title}>LithoVision</h1>
            <p style={styles.subtitle}>Luxury Stone Countertop Visualization</p>
          </div>
        </div>

        {isProcessing && (
          <div style={styles.processingBadge}>
            <div style={styles.spinner} />
            Processing...
          </div>
        )}
      </header>

      <div style={styles.main}>
        {!normalizedPhoto ? (
          <div style={styles.uploadContainer}>
            <PhotoUpload />
          </div>
        ) : (
          <>
            <aside style={styles.sidebar}>
              <SlabSelector />
            </aside>

            <main style={styles.content}>
              {editMode === 'mask-brush' || editMode === 'mask-erase' ? (
                <MaskEditor />
              ) : (
                <div style={styles.canvasContainer}>
                  <RenderCanvas />
                </div>
              )}
            </main>

            <aside style={styles.controlPanel}>
              <Toolbar />
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  app: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'var(--primary)',
    overflow: 'hidden'
  },
  header: {
    padding: 'var(--spacing-md) var(--spacing-xl)',
    background: 'var(--secondary)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--accent)',
    margin: 0,
    lineHeight: 1.2
  },
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    margin: 0,
    lineHeight: 1.2
  },
  processingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    background: 'var(--primary)',
    borderRadius: '0.375rem',
    color: 'var(--accent)',
    fontSize: '0.875rem'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid var(--border)',
    borderTop: '2px solid var(--accent)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  main: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  },
  uploadContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-xl)'
  },
  sidebar: {
    width: '320px',
    background: 'var(--secondary)',
    borderRight: '1px solid var(--border)',
    padding: 'var(--spacing-lg)',
    overflow: 'hidden'
  },
  content: {
    flex: 1,
    padding: 'var(--spacing-lg)',
    overflow: 'hidden'
  },
  canvasContainer: {
    width: '100%',
    height: '100%',
    background: 'var(--secondary)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  controlPanel: {
    width: '280px',
    background: 'var(--secondary)',
    borderLeft: '1px solid var(--border)',
    padding: 'var(--spacing-lg)',
    overflow: 'hidden'
  }
};

export default App;
