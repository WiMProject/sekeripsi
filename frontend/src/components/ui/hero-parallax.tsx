import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const HeroParallax = ({
  products,
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
    gradient?: string;
    icon?: React.ReactNode;
  }[];
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 80, damping: 25, mass: 1 };
  
  // Deteksi ukuran mobile secara dinamis untuk penyesuaian parameter animasi
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, isMobile ? 400 : 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, isMobile ? -400 : -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [isMobile ? 5 : 15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.3, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [isMobile ? 6 : 20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [isMobile ? -450 : -550, isMobile ? 50 : 200]),
    springConfig
  );

  return (
    <div
      ref={ref}
      className="h-[280vh] py-40 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
      >
        <motion.div className="flex flex-row-reverse gap-6 md:gap-10 mb-6 md:mb-10">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row gap-6 md:gap-10 mb-6 md:mb-10">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse gap-6 md:gap-10">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = () => {
  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0 z-10 pointer-events-none">
      <h1 className="text-3xl md:text-7xl font-black tracking-tighter text-white">
        Deteksi Cerdas <br />
        <span className="gradient-text">Penyakit Paru</span>
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-8 text-slate-400 font-medium leading-relaxed">
        Klasifikasi otomatis citra X-Ray dada menggunakan pipeline{" "}
        <span className="text-blue-400 font-semibold">CLAHE</span> →{" "}
        <span className="text-purple-400 font-semibold">U-Net</span> →{" "}
        <span className="text-cyan-400 font-semibold">ViT</span> →{" "}
        <span className="text-pink-400 font-semibold">Grad-CAM</span>{" "}
        untuk mendeteksi Normal, Pneumonia, dan Tuberkulosis.
      </p>
      <div className="flex flex-col sm:flex-row items-start gap-4 mt-10 pointer-events-auto">
        <Link
          to="/classify"
          className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-500 hover:scale-105 flex items-center gap-3 text-lg"
        >
          Mulai Klasifikasi
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:translate-x-1"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
        <Link
          to="/process"
          className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all duration-300 text-lg"
        >
          Lihat Proses
        </Link>
      </div>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
    gradient?: string;
    icon?: React.ReactNode;
  };
  translate: any;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-48 w-[16rem] md:h-72 md:w-[25rem] relative flex-shrink-0 transform-gpu"
    >
      <Link
        to={product.link}
        className="block group-hover/product:shadow-2xl"
      >
        <div className={cn(
          "h-full w-full rounded-2xl overflow-hidden border border-white/10 relative bg-slate-900/90 backdrop-blur-md transition-all duration-300 group-hover/product:border-blue-500/50 transform-gpu",
          product.gradient
        )}>
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              className="object-cover object-center absolute h-full w-full inset-0"
              alt={product.title}
            />
          ) : (
            <div className="flex flex-col items-center justify-between h-full w-full p-4 md:p-8 text-center bg-slate-900/40">
              <div className="flex-1 flex items-center justify-center">
                {product.icon && (
                  <div className="text-white group-hover/product:scale-110 transition-transform duration-500">
                    {product.icon}
                  </div>
                )}
              </div>
              <div className="w-full mt-2 md:mt-4">
                <h3 className="text-white font-bold text-sm md:text-lg tracking-tight mb-1 md:mb-2">
                  {product.title}
                </h3>
                <p className="text-[10px] md:text-xs text-blue-400 font-semibold uppercase tracking-wider opacity-60 group-hover/product:opacity-100 transition-opacity duration-300">
                  Lihat Detail →
                </p>
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};
