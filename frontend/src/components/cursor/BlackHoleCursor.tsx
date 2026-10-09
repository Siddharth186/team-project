import React, { useEffect, useRef, useState } from 'react';

export type CursorMode = 'NORMAL' | 'PROCESSING' | 'SEARCH' | 'CONFLICT' | 'SUCCESS' | 'KNOWLEDGE_GRAPH' | 'UPLOAD';

interface BlackHoleCursorProps {
  mode?: CursorMode;
}

export const BlackHoleCursor: React.FC<BlackHoleCursorProps> = ({ mode = 'NORMAL' }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Position & physics state
  const mousePos = useRef({ x: -100, y: -100 });
  const cursorSmoothPos = useRef({ x: -100, y: -100 });
  const velocity = useRef({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Orbiting micro-particles state
  const particles = useRef([
    { angle: 0, radius: 14, speed: 0.05, size: 2.2 },
    { angle: 1.8, radius: 17, speed: 0.035, size: 1.8 },
    { angle: 3.4, radius: 13, speed: 0.06, size: 2.0 },
    { angle: 4.9, radius: 19, speed: 0.028, size: 1.5 }
  ]);

  useEffect(() => {
    // Check if device supports fine cursor (desktop)
    const isDesktop = window.matchMedia('(pointer: fine)').matches;
    if (!isDesktop) return;

    let hoverCheckTimeout: number;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Detect hover over interactive elements with throttling
      if (!hoverCheckTimeout) {
        hoverCheckTimeout = window.setTimeout(() => {
          const target = e.target as HTMLElement | null;
          if (target) {
            const interactive = !!target.closest('button, a, input, [role="button"], .interactive-node, tr');
            setHovering(interactive);
          }
          hoverCheckTimeout = 0;
        }, 60);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      const rippleId = Date.now();
      setRipples(prev => [...prev.slice(-2), { id: rippleId, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== rippleId));
      }, 500);
      setTimeout(() => setIsClicking(false), 200);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });

    // Physics animation loop using lerp (spring smoothing)
    let animationFrameId: number;
    const updatePhysics = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(updatePhysics);
        return;
      }

      // Lerp smoothing (82% smoothing factor)
      const dx = mousePos.current.x - cursorSmoothPos.current.x;
      const dy = mousePos.current.y - cursorSmoothPos.current.y;
      
      velocity.current = { x: dx * 0.55, y: dy * 0.55 };
      cursorSmoothPos.current.x += velocity.current.x;
      cursorSmoothPos.current.y += velocity.current.y;

      // Speed magnitude
      const speed = Math.hypot(velocity.current.x, velocity.current.y);
      const stretch = Math.min(1.25, 1 + speed * 0.012);
      const angle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorSmoothPos.current.x}px, ${cursorSmoothPos.current.y}px, 0)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `rotate(${angle}deg) scale(${stretch}, ${1 / Math.max(1, stretch * 0.8)})`;
      }

      // Update orbiting particles directly via cached refs
      const particleSpeedMultiplier = mode === 'PROCESSING' ? 2.2 : 1.0;
      particles.current.forEach((p, idx) => {
        p.angle += p.speed * particleSpeedMultiplier;
        const el = particleRefs.current[idx];
        if (el) {
          const px = Math.cos(p.angle) * p.radius;
          const py = Math.sin(p.angle) * p.radius;
          el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
        }
      });

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      cancelAnimationFrame(animationFrameId);
      if (hoverCheckTimeout) clearTimeout(hoverCheckTimeout);
    };
  }, [mode]);

  // Determine mode color
  const getAccretionColor = () => {
    const isLight = typeof document !== 'undefined' && document.documentElement.classList.contains('light-theme');
    switch (mode) {
      case 'CONFLICT': return '#FF7777';
      case 'SEARCH': return '#38BDF8';
      case 'SUCCESS': return '#79DF9B';
      default: return isLight ? '#0F5132' : '#C9FF3D';
    }
  };

  const ringColor = getAccretionColor();

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden hidden md:block">
      {/* Click Gravitational Ripples */}
      {ripples.map(r => (
        <div
          key={r.id}
          className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ping"
          style={{
            left: r.x,
            top: r.y,
            width: '60px',
            height: '60px',
            border: `1.5px solid ${ringColor}`,
            boxShadow: `0 0 15px ${ringColor}`,
            animationDuration: '450ms'
          }}
        />
      ))}

      {/* Main Singularity Cursor */}
      <div
        ref={cursorRef}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 will-change-transform pointer-events-none"
      >
        {/* Gravitational Lens Glow */}
        <div
          className="absolute -inset-4 rounded-full blur-md opacity-40 transition-all duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${ringColor} 0%, transparent 70%)`,
            transform: isClicking ? 'scale(1.8)' : hovering ? 'scale(1.3)' : 'scale(1)'
          }}
        />

        {/* Accretion Disk / Outer Ring */}
        <div
          ref={ringRef}
          className="relative rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            width: hovering ? '24px' : isClicking ? '10px' : '16px',
            height: hovering ? '24px' : isClicking ? '10px' : '16px',
            border: `1.5px solid ${ringColor}`,
            boxShadow: `0 0 10px ${ringColor}, inset 0 0 4px ${ringColor}`
          }}
        >
          {/* Black Hole Singularity Core */}
          <div
            className="rounded-full bg-[#0D0F0E] transition-all duration-150"
            style={{
              width: isClicking ? '4px' : hovering ? '14px' : '8px',
              height: isClicking ? '4px' : hovering ? '14px' : '8px',
              boxShadow: 'inset 0 0 6px #000'
            }}
          />
        </div>

        {/* Orbiting Micro-Particles */}
        {particles.current.map((p, idx) => (
          <div
            key={idx}
            ref={el => { particleRefs.current[idx] = el; }}
            className="absolute top-1/2 left-1/2 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: ringColor,
              boxShadow: `0 0 5px ${ringColor}`
            }}
          />
        ))}
      </div>
    </div>
  );
};
