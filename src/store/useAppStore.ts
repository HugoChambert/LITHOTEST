import { create } from 'zustand';
import { Slab, SlabTransform, CountertopMask, EditMode } from '../types';

interface AppState {
  originalPhoto: HTMLImageElement | null;
  normalizedPhoto: HTMLImageElement | null;
  mask: CountertopMask;
  selectedSlab: Slab | null;
  slabTransform: SlabTransform;
  showBefore: boolean;
  opacity: number;
  editMode: EditMode;
  brushSize: number;
  isProcessing: boolean;
  veinDirectionLocked: boolean;
  showEdgeWrap: boolean;

  setOriginalPhoto: (photo: HTMLImageElement | null) => void;
  setNormalizedPhoto: (photo: HTMLImageElement | null) => void;
  setMask: (mask: CountertopMask) => void;
  setSelectedSlab: (slab: Slab | null) => void;
  setSlabTransform: (transform: Partial<SlabTransform>) => void;
  setShowBefore: (show: boolean) => void;
  setOpacity: (opacity: number) => void;
  setEditMode: (mode: EditMode) => void;
  setBrushSize: (size: number) => void;
  setIsProcessing: (processing: boolean) => void;
  setVeinDirectionLocked: (locked: boolean) => void;
  setShowEdgeWrap: (show: boolean) => void;
  resetSlabTransform: () => void;
  resetProject: () => void;
}

const initialSlabTransform: SlabTransform = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  rotation: 0,
  veinDirection: 'horizontal'
};

const initialMask: CountertopMask = {
  imageData: null,
  corners: []
};

export const useAppStore = create<AppState>((set) => ({
  originalPhoto: null,
  normalizedPhoto: null,
  mask: initialMask,
  selectedSlab: null,
  slabTransform: initialSlabTransform,
  showBefore: false,
  opacity: 0.85,
  editMode: 'view',
  brushSize: 30,
  isProcessing: false,
  veinDirectionLocked: false,
  showEdgeWrap: true,

  setOriginalPhoto: (photo) => set({ originalPhoto: photo }),
  setNormalizedPhoto: (photo) => set({ normalizedPhoto: photo }),
  setMask: (mask) => set({ mask }),
  setSelectedSlab: (slab) => set({ selectedSlab: slab }),
  setSlabTransform: (transform) =>
    set((state) => ({
      slabTransform: { ...state.slabTransform, ...transform }
    })),
  setShowBefore: (show) => set({ showBefore: show }),
  setOpacity: (opacity) => set({ opacity }),
  setEditMode: (mode) => set({ editMode: mode }),
  setBrushSize: (size) => set({ brushSize: size }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setVeinDirectionLocked: (locked) => set({ veinDirectionLocked: locked }),
  setShowEdgeWrap: (show) => set({ showEdgeWrap: show }),

  resetSlabTransform: () => set({ slabTransform: initialSlabTransform }),

  resetProject: () => set({
    originalPhoto: null,
    normalizedPhoto: null,
    mask: initialMask,
    selectedSlab: null,
    slabTransform: initialSlabTransform,
    showBefore: false,
    opacity: 0.85,
    editMode: 'view',
    isProcessing: false,
    veinDirectionLocked: false,
    showEdgeWrap: true
  })
}));
