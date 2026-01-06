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
    veinDirectionLocked,
    setVeinDirectionLocked,
    showEdgeWrap,
    setShowEdgeWrap,
    resetSlabTransform,
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
              <div style={{ ...styles.buttonGroup, marginTop: 'var(--spacing-xs)' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSlabTransform({ scale: 0.5 })}
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  0.5x
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSlabTransform({ scale: 1.0 })}
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  1.0x
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSlabTransform({ scale: 1.5 })}
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  1.5x
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSlabTransform({ scale: 2.0 })}
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  2.0x
                </button>
              </div>
            </div>

            <div style={styles.control}>
              <label style={styles.label}>Offset X: {slabTransform.offsetX.toFixed(2)}</label>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                <button
                  className="btn-icon"
                  onClick={() => setSlabTransform({ offsetX: Math.max(-2, slabTransform.offsetX - 0.1) })}
                  title="Move left"
                  style={{ fontSize: '0.75rem', padding: '4px' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.05"
                  value={slabTransform.offsetX}
                  onChange={(e) => setSlabTransform({ offsetX: Number(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn-icon"
                  onClick={() => setSlabTransform({ offsetX: Math.min(2, slabTransform.offsetX + 0.1) })}
                  title="Move right"
                  style={{ fontSize: '0.75rem', padding: '4px' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

            <div style={styles.control}>
              <label style={styles.label}>Offset Y: {slabTransform.offsetY.toFixed(2)}</label>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                <button
                  className="btn-icon"
                  onClick={() => setSlabTransform({ offsetY: Math.max(-2, slabTransform.offsetY - 0.1) })}
                  title="Move up"
                  style={{ fontSize: '0.75rem', padding: '4px' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.05"
                  value={slabTransform.offsetY}
                  onChange={(e) => setSlabTransform({ offsetY: Number(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn-icon"
                  onClick={() => setSlabTransform({ offsetY: Math.min(2, slabTransform.offsetY + 0.1) })}
                  title="Move down"
                  style={{ fontSize: '0.75rem', padding: '4px' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            </div>

            <div style={styles.control}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={styles.label}>Vein Direction</label>
                <button
                  className={`btn-icon ${veinDirectionLocked ? 'active' : ''}`}
                  onClick={() => setVeinDirectionLocked(!veinDirectionLocked)}
                  title={veinDirectionLocked ? 'Unlock vein direction' : 'Lock vein direction'}
                  style={{ fontSize: '0.75rem' }}
                >
                  {veinDirectionLocked ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    </svg>
                  )}
                </button>
              </div>
              <div style={styles.buttonGroup}>
                <button
                  className={`btn btn-secondary ${slabTransform.veinDirection === 'horizontal' ? 'active' : ''}`}
                  style={slabTransform.veinDirection === 'horizontal' ? styles.activeButton : {}}
                  onClick={() => !veinDirectionLocked && setSlabTransform({ veinDirection: 'horizontal' })}
                  disabled={veinDirectionLocked}
                >
                  Horizontal
                </button>
                <button
                  className={`btn btn-secondary ${slabTransform.veinDirection === 'vertical' ? 'active' : ''}`}
                  style={slabTransform.veinDirection === 'vertical' ? styles.activeButton : {}}
                  onClick={() => !veinDirectionLocked && setSlabTransform({ veinDirection: 'vertical' })}
                  disabled={veinDirectionLocked}
                >
                  Vertical
                </button>
              </div>
            </div>

            <div style={styles.control}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={showEdgeWrap}
                  onChange={(e) => setShowEdgeWrap(e.target.checked)}
                  style={{ marginRight: 'var(--spacing-sm)' }}
                />
                Show Edge Wrap
              </label>
            </div>

            <button
              className="btn btn-secondary"
              onClick={resetSlabTransform}
              style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              Reset Transform
            </button>
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
