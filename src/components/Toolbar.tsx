import { useAppStore } from '../store/useAppStore';
import { exportToImage } from '../utils/imageProcessing';

export function Toolbar() {
  const {
    editMode,
    setEditMode,
    brushSize,
    setBrushSize,
    opacity,
    setOpacity,
    showBefore,
    setShowBefore,
    slabTransform,
    setSlabTransform,
    selectedSlab,
    normalizedPhoto,
    resetProject
  } = useAppStore();

  const handleExport = () => {
    const renderCanvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (renderCanvas) {
      exportToImage(renderCanvas, `lithovision-${selectedSlab?.sku || 'render'}.jpg`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Edit Mode</h3>
        <div style={styles.buttonGroup}>
          <button
            className={`btn-icon ${editMode === 'view' ? 'active' : ''}`}
            onClick={() => setEditMode('view')}
            title="View Mode"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            className={`btn-icon ${editMode === 'mask-brush' ? 'active' : ''}`}
            onClick={() => setEditMode('mask-brush')}
            title="Brush Tool"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </button>
          <button
            className={`btn-icon ${editMode === 'mask-erase' ? 'active' : ''}`}
            onClick={() => setEditMode('mask-erase')}
            title="Eraser Tool"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 20H7L3 16l10-10 7 7v7z" />
              <path d="M7 20v-7l3-3" />
            </svg>
          </button>
        </div>

        {(editMode === 'mask-brush' || editMode === 'mask-erase') && (
          <div style={styles.control}>
            <label style={styles.label}>Brush Size: {brushSize}px</label>
            <input
              type="range"
              min="5"
              max="100"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
          </div>
        )}
      </div>

      <div className="divider" />

      {selectedSlab && (
        <>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Slab Settings</h3>

            <div style={styles.control}>
              <label style={styles.label}>Opacity: {Math.round(opacity * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
              />
            </div>

            <div style={styles.control}>
              <label style={styles.label}>Scale: {slabTransform.scale.toFixed(2)}x</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={slabTransform.scale}
                onChange={(e) => setSlabTransform({ scale: Number(e.target.value) })}
              />
            </div>

            <div style={styles.control}>
              <label style={styles.label}>Offset X: {slabTransform.offsetX.toFixed(2)}</label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.05"
                value={slabTransform.offsetX}
                onChange={(e) => setSlabTransform({ offsetX: Number(e.target.value) })}
              />
            </div>

            <div style={styles.control}>
              <label style={styles.label}>Offset Y: {slabTransform.offsetY.toFixed(2)}</label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.05"
                value={slabTransform.offsetY}
                onChange={(e) => setSlabTransform({ offsetY: Number(e.target.value) })}
              />
            </div>

            <div style={styles.control}>
              <label style={styles.label}>Vein Direction</label>
              <div style={styles.buttonGroup}>
                <button
                  className={`btn btn-secondary ${slabTransform.veinDirection === 'horizontal' ? 'active' : ''}`}
                  style={slabTransform.veinDirection === 'horizontal' ? styles.activeButton : {}}
                  onClick={() => setSlabTransform({ veinDirection: 'horizontal' })}
                >
                  Horizontal
                </button>
                <button
                  className={`btn btn-secondary ${slabTransform.veinDirection === 'vertical' ? 'active' : ''}`}
                  style={slabTransform.veinDirection === 'vertical' ? styles.activeButton : {}}
                  onClick={() => setSlabTransform({ veinDirection: 'vertical' })}
                >
                  Vertical
                </button>
              </div>
            </div>
          </div>

          <div className="divider" />
        </>
      )}

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Actions</h3>

        <button
          className="btn btn-secondary"
          onClick={() => setShowBefore(!showBefore)}
          style={{ width: '100%' }}
        >
          {showBefore ? 'Show After' : 'Show Before'}
        </button>

        {selectedSlab && normalizedPhoto && (
          <button
            className="btn btn-primary"
            onClick={handleExport}
            style={{ width: '100%' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Image
          </button>
        )}

        <button
          className="btn btn-secondary"
          onClick={resetProject}
          style={{ width: '100%', color: 'var(--error)' }}
        >
          Reset Project
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--spacing-md)',
    overflowY: 'auto' as const
  },
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--spacing-sm)'
  },
  sectionTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  },
  buttonGroup: {
    display: 'flex',
    gap: 'var(--spacing-sm)'
  },
  control: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--spacing-xs)'
  },
  label: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)'
  },
  activeButton: {
    background: 'var(--accent)',
    color: 'var(--primary)',
    borderColor: 'var(--accent)'
  }
};
