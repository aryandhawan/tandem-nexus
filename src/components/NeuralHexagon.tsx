import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  sx: number; // start position (captured at assembly start)
  sy: number;
  tx: number;
  ty: number;
  r: number;
  edge: number; // which hex edge (0..5) this particle belongs to
}

interface NeuralHexagonProps {
  onAssembled?: () => void;
}

export function NeuralHexagon({ onAssembled }: NeuralHexagonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [assembled, setAssembled] = useState(false);
  const assembledRef = useRef(false);
  const startTimeRef = useRef<number>(0);
    const ASSEMBLY_DELAY = 250; // brief chaos glimpse, then immediately assemble
    const ASSEMBLY_DURATION = 2200; // smooth cinematic lock

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
    let capturedStart = false;

    const PARTICLE_COUNT = window.innerWidth < 640 ? 102 : 120; // multiple of 6
    const VERTEX_COUNT = 6;

    const computeHex = () => {
      const cx = width / 2;
      const cy = height / 2;
      const minRadius = 240;
      const maxRadius = Math.min(width, height) * 0.36;
      const radius = Math.max(Math.min(maxRadius, 300), Math.min(minRadius, maxRadius));
      hexVertices = [];
      // Flat-top: angle starts at 0; equidistant 6 vertices via i * PI/3
      for (let i = 0; i < VERTEX_COUNT; i++) {
        const angle = i * Math.PI / 3;
        hexVertices.push({
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        });
      }
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          sx: 0,
          sy: 0,
          tx: 0,
          ty: 0,
          r: 3,
          edge: 0,
        });
      }
    };

    const assignTargets = () => {
      // Evenly distribute particles across the 6 edges of the hexagon
      const perEdge = Math.floor(particles.length / VERTEX_COUNT);
      let idx = 0;
      for (let e = 0; e < VERTEX_COUNT; e++) {
        const a = hexVertices[e];
        const b = hexVertices[(e + 1) % VERTEX_COUNT];
        const count = e === VERTEX_COUNT - 1 ? particles.length - idx : perEdge;
        for (let k = 0; k < count; k++) {
          // Even spacing along edge, including both endpoints
          const t = count === 1 ? 0.5 : k / (count - 1);
          const p = particles[idx++];
          p.tx = a.x + (b.x - a.x) * t;
          p.ty = a.y + (b.y - a.y) * t;
          p.edge = e;
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const newW = rect.width || window.innerWidth;
      const newH = rect.height || window.innerHeight;
      const wasEmpty = width === 0 || height === 0;
      width = newW;
      height = newH;
      if (width === 0 || height === 0) return;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      computeHex();
      if (wasEmpty || particles.length === 0) initParticles();
      assignTargets();
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Smoothstep
    const smoothstep = (t: number) => t * t * (3 - 2 * t);

    let raf = 0;
    const render = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;

      let progress = 0;
      if (elapsed > ASSEMBLY_DELAY) {
        progress = Math.min(1, (elapsed - ASSEMBLY_DELAY) / ASSEMBLY_DURATION);
      }
      const eased = smoothstep(progress);

      // Capture starting positions exactly when assembly begins
      if (!capturedStart && elapsed > ASSEMBLY_DELAY) {
        capturedStart = true;
        particles.forEach((p) => {
          p.sx = p.x;
          p.sy = p.y;
        });
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        if (!capturedStart) {
          // Chaos: slow wandering
          p.vx += (Math.random() - 0.5) * 0.04;
          p.vy += (Math.random() - 0.5) * 0.04;
          p.vx = Math.max(-0.5, Math.min(0.5, p.vx));
          p.vy = Math.max(-0.5, Math.min(0.5, p.vy));
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        } else {
          // Smooth interpolation from captured start to target
          p.x = p.sx + (p.tx - p.sx) * eased;
          p.y = p.sy + (p.ty - p.sy) * eased;
        }
      });

      // Connections: during chaos -> nearby; once locking begins -> only same edge (clean center)
      ctx.lineWidth = 1;
      if (!capturedStart) {
        const connectDist = 120;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < connectDist * connectDist) {
              const proximity = 1 - Math.sqrt(d2) / connectDist;
              ctx.strokeStyle = `rgba(255,255,255,${proximity * 0.18})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      } else {
        // Only connect particles sharing the same edge
        const byEdge: Particle[][] = Array.from({ length: VERTEX_COUNT }, () => []);
        particles.forEach((p) => byEdge[p.edge].push(p));
        const lineAlpha = 0.25 + eased * 0.55;
        ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`;
        for (const group of byEdge) {
          // sort along the edge by x then y for sequential connecting
          group.sort((a, b) => (a.tx === b.tx ? a.ty - b.ty : a.tx - b.tx));
          for (let i = 0; i < group.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(group[i].x, group[i].y);
            ctx.lineTo(group[i + 1].x, group[i + 1].y);
            ctx.stroke();
          }
        }
      }

      // Hexagon outline once locking begins
      if (eased > 0.35) {
        const hexAlpha = Math.min(1, (eased - 0.35) / 0.65) * 0.9;
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
      }

      // Particles - crisp white circles, with shadow glow on lock
      if (eased > 0.6) {
        ctx.shadowBlur = 12 * ((eased - 0.6) / 0.4);
        ctx.shadowColor = "rgba(255,255,255,0.9)";
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = "rgba(255,255,255,1)";
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      if (!assembledRef.current && progress >= 1) {
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
