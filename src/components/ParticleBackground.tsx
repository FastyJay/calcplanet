import React, { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  theme?: string;
  disabled?: boolean;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulseOffset: number;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ 
  theme = 'cosmic-dark',
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color palettes according to theme
    let colors = [
      'rgba(99, 102, 241, ', // Indigo
      'rgba(168, 85, 247, ', // Purple
      'rgba(236, 72, 153, ', // Pink
      'rgba(56, 189, 248, ', // Sky/Cyan
    ];
    let lineRgba = '129, 140, 248';

    if (theme === 'cyber-neon') {
      colors = [
        'rgba(6, 182, 212, ',  // Cyan
        'rgba(59, 130, 246, ', // Blue
        'rgba(236, 72, 153, ', // Pink / Magenta
        'rgba(16, 185, 129, ', // Emerald
      ];
      lineRgba = '6, 182, 212';
    } else if (theme === 'midnight-blue') {
      colors = [
        'rgba(37, 99, 235, ',  // Royal Blue
        'rgba(56, 189, 248, ', // Sky Blue
        'rgba(96, 165, 250, ', // Soft Blue
        'rgba(147, 197, 253, ',// Ice Blue
      ];
      lineRgba = '56, 189, 248';
    } else if (theme === 'sunset-amber') {
      colors = [
        'rgba(249, 115, 22, ', // Orange
        'rgba(245, 158, 11, ', // Amber
        'rgba(244, 63, 94, ',  // Rose
        'rgba(234, 88, 12, ',  // Deep Orange
      ];
      lineRgba = '249, 115, 22';
    } else if (theme === 'clean-light') {
      colors = [
        'rgba(79, 70, 229, ',  // Deep Indigo
        'rgba(2, 132, 199, ',  // Ocean Cyan
        'rgba(147, 51, 234, ', // Violet
        'rgba(16, 185, 129, ', // Emerald
      ];
      lineRgba = '99, 102, 241';
    }

    const particleCount = Math.min(Math.floor((width * height) / 14000), 75);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const baseRadius = Math.random() * 2 + 1;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseRadius,
        radius: baseRadius,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.45 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Draw faint connections between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.12;
            ctx.strokeStyle = `rgba(${lineRgba}, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = width;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha + Math.sin(frame * p.pulseSpeed + p.pulseOffset) * 0.15;
        const clampedAlpha = Math.max(0.08, Math.min(0.7, currentAlpha));

        ctx.fillStyle = `${p.color}${clampedAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, disabled]);

  if (disabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
    />
  );
};
