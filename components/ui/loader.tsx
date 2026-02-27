"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LoaderFiveProps {
  text?: string;
  className?: string;
}

export function LoaderFive({ text, className }: LoaderFiveProps) {
  return (
    <div className={cn("fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white", className)}>
      <motion.div
        animate={{
          opacity: [0.3, 1, 0.3],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-8 relative w-32 h-32 md:w-40 md:h-40"
      >
        <Image
          src="/BMKG.png"
          alt="BMKG Logo"
          fill
          className="object-contain"
          priority
        />
      </motion.div>
      
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center text-gray-800 font-semibold text-sm md:text-lg max-w-xl leading-relaxed px-4 whitespace-pre-line"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
