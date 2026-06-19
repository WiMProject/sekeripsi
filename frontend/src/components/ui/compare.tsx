import React, { useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const Compare = ({
  firstImage,
  secondImage,
  className,
  firstImageClassName,
  secondImageClassName,
  initialSliderPercentage = 50,
  slideMode = "hover",
}: {
  firstImage: string;
  secondImage: string;
  className?: string;
  firstImageClassName?: string;
  secondImageClassName?: string;
  initialSliderPercentage?: number;
  slideMode?: "hover" | "drag";
}) => {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderXPercent(percent);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (slideMode === "hover" || isDragging) {
        handleMove(e.clientX);
      }
    },
    [slideMode, isDragging, handleMove]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (slideMode === "hover" || isDragging) {
        handleMove(e.touches[0].clientX);
      }
    },
    [slideMode, isDragging, handleMove]
  );

  return (
    <div
      ref={sliderRef}
      className={cn(
        "w-full h-full overflow-hidden relative rounded-2xl border border-white/10 select-none cursor-col-resize",
        className
      )}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => {
        if (slideMode !== "hover") setIsDragging(false);
      }}
      onTouchStart={() => setIsDragging(true)}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* Second Image (right side / background) */}
      <img
        src={secondImage}
        alt="comparison-second"
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          secondImageClassName
        )}
      />

      {/* First Image (left side / clip) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)`,
        }}
      >
        <img
          src={firstImage}
          alt="comparison-first"
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            firstImageClassName
          )}
        />
      </div>

      {/* Slider Line */}
      <motion.div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-30 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
        style={{
          left: `${sliderXPercent}%`,
        }}
        transition={{ duration: 0 }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg shadow-black/30 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18-6-6 6-6" />
            <path d="m15 6 6 6-6 6" />
          </svg>
        </div>
      </motion.div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-40">
        <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
          Original
        </span>
      </div>
      <div className="absolute top-3 right-3 z-40">
        <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
          Grad-CAM
        </span>
      </div>
    </div>
  );
};
