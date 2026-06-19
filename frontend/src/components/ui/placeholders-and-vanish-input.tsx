import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  className,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [animating, setAnimating] = useState(false);

  const startAnimation = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  }, [placeholders.length]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  }, [startAnimation]);

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startAnimation, handleVisibilityChange]);

  const vanishAndSubmit = () => {
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      setValue("");
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    vanishAndSubmit();
    onSubmit(e);
  };

  return (
    <form
      className={cn(
        "w-full relative bg-white/5 h-12 rounded-xl overflow-hidden border border-white/10 transition duration-200 focus-within:border-blue-500/50",
        className
      )}
      onSubmit={handleSubmit}
    >
      <input
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value);
            onChange(e);
          }
        }}
        ref={inputRef}
        value={value}
        type="text"
        className={cn(
          "w-full relative text-sm sm:text-sm z-50 border-none bg-transparent text-white h-full rounded-xl focus:outline-none focus:ring-0 pl-12 pr-12 font-medium",
          animating && "text-transparent"
        )}
      />

      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-500"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      {/* Animated Placeholder */}
      <div className="absolute inset-0 flex items-center rounded-xl pointer-events-none">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              initial={{ y: 5, opacity: 0 }}
              key={`current-placeholder-${currentPlaceholder}`}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: "linear" }}
              className="text-slate-600 text-sm font-medium pl-12 truncate w-[calc(100%-3rem)]"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!value}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 transition duration-200 flex items-center justify-center z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}
