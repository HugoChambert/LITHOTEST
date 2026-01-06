export interface Slab {
  sku: string;
  name: string;
  finish: 'Polished' | 'Honed' | 'Leathered' | 'Brushed';
  image: string;
  quarry: string;
  color?: string;
  type?: string;
}

export interface SlabTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
  veinDirection: 'horizontal' | 'vertical';
}

export interface PerspectivePoint {
  x: number;
  y: number;
}

export interface CountertopMask {
  imageData: ImageData | null;
  corners: PerspectivePoint[];
}

export interface ProjectState {
  originalPhoto: HTMLImageElement | null;
  normalizedPhoto: HTMLImageElement | null;
  mask: CountertopMask;
  selectedSlab: Slab | null;
  slabTransform: SlabTransform;
  showBefore: boolean;
  opacity: number;
}

export type EditMode = 'view' | 'mask-brush' | 'mask-erase' | 'perspective';

export interface EditorState {
  mode: EditMode;
  brushSize: number;
  isProcessing: boolean;
}
