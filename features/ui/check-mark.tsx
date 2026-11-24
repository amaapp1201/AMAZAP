"use client";
import { AnimatePresence, motion } from "framer-motion";

export function AnimatedCheckIcon({
  initial = true,
  isVisible,
}: {
  isVisible: boolean;
  initial?: boolean;
}) {
  return (
    <AnimatePresence initial={initial}>
      {isVisible && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          width={24}
          height={24}
          strokeWidth={1.5}
          stroke="currentColor"
          className="CheckIcon stroke-emerald-500"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            exit={{ pathLength: 0 }}
            transition={{
              type: "tween",
              duration: 0.3,
              ease: isVisible ? "easeOut" : "easeIn",
            }}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13L9 17L19 7"
          />
        </svg>
      )}
    </AnimatePresence>
  );
}
