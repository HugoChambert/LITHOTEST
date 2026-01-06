import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { segmentCountertop, detectCountertopCorners } from '../utils/segmentation';
import { applyBrushToMask, createEmptyMask } from '../utils/imageProcessing';

export function MaskEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  const {
    normalizedPhoto,
    mask,
    setMask,
    editMode,
    brushSize,
    setIsProcessing
  } = useAppStore();

  useEffect(() => {
    if (!canvasRef.current || !normalizedPhoto) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    canvas.width = normalizedPhoto.width;
    canvas.height = normalizedPhoto.height;

    ctx.drawImage(normalizedPhoto, 0, 0);

    if (mask.imageData) {
      ctx.globalAlpha = 0.5;
      ctx.putImageData(mask.imageData, 0, 0);
      ctx.globalAlpha = 1.0;
    }
  }, [normalizedPhoto, mask]);

  const handleAutoSegment = async () => {
    if (!normalizedPhoto) return;

    setIsProcessing(true);

    try {
      const maskData = await segmentCountertop(normalizedPhoto);
      const corners = detectCountertopCorners(maskData);

      setMask({
        imageData: maskData,
        corners
      });
    } catch (error) {
      console.error('Segmentation error:', error);
      alert('AI segmentation failed. Please use manual tools.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearMask = () => {
    if (!normalizedPhoto) return;

    const emptyMask = createEmptyMask(normalizedPhoto.width, normalizedPhoto.height);
    setMask({
      imageData: emptyMask,
      corners: []
    });
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (editMode !== 'mask-brush' && editMode !== 'mask-erase') return;

    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setLastPos(coords);
    applyBrush(coords.x, coords.y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || (editMode !== 'mask-brush' && editMode !== 'mask-erase')) return;

    const coords = getCanvasCoordinates(e);
    if (!coords || !lastPos) return;

    const dx = coords.x - lastPos.x;
    const dy = coords.y - lastPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.floor(distance / (brushSize / 4)));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = lastPos.x + dx * t;
      const y = lastPos.y + dy * t;
      applyBrush(x, y);
    }

    setLastPos(coords);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPos(null);
  };

  const applyBrush = (x: number, y: number) => {
    if (!mask.imageData || !normalizedPhoto) return;

    const erase = editMode === 'mask-erase';
    const newMaskData = applyBrushToMask(mask.imageData, x, y, brushSize, erase);

    setMask({
      ...mask,
      imageData: newMaskData
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <button className="btn btn-primary" onClick={handleAutoSegment}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Auto-Detect Countertop
        </button>
        <button className="btn btn-secondary" onClick={handleClearMask}>
          Clear Mask
        </button>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          ...styles.canvas,
          cursor: editMode === 'mask-brush' ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${brushSize}" height="${brushSize}"><circle cx="${brushSize / 2}" cy="${brushSize / 2}" r="${brushSize / 2}" fill="rgba(255,255,255,0.3)" stroke="white" stroke-width="2"/></svg>') ${brushSize / 2} ${brushSize / 2}, crosshair` : editMode === 'mask-erase' ? 'not-allowed' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--spacing-md)'
  },
  toolbar: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-md)',
    background: 'var(--secondary)',
    borderRadius: '0.5rem'
  },
  canvas: {
    flex: 1,
    maxWidth: '100%',
    maxHeight: 'calc(100% - 60px)',
    objectFit: 'contain' as const,
    background: 'var(--primary)',
    borderRadius: '0.5rem'
  }
};
