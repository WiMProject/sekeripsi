import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export const TracingBeam = ({
  children,
  className,
  offset = ["start 30%", "end 90%"],
}: {
  children: React.ReactNode;
  className?: string;
  offset?: NonNullable<Parameters<typeof useScroll>[0]>["offset"];
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setSvgHeight(contentRef.current.offsetHeight);
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset,
  });

  const y1 = useSpring(
    useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]),
    {
      stiffness: 500,
      damping: 90,
    }
  );
  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200]),
    {
      stiffness: 500,
      damping: 90,
    }
  );

  return (
    <motion.div
      ref={ref}
      className={cn("relative w-full max-w-5xl mx-auto", className)}
    >
      <div className="absolute -left-4 md:-left-16 top-3">
        <motion.div
          transition={{
            duration: 0.2,
            delay: 0.5,
          }}
          animate={{
            boxShadow:
              scrollYProgress.get() > 0
                ? "none"
                : "rgba(59, 130, 246, 0.5) 0px 3px 10px 0px",
          }}
          className="ml-[27px] h-4 w-4 rounded-full border border-white/10 shadow-sm flex items-center justify-center"
        >
          <motion.div
            transition={{
              duration: 0.2,
              delay: 0.5,
            }}
            animate={{
              backgroundColor:
                scrollYProgress.get() > 0
                  ? "white"
                  : "rgb(59, 130, 246)",
              borderColor:
                scrollYProgress.get() > 0
                  ? "white"
                  : "rgb(59, 130, 246)",
            }}
            className="h-2 w-2 rounded-full border border-neutral-300 bg-white"
          />
        </motion.div>
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight}
          className="ml-4 block"
          aria-hidden="true"
        >
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="#9091A0"
            strokeOpacity="0.16"
            transition={{
              duration: 10,
            }}
          />
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="1.25"
            className="motion-reduce:hidden"
            transition={{
              duration: 10,
            }}
          />
          <defs>
            <motion.linearGradient
              id="gradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1}
              y2={y2}
            >
              <stop stopColor="#3b82f6" stopOpacity="0" />
              <stop stopColor="#3b82f6" />
              <stop offset="0.325" stopColor="#a855f7" />
              <stop offset="1" stopColor="#ec4899" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef} className="pl-8 md:pl-12">
        {children}
      </div>
    </motion.div>
  );
};
