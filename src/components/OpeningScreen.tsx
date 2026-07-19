import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface OpeningScreenProps {
  onOpen: () => void;
}

export default function OpeningScreen({ onOpen }: OpeningScreenProps) {
  const [isBlooming, setIsBlooming] = useState(false);

  const handleOpenClick = () => {
    setIsBlooming(true);
    // Play blooming animation for 2 seconds before proceeding
    setTimeout(() => {
      onOpen();
    }, 2200);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-pink-light px-6 text-center select-none">
      {/* Subtle background glow/ambient elements */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-brand-yellow-light opacity-60 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-brand-peach opacity-60 blur-3xl" />

      <AnimatePresence mode="wait">
        {!isBlooming ? (
          <motion.div
            key="greetings"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="z-20 flex flex-col items-center gap-6"
          >
            {/* Adorable custom hand-drawn icon */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="text-6xl filter drop-shadow-sm select-none"
            >
              🌷✨
            </motion.div>

            <h1 className="font-cute text-4xl font-bold tracking-tight text-brand-pink-deep md:text-5xl">
              hii ika ♡
            </h1>
            
            <p className="font-sans text-base text-gray-500 md:text-lg">
              i made a little something for you…
            </p>

            <motion.button
              id="open-birthday-btn"
              onClick={handleOpenClick}
              whileHover={{ scale: 1.06, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-cute font-medium text-brand-pink-deep border-2 border-brand-pink-medium shadow-sm hover:bg-brand-pink-light hover:border-brand-pink-dark hover:shadow-md transition-all cursor-pointer select-none"
            >
              OPEN THIS <span className="text-xl">🌷</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="blooming"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-20 flex flex-col items-center justify-center"
          >
            {/* The Blooming Flower SVG Animation */}
            <div className="relative h-64 w-64 flex items-center justify-center">
              {/* Star sparkles shooting out */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1.2, 0],
                    x: Math.cos((i * Math.PI) / 4) * 110,
                    y: Math.sin((i * Math.PI) / 4) * 110,
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.8,
                    ease: "easeOut",
                    delay: 0.4
                  }}
                  className="absolute text-xl"
                >
                  {i % 2 === 0 ? "✨" : "💖"}
                </motion.div>
              ))}

              {/* Central Flower SVG */}
              <svg viewBox="0 0 100 100" className="h-48 w-48 overflow-visible">
                {/* Flower Stem */}
                <motion.path
                  d="M 50 50 Q 50 82 48 95"
                  fill="none"
                  stroke="#C2D5A8" // softer sage green
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
                
                {/* Cute green leaves */}
                <motion.path
                  d="M 49 70 Q 35 65 32 55 Q 42 60 49 70"
                  fill="#C2D5A8" // softer sage green
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 60, damping: 15 }}
                  style={{ transformOrigin: "49px 70px" }}
                />
                <motion.path
                  d="M 49 80 Q 65 78 68 68 Q 57 73 49 80"
                  fill="#C2D5A8" // softer sage green
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 60, damping: 15 }}
                  style={{ transformOrigin: "49px 80px" }}
                />

                {/* 6 beautiful petals blooming in pink and yellow lilies style */}
                {[...Array(6)].map((_, index) => {
                  const angle = index * 60;
                  const color = index % 2 === 0 ? "#FFF0F2" : "#FFFCEB"; // even softer pastel pink and creamy white-yellow
                  const outline = index % 2 === 0 ? "#FDC2D0" : "#FEE180"; // softer border
                  
                  return (
                    <motion.g
                      key={index}
                      initial={{ scale: 0, rotate: angle }}
                      animate={{ scale: 1, rotate: angle + 360 }}
                      transition={{
                        delay: 0.4 + index * 0.15,
                        type: "spring",
                        stiffness: 50, // softer spring stiffness
                        damping: 14,
                        duration: 2.0 // slower, softer bloom
                      }}
                      style={{ transformOrigin: "50px 50px" }}
                    >
                      <path
                        d="M 50 50 C 38 22, 62 22, 50 50" // beautifully curved round-soft petal
                        fill={color}
                        stroke={outline}
                        strokeWidth="1.2"
                        className="drop-shadow-xs"
                      />
                      <circle cx="50" cy="30" r="1" fill="#FFF" opacity="0.8" />
                    </motion.g>
                  );
                })}

                {/* Flower center pistil/stamen */}
                <motion.g
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.4, type: "spring", stiffness: 80, damping: 12 }}
                  style={{ transformOrigin: "50px 50px" }}
                >
                  {/* Outer stamen points */}
                  {[...Array(5)].map((_, i) => {
                    const angle = (i * 72 * Math.PI) / 180;
                    const sx = 50 + Math.cos(angle) * 7;
                    const sy = 50 + Math.sin(angle) * 7;
                    return (
                      <g key={i}>
                        <line x1="50" y1="50" x2={sx} y2={sy} stroke="#E5C158" strokeWidth="0.8" />
                        <circle cx={sx} cy={sy} r="1.2" fill="#FFF275" stroke="#E5C158" strokeWidth="0.5" />
                      </g>
                    );
                  })}
                  
                  {/* Central glowing core */}
                  <circle cx="50" cy="50" r="5" fill="#FFFCEB" stroke="#FEE180" strokeWidth="1" />
                  <circle cx="50" cy="50" r="2.5" fill="#FFF" opacity="0.9" />
                </motion.g>
              </svg>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1, 1], y: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.6 }}
              className="font-handwritten text-3xl font-bold text-brand-pink-deep mt-4"
            >
              blooming for you... 🌷✨
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
