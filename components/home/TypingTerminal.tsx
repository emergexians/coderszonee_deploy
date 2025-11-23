"use client";

import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { useEffect, useState } from "react";

export default function TypingTerminal() {
  const lines = [
    "> initializing coderszonee environment...",
    "> loading all courses, skill & career paths...",
    "> connecting with industry mentors...",
    "> starting live cohort session...",
    "> success ✔ Welcome to Coderszonee",
  ];

  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (lineIndex < lines.length) {
      if (charIndex < lines[lineIndex].length) {
        const timeout = setTimeout(() => {
          setCurrentLine((prev) => prev + lines[lineIndex][charIndex]);
          setCharIndex((prev) => prev + 1);
        }, 50); // typing speed
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setDisplayedLines((prev) => [...prev, lines[lineIndex]]);
          setCurrentLine("");
          setCharIndex(0);
          setLineIndex((prev) => prev + 1);
        }, 500); // delay before next line starts
        return () => clearTimeout(timeout);
      }
    }
  }, [charIndex, lineIndex]);

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg h-auto rounded-2xl bg-gradient-to-br from-black via-zinc-900 to-gray-800 border border-orange-500/40 shadow-[0_0_30px_rgba(249,115,22,0.3)] p-4 sm:p-6 font-mono text-green-400 text-xs sm:text-sm">
        {/* Header */}
        <div className="flex items-center gap-2 text-orange-400 mb-3 sm:mb-4">
          <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-semibold text-sm sm:text-base">
            coderszonee@terminal
          </span>
        </div>

        {/* Already displayed lines */}
        {displayedLines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}

        {/* Currently typing line */}
        {lineIndex < lines.length && (
          <p>
            {currentLine}
            <span className="animate-pulse">|</span>
          </p>
        )}
      </div>
    </motion.div>
  );
}
