import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  type: "petal-pink" | "petal-yellow" | "heart" | "sparkle";
  opacity: number;
  swaySpeed: number;
  swayAmount: number;
  targetOpacity?: number;
}

interface FloatingPetalsProps {
  intensity?: "normal" | "high";
  interactive?: boolean;
}

export default function FloatingPetals({ intensity = "normal", interactive = true }: FloatingPetalsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const createParticle = (x?: number, y?: number, typeOverride?: Particle["type"]): Particle => {
      const pX = x !== undefined ? x : Math.random() * canvas.width;
      const pY = y !== undefined ? y : -20 - Math.random() * 20;
      const size = Math.random() * 12 + 6;
      
      const types: Particle["type"][] = ["petal-pink", "petal-yellow", "heart", "sparkle"];
      let type: Particle["type"] = "petal-pink";
      
      if (typeOverride) {
        type = typeOverride;
      } else {
        const rand = Math.random();
        if (rand < 0.4) type = "petal-pink";
        else if (rand < 0.7) type = "petal-yellow";
        else if (rand < 0.85) type = "heart";
        else type = "sparkle";
      }

      return {
        x: pX,
        y: pY,
        size,
        speedY: type === "sparkle" ? Math.random() * 0.5 + 0.3 : Math.random() * 1.2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.5,
        type,
        opacity: Math.random() * 0.5 + 0.3,
        swaySpeed: Math.random() * 0.02 + 0.005,
        swayAmount: Math.random() * 1.5 + 0.5,
      };
    };

    // Initialize initial particles distributed vertically
    const maxParticles = intensity === "high" ? 60 : 35;
    for (let i = 0; i < maxParticles; i++) {
      const p = createParticle();
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }

    // Spawn a burst of particles
    const triggerBurst = (x: number, y: number, count = 15) => {
      for (let i = 0; i < count; i++) {
        const randType = Math.random() > 0.5 ? "heart" : "sparkle";
        const p = createParticle(x, y, randType as Particle["type"]);
        p.speedY = (Math.random() - 0.5) * 3 - 0.5; // bounce slightly up
        p.speedX = (Math.random() - 0.5) * 4;
        p.size = Math.random() * 10 + 4;
        p.opacity = 1.0;
        particles.push(p);
      }
    };

    // Click handler for interactive bursts
    const handleClick = (e: MouseEvent) => {
      if (!interactive) return;
      triggerBurst(e.clientX, e.clientY, 15);
    };

    window.addEventListener("click", handleClick);

    const drawPetal = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string
    ) => {
      context.beginPath();
      context.moveTo(x, y);
      context.bezierCurveTo(
        x - size, y - size / 2,
        x - size, y + size,
        x, y + size * 1.5
      );
      context.bezierCurveTo(
        x + size, y + size,
        x + size, y - size / 2,
        x, y
      );
      context.fillStyle = color;
      context.fill();
      
      // Petal center line
      context.beginPath();
      context.moveTo(x, y + size * 0.2);
      context.quadraticCurveTo(x, y + size * 0.8, x + size * 0.1, y + size * 1.2);
      context.strokeStyle = "rgba(255, 255, 255, 0.4)";
      context.lineWidth = 1;
      context.stroke();
    };

    const drawHeart = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string
    ) => {
      context.beginPath();
      context.moveTo(x, y + size / 4);
      context.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 2);
      context.bezierCurveTo(
        x - size / 2, y + size,
        x, y + size * 1.2,
        x, y + size * 1.4
      );
      context.bezierCurveTo(
        x, y + size * 1.2,
        x + size / 2, y + size,
        x + size / 2, y + size / 2
      );
      context.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
      context.fillStyle = color;
      context.fill();
    };

    const drawSparkle = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string
    ) => {
      context.beginPath();
      context.moveTo(x, y - size);
      context.quadraticCurveTo(x, y, x + size, y);
      context.quadraticCurveTo(x, y, x, y + size);
      context.quadraticCurveTo(x, y, x - size, y);
      context.quadraticCurveTo(x, y, x, y - size);
      context.fillStyle = color;
      context.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y * p.swaySpeed) * p.swayAmount * 0.1;
        p.rotation += p.rotationSpeed;

        // Fade out burst particles that go upwards or get too old
        if (p.speedY <= 0) {
          p.opacity -= 0.015;
        }

        // Boundary checks
        if (p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20 || p.opacity <= 0) {
          if (particles.length > maxParticles) {
            particles.splice(index, 1);
          } else {
            particles[index] = createParticle();
          }
          return;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);

        if (p.type === "petal-pink") {
          drawPetal(ctx, 0, 0, p.size, "rgba(253, 194, 208, 0.85)"); // soft pink lily petal
        } else if (p.type === "petal-yellow") {
          drawPetal(ctx, 0, 0, p.size, "rgba(254, 225, 128, 0.85)"); // soft yellow lily petal
        } else if (p.type === "heart") {
          drawHeart(ctx, 0, 0, p.size * 0.8, "rgba(247, 148, 167, 0.75)"); // soft pinkish red heart
        } else {
          drawSparkle(ctx, 0, 0, p.size * 0.7, "rgba(254, 225, 128, 0.9)"); // soft golden yellow sparkle
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Spawn automatic gentle bursts at random positions to make it feel alive
    const intervalId = setInterval(() => {
      if (Math.random() > 0.4) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height * 0.7);
        triggerBurst(x, y, 6);
      }
    }, 4000);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
      clearInterval(intervalId);
    };
  }, [intensity, interactive]);

  return (
    <canvas
      id="floating-petals-canvas"
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10"
    />
  );
}
