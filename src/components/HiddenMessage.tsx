import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Sparkles, Smile, RotateCcw } from "lucide-react";

interface LocalHeart {
  id: number;
  x: number;
  size: number;
  delay: number;
}

export default function HiddenMessage() {
  const [gameState, setGameState] = useState<"initial" | "quiz" | "accepted">("initial");
  const [hearts, setHearts] = useState<LocalHeart[]>([]);
  const [noBtnPos, setNoBtnPos] = useState({ x: 0, y: 0 });
  const [noCount, setNoCount] = useState(0);

  const startQuiz = () => {
    setGameState("quiz");
    setNoCount(0);
    setNoBtnPos({ x: 0, y: 0 });
  };

  const handleNoHoverOrClick = () => {
    // Teleport the "No" button randomly inside a safe boundary
    const randomX = (Math.random() - 0.5) * 140; // -70px to +70px
    const randomY = (Math.random() - 0.5) * 80;  // -40px to +40px
    setNoBtnPos({ x: randomX, y: randomY });
    setNoCount((prev) => prev + 1);
  };

  const handleYesClick = () => {
    setGameState("accepted");

    // Spawn a huge burst of tiny floating hearts
    const newHearts = Array.from({ length: 18 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 80 + 10, // percentage from left
      size: Math.random() * 24 + 10, // px size
      delay: Math.random() * 0.8,
    }));
    setHearts(newHearts);
  };

  const getNoMessage = () => {
    if (noCount === 0) return "Click below to answer! 👇";
    if (noCount === 1) return "eh? wrong button! 😜";
    if (noCount === 2) return "seriously? try again 🧐";
    if (noCount === 3) return "unclickable area alert! 🚨";
    if (noCount === 4) return "just click YES already! 😂";
    return "system error: 'No' is not an option! 🚫";
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 my-10 select-none w-full">
      <AnimatePresence mode="wait">
        {gameState === "initial" && (
          <motion.button
            key="initial-btn"
            id="one-more-thing-btn"
            onClick={startQuiz}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 rounded-full bg-linear-to-r from-brand-yellow-medium/70 to-brand-pink-medium/70 border border-brand-pink-dark/10 px-8 py-3.5 font-cute text-sm font-semibold text-brand-pink-deep hover:from-brand-yellow-medium hover:to-brand-pink-medium shadow-md hover:shadow-lg cursor-pointer transition-all duration-300"
          >
            <span>one more thing... ✨</span>
          </motion.button>
        )}

        {gameState === "quiz" && (
          <motion.div
            key="quiz-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="relative w-full max-w-sm rounded-3xl bg-cream border-2 border-brand-pink-medium p-6 shadow-xl text-center overflow-hidden"
          >
            <div className="absolute top-2 left-4 text-brand-pink-medium animate-pulse">🌸</div>
            <div className="absolute top-2 right-4 text-brand-yellow-dark animate-pulse">✨</div>

            <h4 className="font-cute text-xs uppercase tracking-wider text-brand-pink-dark/70 mb-1">
              ✨ Bestie Contract Update ✨
            </h4>
            
            <p className="font-handwritten text-2xl font-bold text-slate-800 my-4 leading-snug">
              Will you stay stuck with me forever? 🥺👉👈
            </p>

            {/* Bubble hint text */}
            <div className="min-h-[28px] flex items-center justify-center mb-6">
              <motion.span
                key={noCount}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xs font-sans text-brand-pink-dark bg-brand-pink-light/60 border border-brand-pink-medium/30 px-3 py-1 rounded-full italic"
              >
                {getNoMessage()}
              </motion.span>
            </div>

            {/* Action buttons with runaway No */}
            <div className="relative flex justify-center items-center gap-6 h-20 w-full">
              {/* YES Button */}
              <motion.button
                id="yes-btn"
                onClick={handleYesClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-linear-to-r from-brand-pink-medium to-brand-pink-dark text-white rounded-full font-cute font-bold text-sm shadow-md hover:shadow-lg cursor-pointer z-20"
              >
                YES! 🌷
              </motion.button>

              {/* Runaway NO Button */}
              <motion.button
                id="no-btn"
                onMouseEnter={handleNoHoverOrClick}
                onTouchStart={handleNoHoverOrClick}
                onClick={handleNoHoverOrClick}
                animate={{ x: noBtnPos.x, y: noBtnPos.y }}
                transition={{ type: "spring", stiffness: 150, damping: 12 }}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full font-cute text-xs shadow-xs cursor-pointer absolute z-10"
                style={{ right: "15%" }}
              >
                No 😢
              </motion.button>
            </div>
          </motion.div>
        )}

        {gameState === "accepted" && (
          <motion.div
            key="accepted-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="relative w-full max-w-sm rounded-3xl bg-white border-2 border-dashed border-brand-pink-medium p-6 shadow-xl text-center overflow-hidden"
          >
            {/* Background hearts animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              {hearts.map((heart) => (
                <motion.div
                  key={heart.id}
                  initial={{ y: 250, opacity: 0 }}
                  animate={{ y: -60, opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 2.5,
                    ease: "easeOut",
                    delay: heart.delay,
                  }}
                  style={{ left: `${heart.x}%`, width: heart.size, height: heart.size }}
                  className="absolute text-brand-pink-medium"
                >
                  <Heart fill="currentColor" size={heart.size} />
                </motion.div>
              ))}
            </div>

            {/* Sparkles decorations */}
            <div className="absolute top-2 left-4 text-brand-yellow-dark animate-pulse">✨</div>
            <div className="absolute bottom-2 right-4 text-brand-pink-dark animate-pulse">🌸</div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col gap-4">
              <div className="mx-auto bg-brand-pink-light p-3 rounded-full text-brand-pink-deep animate-bounce">
                <Smile size={28} />
              </div>

              <h4 className="font-cute text-xs uppercase tracking-wider text-brand-pink-dark/80 font-bold">
                Contract Confirmed! 🎉
              </h4>

              <p className="font-handwritten text-3xl font-bold text-brand-pink-deep leading-relaxed px-1">
                “ur stuck with me forever okayokay HAHAHAH”
              </p>
              
              <p className="font-cute text-sm text-gray-500 flex items-center justify-center gap-1.5 mt-1">
                sorry, no refunds <span className="text-lg">🤭🌸</span>
              </p>

              {/* Reset button to let them play again */}
              <button
                id="reset-secret-msg"
                onClick={() => setGameState("initial")}
                className="mt-4 mx-auto text-[10px] text-gray-400 hover:text-brand-pink-deep bg-slate-50 hover:bg-slate-100 rounded-full px-3 py-1.5 transition-all cursor-pointer border border-slate-200 flex items-center gap-1.5"
              >
                <RotateCcw size={10} />
                <span>play again 🤫</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
