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

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    // 1. Floating Information Nodes & Constellation Lines (Lightweight nodeCount for silky 60fps)
    const nodeCount = 35;
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

      // 18% accent particles, rest subtle dark green/cyan
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
      grad.addColorStop(0.3, isLight ? 'rgba(15,81,50,0.8)' : 'rgba(201,255,61,0.8)');
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
      opacity: isLight ? 0.45 : 0.65,
      blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
      depthWrite: false
    });

    const particlesMesh = new THREE.Points(geometry, particleMaterial);
    scene.add(particlesMesh);

    // Dynamic Line Connections Geometry
    const lineMaterial = new THREE.LineBasicMaterial({
      color: isLight ? 0x0F5132 : 0xC9FF3D,
      transparent: true,
      opacity: isLight ? 0.05 : 0.08,
      blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending
    });

    const linesGeometry = new THREE.BufferGeometry();
    const maxLines = 100;
    const linePositions = new Float32Array(maxLines * 6);
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const linesMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(linesMesh);

    // 2. Lighting for 3D Translucent Documents
    const ambientLight = new THREE.AmbientLight(0xffffff, isLight ? 1.0 : 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(isLight ? 0x0F5132 : 0xC9FF3D, 0.9);
    dirLight1.position.set(100, 150, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38BDF8, 0.6);
    dirLight2.position.set(-100, -100, 80);
    scene.add(dirLight2);

    // Procedural 3D Document Texture Generator
    const createDocTexture = (colorHex: string, titleText: string, isLightMode: boolean) => {
      const texCanvas = document.createElement('canvas');
      texCanvas.width = 512;
      texCanvas.height = 724;
      const ctx = texCanvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      // Translucent Paper Surface
      ctx.fillStyle = isLightMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(23, 26, 24, 0.92)';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(12, 12, 488, 700, 20);
      } else {
        ctx.rect(12, 12, 488, 700);
      }
      ctx.fill();

      // Paper Border
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 5;
      ctx.stroke();

      // Top Title Bar
      ctx.fillStyle = colorHex;
      ctx.fillRect(45, 55, 170, 24);

      ctx.fillStyle = isLightMode ? 'rgba(45, 90, 64, 0.3)' : 'rgba(143, 150, 145, 0.4)';
      ctx.fillRect(235, 60, 120, 15);

      // Divider Line
      ctx.fillStyle = isLightMode ? 'rgba(15, 81, 50, 0.2)' : 'rgba(41, 45, 43, 0.8)';
      ctx.fillRect(45, 100, 422, 3);

      // Paragraph Lines
      ctx.fillStyle = isLightMode ? 'rgba(45, 90, 64, 0.35)' : 'rgba(143, 150, 145, 0.35)';
      for (let y = 135; y < 580; y += 28) {
        const lineWidth = 340 + Math.sin(y) * 60;
        ctx.fillRect(45, y, lineWidth, 9);
      }

      // Circular Stamp
      ctx.save();
      ctx.beginPath();
      ctx.arc(380, 620, 50, 0, Math.PI * 2);
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 4;
      ctx.setLineDash([6, 4]);
      ctx.stroke();

      ctx.fillStyle = colorHex;
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(titleText, 380, 615);
      ctx.fillText('3D VERIFIED', 380, 632);
      ctx.restore();

      return new THREE.CanvasTexture(texCanvas);
    };

    // 3D Documents Group
    const documentsGroup = new THREE.Group();
    scene.add(documentsGroup);

    const docGeo = new THREE.BoxGeometry(32, 45, 0.3);
    const docConfigs = [
      { x: 95, y: 35, z: 20, rx: 0.15, ry: -0.38, rz: 0.08, scale: 1.05, color: isLight ? '#0F5132' : '#C9FF3D', title: 'NEXUS AI', offset: 0 },
      { x: -105, y: -20, z: -10, rx: -0.2, ry: 0.42, rz: -0.1, scale: 0.95, color: isLight ? '#1B4332' : '#38BDF8', title: 'LOAN DOSSIER', offset: 2 },
      { x: 75, y: -65, z: -30, rx: 0.28, ry: -0.22, rz: 0.14, scale: 0.85, color: isLight ? '#2D5A40' : '#A78BFA', title: 'BANK STMT', offset: 4 },
      { x: -80, y: 70, z: -25, rx: -0.12, ry: 0.28, rz: -0.06, scale: 0.9, color: isLight ? '#0A3D25' : '#79DF9B', title: 'TAX AUDIT', offset: 1.5 }
    ];

    const docMeshes: Array<{ mesh: THREE.Mesh; cfg: typeof docConfigs[0]; initialY: number; initialX: number; tex: THREE.Texture; mat: THREE.Material }> = [];

    docConfigs.forEach((cfg) => {
      const tex = createDocTexture(cfg.color, cfg.title, isLight);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        opacity: isLight ? 0.75 : 0.65,
        roughness: 0.35,
        metalness: 0.1,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(docGeo, mat);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.set(cfg.rx, cfg.ry, cfg.rz);
      mesh.scale.set(cfg.scale, cfg.scale, cfg.scale);

      documentsGroup.add(mesh);
      docMeshes.push({ mesh, cfg, initialY: cfg.y, initialX: cfg.x, tex, mat });
    });

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
    let frameCount = 0;

    const animate = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      frameCount++;

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
            posArray[idx] += velocities[i].x * 1.5 + 0.05;
            posArray[idx + 1] += velocities[i].y * 1.5;
            posArray[idx + 2] += velocities[i].z * 1.5;
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

          // Connect nearby nodes with constellation lines (calculated every 2nd frame, fast squared distance)
          if (frameCount % 2 === 0) {
            for (let j = i + 1; j < Math.min(i + 5, nodeCount); j++) {
              if (lineIdx < maxLines) {
                const jIdx = j * 3;
                const dx = posArray[idx] - posArray[jIdx];
                const dy = posArray[idx + 1] - posArray[jIdx + 1];
                const dz = posArray[idx + 2] - posArray[jIdx + 2];
                const distSq = dx * dx + dy * dy + dz * dz;

                if (distSq < 2025) { // 45 * 45
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
        }

        // Animate floating 3D translucent documents
        docMeshes.forEach(({ mesh, cfg, initialY }) => {
          mesh.position.y = initialY + Math.sin(frameCount * 0.02 + cfg.offset) * 4;
          mesh.position.x = cfg.x + Math.cos(frameCount * 0.015 + cfg.offset) * 2 + mouseX * 0.25;
          mesh.rotation.y = cfg.ry + Math.sin(frameCount * 0.012 + cfg.offset) * 0.08 + mouseX * 0.004;
          mesh.rotation.x = cfg.rx + Math.cos(frameCount * 0.01 + cfg.offset) * 0.05 - mouseY * 0.004;
          mesh.rotation.z = cfg.rz + Math.sin(frameCount * 0.008 + cfg.offset) * 0.03;
        });

        geometry.attributes.position.needsUpdate = true;
        if (frameCount % 2 === 0) {
          linesGeometry.attributes.position.needsUpdate = true;
        }
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
      docGeo.dispose();
      docMeshes.forEach(d => {
        d.tex.dispose();
        d.mat.dispose();
      });
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
