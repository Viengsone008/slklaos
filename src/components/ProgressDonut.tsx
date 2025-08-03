"use client";
import React from "react";

const getColor = (percent: number) => {
  if (percent >= 75) return "#22c55e"; // green
  if (percent >= 40) return "#facc15"; // yellow
  return "#ef4444"; // red
};

interface ProgressDonutProps {
  percent: number;
  size?: number;
  showLabel?: boolean;
}

const ProgressDonut = ({ 
  percent, 
  size = 80, 
  showLabel = true 
}: ProgressDonutProps) => {
  // Clamp percent between 0 and 100
  const clampedPercent = Math.max(0, Math.min(100, percent || 0));
  const color = getColor(clampedPercent);
  
  // Calculate the stroke-dasharray for the circle
  const radius = (size - 8) / 2 - 5; // Account for stroke width
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(clampedPercent / 100) * circumference} ${circumference}`;
  
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
          {clampedPercent}%
        </div>
      )}
    </div>
  );
};

export default ProgressDonut;
