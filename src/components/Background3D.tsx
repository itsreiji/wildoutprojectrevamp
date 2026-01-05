import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

export const Background3D = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Particles system
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: Math.random() * 2 + 1,
        size: Math.random() * 2 + 1,
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.50)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z -= particle.vz;

        if (particle.z <= 0) {
          particle.z = 1000;
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
        }

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        const scale = 1000 / (1000 + particle.z);
        const x2d = particle.x * scale + canvas.width / 2 * (1 - scale);
        const y2d = particle.y * scale + canvas.height / 2 * (1 - scale);
        const size = particle.size * scale;

        const opacity = 1 - particle.z / 1000;
        ctx.fillStyle = `rgba(233, 51, 112, ${opacity * 0.6})`;
        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        particles.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const otherScale = 1000 / (1000 + otherParticle.z);
            const otherX2d = otherParticle.x * otherScale + canvas.width / 2 * (1 - otherScale);
            const otherY2d = otherParticle.y * otherScale + canvas.height / 2 * (1 - otherScale);

            ctx.strokeStyle = `rgba(233, 51, 112, ${(1 - distance / 150) * opacity * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x2d, y2d);
            ctx.lineTo(otherX2d, otherY2d);
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Gradient Overlays */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(233,51,112,0.15),transparent_70%)]" />
      </div>

      {/* Floating 3D Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(233,51,112,0.15), transparent)',
            filter: 'blur(60px)',
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(233,51,112,0.1), transparent)',
            filter: 'blur(80px)',
          }}
          animate={{
            y: [0, 60, 0],
            x: [0, -40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute bottom-1/4 left-1/2 w-72 h-72 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(233,51,112,0.12), transparent)',
            filter: 'blur(70px)',
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Grid Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          zIndex: 3,
          backgroundImage: `
            linear-gradient(rgba(233,51,112,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(233,51,112,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </>
  );
});

Background3D.displayName = 'Background3D';
