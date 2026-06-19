import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

export const FloatingNav = ({
  navItems,
  className,
  logo,
  ctaButton,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
  logo?: React.ReactNode;
  ctaButton?: {
    label: string;
    link: string;
  };
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);
  const location = useLocation();

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - (scrollYProgress.getPrevious() ?? 0);
      if (scrollYProgress.get() < 0.05) {
        setVisible(true);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.nav
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit fixed top-6 inset-x-0 mx-auto border border-white/[0.08] rounded-2xl bg-black/70 backdrop-blur-2xl shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-6 py-3 items-center justify-center gap-1",
          className
        )}
      >
        {logo && (
          <div className="mr-4 pr-4 border-r border-white/10">
            {logo}
          </div>
        )}
        {navItems.map((navItem, idx) => {
          const isActive = location.pathname === navItem.link;
          return (
            <Link
              key={`link-${idx}`}
              to={navItem.link}
              className={cn(
                "relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300",
                isActive
                  ? "text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="floating-nav-indicator"
                  className="absolute inset-0 bg-white/10 rounded-xl border border-white/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {navItem.icon && (
                  <span className="block sm:hidden">{navItem.icon}</span>
                )}
                <span className="hidden sm:block">{navItem.name}</span>
              </span>
            </Link>
          );
        })}
        {ctaButton && (
          <Link
            to={ctaButton.link}
            className="ml-3 px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
          >
            {ctaButton.label}
          </Link>
        )}
      </motion.nav>
    </AnimatePresence>
  );
};
