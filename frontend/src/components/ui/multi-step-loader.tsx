import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

type LoadingState = {
  text: string;
};

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const CheckFilled = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
      clipRule="evenodd"
    />
  </svg>
);

const LoaderCore = ({
  loadingStates,
  value = 0,
}: {
  loadingStates: LoadingState[];
  value?: number;
}) => {
  return (
    <div className="flex relative justify-start max-w-xl mx-auto flex-col mt-40">
      {loadingStates.map((loadingState, index) => {
        const distance = Math.abs(index - value);
        const opacity = Math.max(1 - distance * 0.2, 0);
        return (
          <motion.div
            key={index}
            className={cn("text-left flex gap-3 mb-4")}
            initial={{ opacity: 0, y: -(value * 40) }}
            animate={{ opacity: opacity, y: -(value * 40) }}
            transition={{ duration: 0.5 }}
          >
            <div>
              {index > value && (
                <CheckIcon />
              )}
              {index <= value && (
                <CheckFilled />
              )}
            </div>
            <span
              className={cn(
                "text-white text-sm font-medium",
                value === index && "text-white",
                value > index && "text-white/50"
              )}
            >
              {loadingState.text}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 2000,
  loop = true,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
  duration?: number;
  loop?: boolean;
}) => {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }
    const timeout = setTimeout(() => {
      setCurrentState((prevState) =>
        loop
          ? prevState === loadingStates.length - 1
            ? 0
            : prevState + 1
          : Math.min(prevState + 1, loadingStates.length - 1)
      );
    }, duration);
    return () => clearTimeout(timeout);
  }, [currentState, loading, loop, loadingStates.length, duration]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl bg-black/80"
        >
          <div className="h-96 relative">
            <LoaderCore value={currentState} loadingStates={loadingStates} />
          </div>

          {/* Progress Bar */}
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xs">
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentState + 1) / loadingStates.length) * 100}%`,
                }}
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-center text-xs text-slate-500 mt-3 font-medium">
              Step {currentState + 1} dari {loadingStates.length}
            </p>
          </div>

          {/* Close hint */}
          <div className="absolute top-6 right-6">
            <p className="text-[10px] text-slate-600 font-medium">
              Memproses pipeline AI...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
