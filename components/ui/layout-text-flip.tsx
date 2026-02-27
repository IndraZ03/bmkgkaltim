"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LayoutTextFlip = ({
  words,
  duration = 3000,
  flipClassName,
  className,
}: {
  words: string[];
  duration?: number;
  flipClassName?: string;
  className?: string; // Optional, might be used for other styling
  text?: string; // Kept for compatibility if used, but logic relies on words
}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => {
        const index = words.indexOf(prev);
        return words[(index + 1) % words.length];
      });
    }, duration);
    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <motion.div
      layout
      className={cn(
        "inline-flex items-center justify-center overflow-hidden",
        flipClassName
      )}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={currentWord}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={cn("inline-block whitespace-nowrap", className)}
        >
          {currentWord}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
};
