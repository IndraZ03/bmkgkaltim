"use client";

import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate } from "framer-motion";
import { useEffect } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
      },
      {
        duration: 0.05,
        delay: stagger(0.01, { startDelay: 0.1 }),
      }
    );
  }, [animate]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {words.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.split("").map((char, index) => (
                <motion.span
                  initial={{
                    opacity: 0,
                  }}
                  key={`char-${index}`}
                  className={cn(
                    `dark:text-white opacity-0`,
                    word.className
                  )}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div
      className={cn(
        "text-center",
        className
      )}
    >
      {renderWords()}
    </div>
  );
};

export const TypewriterEffectSmooth = TypewriterEffect;
