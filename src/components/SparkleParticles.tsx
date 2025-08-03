import React, { useEffect, useRef } from "react";

const NUM_PARTICLES = 24;
const colors = ["#fffbe6", "#ffe9b3", "#bfa76a", "#e5e2d6", "#fff"];

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const SparkleParticles: React.FC<{ className?: string }> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const particles = Array.from(
      containerRef.current?.children || []
    ) as HTMLDivElement[];
    particles.forEach((el) => {
      const duration = random(3, 7);
      const delay = random(0, 3);
      el.animate(
        [
          { opacity: 0, transform: `translateY(0px) scale(1)` },
          { opacity: 1, transform: `translateY(-30px) scale(1.2)` },
          { opacity: 0, transform: `translateY(-60px) scale(0.8)` },
        ],
        {
          duration: duration * 1000,
          delay: delay * 1000,
          iterations: Infinity,
          direction: "alternate",
          easing: "ease-in-out",
        }
      );
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 z-20 ${className || ""}`}
      aria-hidden="true"
    >
      {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${random(0, 100)}%`,
            top: `${random(10, 90)}%`,
            width: random(4, 10),
            height: random(4, 10),
            background: colors[Math.floor(random(0, colors.length))],
            borderRadius: "50%",
            filter: "blur(1px)",
            opacity: 0.7,
            boxShadow: `0 0 8px 2px #fffbe6`,
          }}
        />
      ))}
    </div>
  );
};

export default SparkleParticles;
