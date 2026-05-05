import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  r: number;
  isVertex: boolean;
  vertexIndex: number;
}

interface NeuralHexagonProps {
  onAssembled?: () => void;
}

export function NeuralHexagon({ onAssembled }: NeuralHexagonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [assembled, setAssembled] = useState(false);
  const assembledRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const ASSEMBLY_DELAY = 2000;
  const ASSEMBLY_DURATION = 2800;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let particles: Particle[] = [];
    let hexVertices: { x: number; y: number }[] = [];

    const PARTICLE_COUNT = window.innerWidth < 640 ? 90 : 160;
    const VERTEX_COUNT = 6;

    const computeHex = () => {
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * (window.innerWidth < 640 ? 0.34 : 0.28);
      hexVertices = [];
      for (let i = 0; i < VERTEX_COUNT; i++) {
        const angle = -Math.PI / 2 + (i * Math.PI * 2) / VERTEX_COUNT;
        hexVertices.push({
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
        });
      }
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const isVertex = i < VERTEX_COUNT;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          tx: 0,
          ty: 0,
          r: isVertex ? 3.5 : 2 + Math.random() * 1.5,
          isVertex,
          vertexIndex: isVertex ? i : -1,
        });
      }
    };

    const assignTargets = () => {
      particles.forEach((p) => {
        if (p.isVertex) {
          const v = hexVertices[p.vertexIndex];
          p.tx = v.x;
          p.ty = v.y;
        } else {
          const edgeIndex = Math.floor(Math.random() * VERTEX_COUNT);
          const t = Math.random();
          const a = hexVertices[edgeIndex];
          const b = hexVertices[(edgeIndex + 1) % VERTEX_COUNT];
          const jitter = (Math.random() - 0.5) * 4;
          const nx = -(b.y - a.y);
          const ny = b.x - a.x;
          const nl = Math.hypot(nx, ny) || 1;
          p.tx = a.x + (b.x - a.x) * t + (nx / nl) * jitter;
          p.ty = a.y + (b.y - a.y) * t + (ny / nl) * jitter;
        }
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      computeHex();
      assignTargets();
    };

    initParticles();
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    let raf = 0;
    const render = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;

      let progress = 0;
      if (elapsed > ASSEMBLY_DELAY) {
        progress = Math.min(1, (elapsed - ASSEMBLY_DELAY) / ASSEMBLY_DURATION);
      }
      const eased = easeInOut(progress);

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Brownian drift
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;
        p.vx = Math.max(-0.6, Math.min(0.6, p.vx));
        p.vy = Math.max(-0.6, Math.min(0.6, p.vy));
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        if (eased > 0) {
          p.x = p.x * (1 - eased) + p.tx * eased;
          p.y = p.y * (1 - eased) + p.ty * eased;
        }
      });

      // connecting lines
      const connectDist = 110;
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < connectDist * connectDist) {
            const proximity = 1 - Math.sqrt(d2) / connectDist;
            const alpha = proximity * (0.25 + eased * 0.55);
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // hexagon outline
      if (eased > 0.15) {
        const hexAlpha = Math.min(1, (eased - 0.15) / 0.85);
        ctx.strokeStyle = `rgba(255,255,255,${hexAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < hexVertices.length; i++) {
          const v = hexVertices[i];
          if (i === 0) ctx.moveTo(v.x, v.y);
          else ctx.lineTo(v.x, v.y);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(255,255,255,${hexAlpha * 0.6})`;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // particles - solid bright white
      particles.forEach((p) => {
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      if (progress >= 1 && !assembledRef.current) {
        assembledRef.current = true;
        setAssembled(true);
        onAssembled?.();
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [onAssembled]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full block"
      aria-hidden="true"
      data-assembled={assembled}
    />
  );
}
