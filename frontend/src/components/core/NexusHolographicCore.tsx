import React, { useEffect, useState } from 'react';

export type AIState = 'IDLE' | 'PROCESSING' | 'ANALYZING' | 'CONNECTING' | 'VALIDATING' | 'COMPLETE';

interface NexusHolographicCoreProps {
  state?: AIState;
  size?: 'sm' | 'md' | 'lg';
  showWaveform?: boolean;
}

export const NexusHolographicCore: React.FC<NexusHolographicCoreProps> = ({
  state = 'PROCESSING',
  size = 'md',
  showWaveform = true
}) => {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const dimensions = {
    sm: { width: 140, height: 140, starSize: 24 },
    md: { width: 190, height: 190, starSize: 32 },
    lg: { width: 250, height: 250, starSize: 42 }
  }[size];

  const getSpeedClass = () => {
    switch (state) {
      case 'PROCESSING': return 'animate-[spin_8s_linear_infinite]';
      case 'ANALYZING': return 'animate-[spin_6s_linear_infinite]';
      case 'CONNECTING': return 'animate-[spin_10s_linear_infinite]';
      case 'VALIDATING': return 'animate-[spin_9s_linear_infinite]';
      default: return 'animate-[spin_18s_linear_infinite]';
    }
  };

  const getCounterSpeedClass = () => {
    switch (state) {
      case 'PROCESSING': return 'animate-[spin_10s_linear_infinite_reverse]';
      case 'ANALYZING': return 'animate-[spin_8s_linear_infinite_reverse]';
      default: return 'animate-[spin_24s_linear_infinite_reverse]';
    }
  };

  const getAccentColor = () => {
    if (state === 'VALIDATING') return '#FF7777';
    if (state === 'ANALYZING') return '#FFBD59';
    return 'var(--nexus-accent-core, #C9FF3D)';
  };

  const accentColor = getAccentColor();

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Outer Glow Halo */}
      <div
        className="absolute rounded-full blur-2xl opacity-30 transition-all duration-700 pointer-events-none"
        style={{
          width: dimensions.width * 1.3,
          height: dimensions.height * 1.3,
          backgroundColor: accentColor
        }}
      />

      {/* SVG Multi-Layered Hologram */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 200 200"
        className="relative z-10 overflow-visible"
      >
        <defs>
          <radialGradient id="coreBgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--nexus-core-bg-1, #111613)" />
            <stop offset="75%" stopColor="var(--nexus-core-bg-2, #0B0D0C)" />
            <stop offset="100%" stopColor="var(--nexus-core-bg-3, #0D0F0E)" />
          </radialGradient>

          <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Layer 1: Technical Radial Ticks & Coordinate Markings */}
        <g opacity="0.35">
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15 * Math.PI) / 180;
            const r1 = 92;
            const r2 = i % 2 === 0 ? 98 : 95;
            const x1 = 100 + Math.cos(angle) * r1;
            const y1 = 100 + Math.sin(angle) * r1;
            const x2 = 100 + Math.cos(angle) * r2;
            const y2 = 100 + Math.sin(angle) * r2;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={accentColor}
                strokeWidth={i % 6 === 0 ? "1.8" : "0.9"}
              />
            );
          })}
        </g>

        {/* Layer 2: Outer Dashed Technical Ring (Clockwise) */}
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.2"
          strokeDasharray="8 6 2 6"
          opacity="0.6"
          className={getSpeedClass()}
          style={{ transformOrigin: "100px 100px" }}
        />

        {/* Layer 3: Segmented Crosshair Arcs (Counter-Clockwise) */}
        <circle
          cx="100"
          cy="100"
          r="74"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.8"
          strokeDasharray="40 18 10 18"
          opacity="0.75"
          className={getCounterSpeedClass()}
          style={{ transformOrigin: "100px 100px" }}
        />

        {/* Layer 4: Inner Orbital Ring with Orbiting Micro-Node */}
        <circle
          cx="100"
          cy="100"
          r="58"
          fill="none"
          stroke={accentColor}
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.45"
        />

        <g className={getSpeedClass()} style={{ transformOrigin: "100px 100px" }}>
          <circle cx="158" cy="100" r="2.8" fill={accentColor} filter="url(#coreGlow)" />
          <circle cx="42" cy="100" r="2" fill={accentColor} opacity="0.6" />
        </g>

        {/* Layer 5: Dark Orb Core with Glowing Border */}
        <circle
          cx="100"
          cy="100"
          r="46"
          fill="url(#coreBgGrad)"
          stroke={accentColor}
          strokeWidth="1.8"
          filter="url(#coreGlow)"
          className="transition-all duration-300"
        />

        {/* Layer 6: Scanning Sweep Line */}
        <line
          x1="100"
          y1="56"
          x2="100"
          y2="144"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.25"
          className="animate-[spin_4s_linear_infinite]"
          style={{ transformOrigin: "100px 100px" }}
        />

        {/* Layer 7: Central NEXUS 4-Pointed Star Icon */}
        <g
          transform="translate(100, 100)"
          className="transition-transform duration-500"
          style={{
            transform: `translate(100px, 100px) scale(${1 + Math.sin(pulse * 0.1) * 0.04})`
          }}
        >
          {/* Glowing 4-Pointed Star */}
          <path
            d="M 0 -22 C 2 -7 7 -2 22 0 C 7 2 2 7 0 22 C -2 7 -7 2 -22 0 C -7 -2 -2 -7 0 -22 Z"
            fill={accentColor}
            filter="url(#coreGlow)"
          />
          {/* Inner core diamond */}
          <circle cx="0" cy="0" r="3.5" fill="#0D0F0E" />
        </g>
      </svg>

      {/* Layer 8: Audio Frequency Energy Waveform Spectrum */}
      {showWaveform && (
        <div className="flex items-center justify-center space-x-1 mt-2 h-5 w-40 overflow-hidden">
          {Array.from({ length: 22 }).map((_, i) => {
            const height = Math.max(
              3,
              Math.min(
                18,
                Math.sin(i * 0.4 + pulse * 0.2) * 8 + 9 + (state === 'PROCESSING' ? Math.random() * 4 : 0)
              )
            );
            return (
              <span
                key={i}
                className="w-1 rounded-full transition-all duration-75"
                style={{
                  height: `${height}px`,
                  backgroundColor: i % 4 === 0 ? accentColor : 'rgba(201, 255, 61, 0.45)'
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
