import * as tf from '@tensorflow/tfjs';
import * as deeplab from '@tensorflow-models/deeplab';

let model: deeplab.SemanticSegmentation | null = null;

export async function loadSegmentationModel(): Promise<void> {
  if (model) return;

  try {
    await tf.ready();
    model = await deeplab.load({
      base: 'pascal',
      quantizationBytes: 2
    });
  } catch (error) {
    console.error('Failed to load segmentation model:', error);
    throw new Error('Could not load AI segmentation model');
  }
}

export async function segmentCountertop(image: HTMLImageElement): Promise<ImageData> {
  if (!model) {
    await loadSegmentationModel();
  }

  if (!model) {
    throw new Error('Model not loaded');
  }

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, 0, 0);

  const segmentation = await model.segment(canvas);

  const mask = ctx.createImageData(canvas.width, canvas.height);

  for (let i = 0; i < segmentation.segmentationMap.length; i++) {
    const label = segmentation.segmentationMap[i];

    const idx = i * 4;
    if (label === 15 || label === 14 || label === 12) {
      mask.data[idx] = 255;
      mask.data[idx + 1] = 255;
      mask.data[idx + 2] = 255;
      mask.data[idx + 3] = 255;
    } else {
      mask.data[idx] = 0;
      mask.data[idx + 1] = 0;
      mask.data[idx + 2] = 0;
      mask.data[idx + 3] = 255;
    }
  }

  return mask;
}

export function refineMask(mask: ImageData, threshold: number = 128): ImageData {
  const refined = new ImageData(
    new Uint8ClampedArray(mask.data),
    mask.width,
    mask.height
  );

  for (let i = 0; i < refined.data.length; i += 4) {
    const value = refined.data[i] > threshold ? 255 : 0;
    refined.data[i] = value;
    refined.data[i + 1] = value;
    refined.data[i + 2] = value;
  }

  return refined;
}

export function detectCountertopCorners(mask: ImageData): { x: number; y: number }[] {
  const width = mask.width;
  const height = mask.height;

  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (mask.data[idx] > 128) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  return [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY }
  ];
}
