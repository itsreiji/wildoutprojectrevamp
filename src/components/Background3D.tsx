import React, { useEffect, useRef } from "react";

export const Background3D = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  const [_rotation, _setRotation] = React.useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window) {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
      }
    };

    if (window) {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (window) {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const animate = () => {
      if (window && requestAnimationFrame) {
        animationFrameId = requestAnimationFrame(animate);
        _setRotation((prev: number) => (prev + 0.001) % 6.283);
      }
    };

    animate();

    return () => {
      if (animationFrameId && window && cancelAnimationFrame) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
    </div>
  );
});

Background3D.displayName = "Background3D";
