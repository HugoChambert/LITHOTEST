# LithoVision - Luxury Stone Countertop Visualization

LithoVision is a cutting-edge web application that allows stone suppliers, fabricators, and designers to visualize how real stone slabs will look in customer kitchens and bathrooms using AI-powered visualization technology.

## Features

- **Photo Upload & Normalization**: Upload kitchen/bathroom photos with automatic image optimization
- **AI-Powered Countertop Detection**: Automatic semantic segmentation using TensorFlow.js
- **Manual Mask Refinement**: Brush and erase tools for precise countertop selection
- **Real-Time Slab Visualization**: WebGL-accelerated rendering with Three.js
- **Slab-Accurate Mapping**: Apply full slab images (not tiled textures) with preserved vein direction and natural imperfections
- **Advanced Controls**:
  - Vein direction toggle (horizontal/vertical)
  - Slab offset and pan
  - Scale adjustment
  - Opacity blending
- **Slab Inventory System**: Browse and filter slabs by color, type, and finish
- **Before/After Toggle**: Instantly compare original photo with visualization
- **High-Resolution Export**: Download client-ready preview images
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **Zustand** for state management

### 3D Rendering
- **Three.js** for WebGL rendering
- **@react-three/fiber** and **@react-three/drei** for React integration
- Custom GPU shaders for perspective warping and mask compositing

### AI & Image Processing
- **TensorFlow.js** for client-side ML inference
- **DeepLab** semantic segmentation model
- Canvas API for image manipulation

### Styling
- Custom CSS with CSS variables
- Luxury design system with gold accent (#d4af37)
- Dark theme optimized for professional presentations

## Architecture

### Project Structure

```
lithovision/
├── src/
│   ├── components/           # React components
│   │   ├── PhotoUpload.tsx   # Image upload interface
│   │   ├── RenderCanvas.tsx  # Three.js WebGL renderer
│   │   ├── MaskEditor.tsx    # AI segmentation + manual editing
│   │   ├── SlabSelector.tsx  # Slab inventory browser
│   │   └── Toolbar.tsx       # Control panel
│   ├── store/
│   │   └── useAppStore.ts    # Zustand state management
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── utils/
│   │   ├── imageProcessing.ts    # Image utilities
│   │   ├── segmentation.ts       # AI segmentation
│   │   └── perspectiveWarp.ts    # Perspective correction
│   ├── data/
│   │   └── slabInventory.ts  # Slab database
│   ├── App.tsx               # Main application
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── public/
│   └── vite.svg              # App icon
└── package.json
```

### Core Systems

#### 1. State Management (Zustand)

The application uses a single, centralized store (`useAppStore`) that manages:
- Photo state (original and normalized)
- Countertop mask (ImageData + corner points)
- Selected slab and transform parameters
- UI state (edit mode, brush size, opacity, etc.)

#### 2. Rendering Pipeline (Three.js)

The `RenderCanvas` component creates a Three.js scene with:
- **Background Layer**: Original photo as textured plane
- **Slab Layer**: Dynamically mapped slab texture with custom shader
- **Shader Features**:
  - Alpha masking based on countertop segmentation
  - Texture transformation (scale, offset, rotation)
  - Opacity blending

The shader composites the slab texture over the background using the mask:

```glsl
vec4 mask = texture2D(maskTexture, vUv);
vec4 slab = texture2D(slabTexture, vUv);
float alpha = mask.r * opacity;
gl_FragColor = vec4(slab.rgb, alpha);
```

#### 3. AI Segmentation (TensorFlow.js)

The `segmentation.ts` module:
- Loads the DeepLab model with Pascal VOC weights
- Segments the image into 21 semantic classes
- Filters for furniture/table/surface classes (labels 12, 14, 15)
- Generates a binary mask for the countertop region
- Detects corner points for perspective correction

#### 4. Manual Mask Editing

The `MaskEditor` component provides:
- Canvas-based drawing interface
- Brush tool for adding to mask
- Eraser tool for removing from mask
- Adjustable brush size (5-100px)
- Smooth stroke interpolation
- Real-time mask preview with 50% opacity overlay

#### 5. Image Processing

Key utilities:
- `loadImage()`: Converts File to HTMLImageElement
- `normalizeImage()`: Resizes to max 1920x1080, optimizes quality
- `createEmptyMask()`: Initializes blank ImageData
- `applyBrushToMask()`: Circular brush with anti-aliasing
- `exportToImage()`: Canvas to JPEG with 95% quality

#### 6. Perspective Correction

The `perspectiveWarp.ts` module implements:
- 8-parameter perspective transformation matrix
- Linear system solver for matrix calculation
- Inverse warping for texture mapping
- Corner point-based geometric correction

## Slab Inventory System

Slabs are defined in `src/data/slabInventory.ts` as JSON objects:

```typescript
{
  sku: "CALACATTA-GOLD-001",
  name: "Calacatta Gold",
  finish: "Polished",
  image: "https://...",  // Pexels stock photo URL
  quarry: "Italy",
  color: "White",
  type: "Marble"
}
```

### Filtering & Search

- Filter by color (White, Black, Beige, Brown, Green)
- Filter by type (Marble, Granite, Travertine)
- Text search by name or SKU
- Responsive grid layout with lazy loading

## User Workflow

1. **Upload Photo**: User uploads kitchen/bathroom image
2. **Auto-Detect**: AI segments countertop surface (or use manual tools)
3. **Refine Mask**: Brush/erase to perfect the selection
4. **Select Slab**: Browse inventory and choose stone
5. **Adjust**: Fine-tune scale, offset, vein direction, opacity
6. **Compare**: Toggle before/after to show client
7. **Export**: Download high-res image for approval

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Customization

### Adding New Slabs

Edit `src/data/slabInventory.ts` and add new entries:

```typescript
{
  sku: "YOUR-SKU-001",
  name: "Your Stone Name",
  finish: "Polished",
  image: "/path/to/slab/image.jpg",
  quarry: "Country",
  color: "Color",
  type: "Stone Type"
}
```

### White-Label Branding

Modify the color scheme in `src/index.css`:

```css
:root {
  --primary: #1a1a1a;      /* Background */
  --accent: #d4af37;        /* Brand color */
  /* ... */
}
```

Update the logo in `src/App.tsx` and `public/vite.svg`.

### Embed as Widget

The application is built as a single-page app and can be embedded via iframe:

```html
<iframe src="https://your-domain.com/lithovision"
        width="100%"
        height="800px"
        frameborder="0">
</iframe>
```

For script-based embedding, build with library mode and expose the React root.

## Performance Considerations

### TensorFlow.js Model Loading

The DeepLab model (~10MB) loads asynchronously on app startup. First-time segmentation may take 3-5 seconds. Subsequent segmentations are faster due to GPU acceleration.

### Image Optimization

Photos are automatically normalized to max 1920x1080 to balance quality and performance. For 4K displays, adjust `maxWidth` and `maxHeight` in `imageProcessing.ts`.

### WebGL Rendering

Three.js uses hardware acceleration. The scene renders on-demand (not continuous loop) to minimize GPU usage. Export captures the current frame buffer.

## Browser Support

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL 2.0 support for shader-based rendering.

## Known Limitations

1. **AI Accuracy**: DeepLab may misidentify countertops in complex scenes. Manual refinement tools address this.
2. **Perspective**: Current implementation assumes planar countertops. Advanced warping for curved surfaces is not supported.
3. **Lighting**: The app does not adjust for ambient lighting conditions. Results are best with well-lit, neutral photos.
4. **Mobile Performance**: TensorFlow.js inference is slower on mobile devices. Consider disabling auto-segmentation on small screens.

## Future Enhancements

- [ ] Real-time lighting adjustment
- [ ] Edge continuity preview (countertop edge view)
- [ ] Multi-surface support (backsplash, islands)
- [ ] 3D room scanning integration (ARKit/ARCore)
- [ ] Backend API for slab management
- [ ] User accounts and project saving
- [ ] PDF report generation
- [ ] Batch processing

## License

Proprietary - All rights reserved

## Credits

- Stock slab images from [Pexels](https://www.pexels.com)
- DeepLab model by [TensorFlow](https://www.tensorflow.org)
- Built with [React](https://react.dev), [Three.js](https://threejs.org), and [Vite](https://vitejs.dev)

---

**LithoVision** - Visualize luxury. Close more sales.