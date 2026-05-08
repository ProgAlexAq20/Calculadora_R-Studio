/**
 * components/Graph3D.tsx
 * Three.js 3D surface renderer for z = f(x, y).
 */
import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CompiledExpr } from '../math/parser';
import { sampleSurface3D } from '../math/sampler';

interface Props {
  expr3D: CompiledExpr | null;
  xRange: [number, number];
  yRange: [number, number];
  resolution: number;
}

export const Graph3D: React.FC<Props> = ({ expr3D, xRange, yRange, resolution }) => {
  const mountRef   = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef     = useRef<THREE.Mesh | null>(null);
  const frameRef    = useRef<number>(0);

  // Init Three.js scene once
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x0a0a0f, 1);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0f, 30, 80);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 200);
    camera.position.set(12, 9, 14);
    cameraRef.current = camera;

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3;
    controls.maxDistance = 60;
    controlsRef.current = controls;

    // Axes helper
    const axes = new THREE.AxesHelper(6);
    scene.add(axes);

    // Grid on XZ plane
    const grid = new THREE.GridHelper(20, 20, 0x222233, 0x1a1a2a);
    grid.position.y = -0.02;
    scene.add(grid);

    // Lights
    const ambient = new THREE.AmbientLight(0x9966ff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7);
    scene.add(dir);
    const point = new THREE.PointLight(0x06b6d4, 1.5, 40);
    point.position.set(-5, 8, -5);
    scene.add(point);

    // Axis labels (sprites)
    const addLabel = (text: string, pos: [number, number, number]) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64;
      const c = canvas.getContext('2d')!;
      c.font = 'bold 36px Inter, sans-serif';
      c.fillStyle = 'rgba(160,154,186,0.9)';
      c.textAlign = 'center';
      c.fillText(text, 32, 44);
      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(1.2, 1.2, 1.2);
      sprite.position.set(...pos);
      scene.add(sprite);
    };
    addLabel('X', [7, 0, 0]);
    addLabel('Y', [0, 7, 0]);
    addLabel('Z', [0, 0, 7]);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const ro = new ResizeObserver(() => {
      if (!mount) return;
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  // Rebuild surface mesh when expression changes
  const buildMesh = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene || !expr3D) return;

    // Remove old mesh
    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
    }

    try {
      const { positions, indices, colors, minZ, maxZ } =
        sampleSurface3D(expr3D, xRange[0], xRange[1], yRange[0], yRange[1], resolution, resolution);

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
      geo.setIndex(new THREE.BufferAttribute(indices, 1));
      geo.computeVertexNormals();

      const mat = new THREE.MeshPhongMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        shininess: 80,
        specular: new THREE.Color(0x9933ff),
        transparent: true,
        opacity: 0.92,
        wireframe: false,
      });

      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      meshRef.current = mesh;

      // Wireframe overlay
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
      });
      const wireMesh = new THREE.Mesh(geo, wireMat);
      scene.add(wireMesh);

      // Auto-position camera based on z range
      const zSpan = Math.abs(maxZ - minZ);
      const spanX = xRange[1] - xRange[0];
      const dist = Math.max(spanX, zSpan) * 1.8;
      cameraRef.current?.position.set(dist, dist * 0.7, dist);
      controlsRef.current?.update();
    } catch (e) {
      console.warn('3D surface error:', e);
    }
  }, [expr3D, xRange, yRange, resolution]);

  useEffect(() => { buildMesh(); }, [buildMesh]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', borderRadius: '14px', overflow: 'hidden', background: '#0a0a0f' }}
    />
  );
};
