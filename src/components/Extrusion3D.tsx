/**
 * components/Extrusion3D.tsx
 * Experimental: extrude f(x) over [a,b] by height h using Three.js.
 */
import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CompiledExpr } from '../math/parser';
import { sampleExtrusion } from '../math/sampler';

interface Props {
  expr: CompiledExpr | null;
  a: number;
  b: number;
  h: number;
}

export const Extrusion3D: React.FC<Props> = ({ expr, a, b, h }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef    = useRef<number>(0);
  const meshRef     = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x0a0a0f, 1);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 200);
    camera.position.set(10, 6, 12);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controlsRef.current = controls;

    scene.add(new THREE.AxesHelper(6));
    const grid = new THREE.GridHelper(20, 20, 0x222233, 0x1a1a2a);
    scene.add(grid);

    scene.add(new THREE.AmbientLight(0x9966ff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

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

  const buildMesh = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene || !expr) return;

    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
    }

    try {
      const { positions, indices, colors } = sampleExtrusion(expr, a, b, h);

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
      geo.setIndex(new THREE.BufferAttribute(indices, 1));
      geo.computeVertexNormals();

      const mat = new THREE.MeshPhongMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        shininess: 60,
        transparent: true,
        opacity: 0.88,
      });

      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      meshRef.current = mesh;
    } catch (e) {
      console.warn('Extrusion error:', e);
    }
  }, [expr, a, b, h]);

  useEffect(() => { buildMesh(); }, [buildMesh]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', borderRadius: '14px', overflow: 'hidden', background: '#0a0a0f' }}
    />
  );
};
