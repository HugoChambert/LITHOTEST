import { PerspectivePoint } from '../types';

export function calculatePerspectiveMatrix(
  src: PerspectivePoint[],
  dst: PerspectivePoint[]
): number[] {
  const A: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < 4; i++) {
    const sx = src[i].x;
    const sy = src[i].y;
    const dx = dst[i].x;
    const dy = dst[i].y;

    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);

    b.push(dx, dy);
  }

  const matrix = solveLinearSystem(A, b);

  return [...matrix, 1];
}

function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  const augmented: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }

    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }

  const x: number[] = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= augmented[i][i];
  }

  return x;
}

export function applyPerspectiveTransform(
  sourceCanvas: HTMLCanvasElement,
  corners: PerspectivePoint[]
): HTMLCanvasElement {
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = sourceCanvas.width;
  outputCanvas.height = sourceCanvas.height;

  const ctx = outputCanvas.getContext('2d')!;

  if (corners.length !== 4) {
    ctx.drawImage(sourceCanvas, 0, 0);
    return outputCanvas;
  }

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const dst: PerspectivePoint[] = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height }
  ];

  const matrix = calculatePerspectiveMatrix(corners, dst);

  const srcImageData = sourceCanvas.getContext('2d')!.getImageData(0, 0, width, height);
  const dstImageData = ctx.createImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcPoint = transformPoint(x, y, matrix);
      const sx = Math.floor(srcPoint.x);
      const sy = Math.floor(srcPoint.y);

      if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
        const srcIdx = (sy * width + sx) * 4;
        const dstIdx = (y * width + x) * 4;

        dstImageData.data[dstIdx] = srcImageData.data[srcIdx];
        dstImageData.data[dstIdx + 1] = srcImageData.data[srcIdx + 1];
        dstImageData.data[dstIdx + 2] = srcImageData.data[srcIdx + 2];
        dstImageData.data[dstIdx + 3] = srcImageData.data[srcIdx + 3];
      }
    }
  }

  ctx.putImageData(dstImageData, 0, 0);
  return outputCanvas;
}

function transformPoint(x: number, y: number, matrix: number[]): PerspectivePoint {
  const w = matrix[6] * x + matrix[7] * y + matrix[8];
  return {
    x: (matrix[0] * x + matrix[1] * y + matrix[2]) / w,
    y: (matrix[3] * x + matrix[4] * y + matrix[5]) / w
  };
}
