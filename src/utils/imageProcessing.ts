export async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function normalizeImage(img: HTMLImageElement, maxWidth = 1920, maxHeight = 1080): HTMLImageElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  let width = img.width;
  let height = img.height;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = width * ratio;
    height = height * ratio;
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, width, height);

  const normalized = new Image();
  normalized.src = canvas.toDataURL('image/jpeg', 0.92);

  return normalized;
}

export function createEmptyMask(width: number, height: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return ctx.createImageData(width, height);
}

export function applyBrushToMask(
  mask: ImageData,
  x: number,
  y: number,
  radius: number,
  erase: boolean = false
): ImageData {
  const newMask = new ImageData(
    new Uint8ClampedArray(mask.data),
    mask.width,
    mask.height
  );

  const value = erase ? 0 : 255;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        const px = Math.floor(x + dx);
        const py = Math.floor(y + dy);

        if (px >= 0 && px < mask.width && py >= 0 && py < mask.height) {
          const idx = (py * mask.width + px) * 4;
          newMask.data[idx] = value;
          newMask.data[idx + 1] = value;
          newMask.data[idx + 2] = value;
          newMask.data[idx + 3] = 255;
        }
      }
    }
  }

  return newMask;
}

export function detectEdges(mask: ImageData, edgeWidth: number = 3): ImageData {
  const width = mask.width;
  const height = mask.height;
  const edgeMask = new ImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const isFilled = mask.data[idx] > 128;

      if (isFilled) {
        let isEdge = false;

        for (let dy = -edgeWidth; dy <= edgeWidth && !isEdge; dy++) {
          for (let dx = -edgeWidth; dx <= edgeWidth && !isEdge; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = (ny * width + nx) * 4;
              if (mask.data[nIdx] <= 128) {
                isEdge = true;
              }
            } else {
              isEdge = true;
            }
          }
        }

        if (isEdge) {
          edgeMask.data[idx] = 255;
          edgeMask.data[idx + 1] = 255;
          edgeMask.data[idx + 2] = 255;
          edgeMask.data[idx + 3] = 255;
        }
      }
    }
  }

  return edgeMask;
}

export function exportToImage(canvas: HTMLCanvasElement, filename: string = 'lithovision-render.jpg') {
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, 'image/jpeg', 0.95);
}
