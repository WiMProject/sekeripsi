import { cn } from "@/lib/utils";
import { useMotionValue, motion, useMotionTemplate } from "motion/react";
import { useCallback } from "react";

export const Spotlight = ({
  className,
  fill,
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute -top-40 left-0 h-[200%] w-[200%] md:-top-20"
      >
        <svg
          className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 3787 2842"
          fill="none"
        >
          <g filter="url(#filter)">
            <ellipse
              cx="1924.71"
              cy="273.501"
              rx="1924.71"
              ry="273.501"
              transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
              fill={fill || "white"}
              fillOpacity="0.21"
            />
          </g>
          <defs>
            <filter
              id="filter"
              x="0.860352"
              y="0.838989"
              width="3785.16"
              height="2840.26"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="151"
                result="effect1_foregroundBlur_1065_8"
              />
            </filter>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
};

export const SpotlightCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback(
    ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    },
    [mouseX, mouseY]
  );

  return (
    <div
      className={cn(
        "group relative rounded-3xl border border-white/5 bg-white/[0.03] overflow-hidden",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </div>
  );
};
