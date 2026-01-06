import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { detectEdges } from '../utils/imageProcessing';
import * as THREE from 'three';

export function RenderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    renderer: THREE.WebGLRenderer;
    backgroundMesh: THREE.Mesh | null;
    slabMesh: THREE.Mesh | null;
  } | null>(null);

  const {
    normalizedPhoto,
    selectedSlab,
    slabTransform,
    mask,
    opacity,
    showBefore,
    showEdgeWrap
  } = useAppStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      backgroundMesh: null,
      slabMesh: null
    };

    const handleResize = () => {
      if (!canvasRef.current || !sceneRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      sceneRef.current.renderer.setSize(width, height);
      render();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  const render = () => {
    if (!sceneRef.current) return;
    const { scene, camera, renderer } = sceneRef.current;
    renderer.render(scene, camera);
  };

  useEffect(() => {
    if (!normalizedPhoto || !sceneRef.current) return;

    const { scene } = sceneRef.current;

    if (sceneRef.current.backgroundMesh) {
      scene.remove(sceneRef.current.backgroundMesh);
    }

    const texture = new THREE.Texture(normalizedPhoto);
    texture.needsUpdate = true;

    const aspect = normalizedPhoto.width / normalizedPhoto.height;
    const geometry = new THREE.PlaneGeometry(2 * aspect, 2);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.z = -0.5;
    scene.add(mesh);
    sceneRef.current.backgroundMesh = mesh;

    render();
  }, [normalizedPhoto]);

  useEffect(() => {
    if (!selectedSlab || !mask.imageData || !sceneRef.current || showBefore) {
      if (sceneRef.current?.slabMesh) {
        sceneRef.current.scene.remove(sceneRef.current.slabMesh);
        sceneRef.current.slabMesh = null;
        render();
      }
      return;
    }

    const { scene } = sceneRef.current;

    if (sceneRef.current.slabMesh) {
      scene.remove(sceneRef.current.slabMesh);
    }

    const slabImage = new Image();
    slabImage.crossOrigin = 'anonymous';
    slabImage.onload = () => {
      if (!sceneRef.current || !normalizedPhoto) return;

      const texture = new THREE.Texture(slabImage);
      texture.needsUpdate = true;

      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;

      if (slabTransform.veinDirection === 'vertical') {
        texture.rotation = Math.PI / 2;
        texture.center.set(0.5, 0.5);
      }

      texture.repeat.set(slabTransform.scale, slabTransform.scale);
      texture.offset.set(slabTransform.offsetX, slabTransform.offsetY);

      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = mask.imageData!.width;
      maskCanvas.height = mask.imageData!.height;
      const maskCtx = maskCanvas.getContext('2d')!;
      maskCtx.putImageData(mask.imageData!, 0, 0);

      const maskTexture = new THREE.CanvasTexture(maskCanvas);

      const edgeMask = detectEdges(mask.imageData!, 5);
      const edgeCanvas = document.createElement('canvas');
      edgeCanvas.width = mask.imageData!.width;
      edgeCanvas.height = mask.imageData!.height;
      const edgeCtx = edgeCanvas.getContext('2d')!;
      edgeCtx.putImageData(edgeMask, 0, 0);

      const edgeTexture = new THREE.CanvasTexture(edgeCanvas);

      const aspect = normalizedPhoto.width / normalizedPhoto.height;
      const geometry = new THREE.PlaneGeometry(2 * aspect, 2);

      const material = new THREE.ShaderMaterial({
        uniforms: {
          slabTexture: { value: texture },
          maskTexture: { value: maskTexture },
          edgeTexture: { value: edgeTexture },
          opacity: { value: opacity },
          showEdgeWrap: { value: showEdgeWrap ? 1.0 : 0.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D slabTexture;
          uniform sampler2D maskTexture;
          uniform sampler2D edgeTexture;
          uniform float opacity;
          uniform float showEdgeWrap;
          varying vec2 vUv;

          void main() {
            vec4 mask = texture2D(maskTexture, vUv);
            vec4 edge = texture2D(edgeTexture, vUv);
            vec4 slab = texture2D(slabTexture, vUv);

            float isEdge = edge.r * showEdgeWrap;

            vec3 finalColor = slab.rgb;
            if (isEdge > 0.5) {
              finalColor = slab.rgb * 0.5;
            }

            float alpha = mask.r * opacity;
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = -0.4;
      scene.add(mesh);
      sceneRef.current.slabMesh = mesh;

      render();
    };

    slabImage.src = selectedSlab.image;
  }, [selectedSlab, slabTransform, mask, opacity, showBefore, showEdgeWrap, normalizedPhoto]);

  useEffect(() => {
    render();
  }, [showBefore, showEdgeWrap]);

  return (
    <canvas
      ref={canvasRef}
      style={styles.canvas}
    />
  );
}

const styles = {
  canvas: {
    width: '100%',
    height: '100%',
    display: 'block'
  }
};
