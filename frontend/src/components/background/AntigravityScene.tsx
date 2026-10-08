import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AntigravitySceneProps {
  isProcessing?: boolean;
}

export const AntigravityScene: React.FC<AntigravitySceneProps> = ({ isProcessing = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene, Camera, Renderer
    const isLight = typeof document !== 'undefined' && document.documentElement.classList.contains('light-theme');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isLight ? 0xF8FAF8 : 0x0D0F0E, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.z = 220;
    camera.position.y = 15;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    // 1. Floating Information Nodes & Constellation Lines
    const nodeCount = 140;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(nodeCount * 3);
    const velocities: Array<{ x: number; y: number; z: number }> = [];
    const colors = new Float32Array(nodeCount * 3);

    const limeColor = new THREE.Color(isLight ? 0x0F5132 : 0xC9FF3D);
    const darkGreenColor = new THREE.Color(isLight ? 0x1B4332 : 0x1F3520);
    const cyanColor = new THREE.Color(isLight ? 0x2D5A40 : 0x2A453B);

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 500;
      const y = (Math.random() - 0.5) * 320;
      const z = (Math.random() - 0.5) * 280;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      velocities.push({
        x: (Math.random() - 0.5) * 0.12,
        y: (Math.random() - 0.5) * 0.12,
        z: (Math.random() - 0.5) * 0.08
      });

      // 15% lime particles, rest subtle dark green/cyan
      const color = Math.random() < 0.18 ? limeColor : (Math.random() < 0.5 ? darkGreenColor : cyanColor);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material with circular texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(201,255,61,0.8)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particlesMesh = new THREE.Points(geometry, particleMaterial);
    scene.add(particlesMesh);

    // Dynamic Line Connections Geometry
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xC9FF3D,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending
    });

    const linesGeometry = new THREE.BufferGeometry();
    const maxLines = 180;
    const linePositions = new Float32Array(maxLines * 6);
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const linesMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(linesMesh);

    // 2. Faint Perspective Grid on floor
    const gridHelper = new THREE.GridHelper(600, 30, 0x292D2B, 0x141816);
    gridHelper.position.y = -100;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.25;
    scene.add(gridHelper);

    // Mouse tracking for subtle parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (event: MouseEvent) => {
      targetMouseX = (event.clientX - window.innerWidth / 2) * 0.04;
      targetMouseY = (event.clientY - window.innerHeight / 2) * 0.04;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();

      if (!prefersReducedMotion) {
        // Smooth camera drift with mouse lerp
        mouseX += (targetMouseX - mouseX) * 0.04;
        mouseY += (targetMouseY - mouseY) * 0.04;
        camera.position.x = mouseX * 0.5;
        camera.position.y = -mouseY * 0.5 + 15;
        camera.lookAt(0, 0, 0);

        // Update particle positions
        const posArray = geometry.attributes.position.array as Float32Array;
        let lineIdx = 0;

        for (let i = 0; i < nodeCount; i++) {
          const idx = i * 3;

          // If processing, drift subtly toward center/right
          if (isProcessing) {
            posArray[idx] += velocities[i].x * 1.8 + 0.06;
            posArray[idx + 1] += velocities[i].y * 1.8;
            posArray[idx + 2] += velocities[i].z * 1.8;
          } else {
            posArray[idx] += velocities[i].x;
            posArray[idx + 1] += velocities[i].y;
            posArray[idx + 2] += velocities[i].z;
          }

          // Boundary bouncing / wrap
          if (posArray[idx] > 260) posArray[idx] = -260;
          if (posArray[idx] < -260) posArray[idx] = 260;
          if (posArray[idx + 1] > 180) posArray[idx + 1] = -180;
          if (posArray[idx + 1] < -180) posArray[idx + 1] = 180;
          if (posArray[idx + 2] > 150) posArray[idx + 2] = -150;
          if (posArray[idx + 2] < -150) posArray[idx + 2] = 150;

          // Connect nearby nodes with constellation lines
          for (let j = i + 1; j < Math.min(i + 8, nodeCount); j++) {
            if (lineIdx < maxLines) {
              const jIdx = j * 3;
              const dist = Math.hypot(
                posArray[idx] - posArray[jIdx],
                posArray[idx + 1] - posArray[jIdx + 1],
                posArray[idx + 2] - posArray[jIdx + 2]
              );

              if (dist < 45) {
                linePositions[lineIdx * 6] = posArray[idx];
                linePositions[lineIdx * 6 + 1] = posArray[idx + 1];
                linePositions[lineIdx * 6 + 2] = posArray[idx + 2];
                linePositions[lineIdx * 6 + 3] = posArray[jIdx];
                linePositions[lineIdx * 6 + 4] = posArray[jIdx + 1];
                linePositions[lineIdx * 6 + 5] = posArray[jIdx + 2];
                lineIdx++;
              }
            }
          }
        }

        geometry.attributes.position.needsUpdate = true;
        linesGeometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose three.js resources
      geometry.dispose();
      particleMaterial.dispose();
      linesGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isProcessing]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.85 }}
    />
  );
};
