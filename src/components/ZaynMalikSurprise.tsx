import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart, X, Sparkle } from "lucide-react";

// Image generated earlier
const ZAYN_IMAGE_PATH = "/src/assets/images/zayn_malik_pastel_surprise_1784444317497.jpg";

export default function ZaynMalikSurprise() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-8 select-none w-full">
      <div className="relative">
        {/* Pulsing glow ring behind button */}
        <div className="absolute -inset-1.5 rounded-full bg-linear-to-r from-brand-pink-medium to-brand-yellow-medium opacity-75 blur-md animate-pulse" />
        
        <motion.button
          id="zayn-surprise-btn"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center gap-3 rounded-full bg-white px-8 py-4 font-cute font-bold text-brand-pink-deep border-3 border-brand-pink-medium shadow-lg hover:shadow-xl cursor-pointer transition-all text-sm md:text-base z-10"
        >
          <span className="animate-bounce">🎁</span>
          <span>wait… someone has a message for you 👀</span>
          <span className="text-brand-yellow-dark">✨</span>
        </motion.button>
      </div>
      <p className="text-xs text-brand-pink-dark/80 font-sans mt-2.5 animate-pulse">
        (click to unlock Zayn Malik's secret message for you! 🤫🎵)
      </p>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark/Blurry overlay (pastel-themed) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-brand-pink-deep/20 backdrop-blur-md cursor-pointer"
            />

            {/* Pop-up Card */}
            <motion.div
              initial={{ scale: 0.85, y: 50, opacity: 0 }}
              animate={{ 
                scale: 1, 
                y: 0, 
                opacity: 1,
                transition: { type: "spring", stiffness: 100, damping: 15 }
              }}
              exit={{ scale: 0.85, y: 50, opacity: 0 }}
              className="relative z-10 w-full max-w-sm rounded-3xl bg-cream border-2 border-brand-pink-medium p-6 shadow-2xl overflow-hidden flex flex-col items-center"
            >
              {/* Cute corner decorations */}
              <div className="absolute top-2 left-2 text-brand-pink-medium text-xl animate-pulse">🌸</div>
              <div className="absolute bottom-2 right-2 text-brand-yellow-medium text-xl animate-pulse">🌷</div>

              {/* Close Button */}
              <button
                id="close-zayn-surprise"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-brand-pink-deep transition-colors p-1 bg-white border border-brand-pink-light rounded-full shadow-xs cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Sparkle explosion effects */}
              <div className="absolute top-12 left-10 text-brand-yellow-dark animate-bounce">
                <Sparkle size={18} fill="currentColor" />
              </div>
              <div className="absolute bottom-16 right-8 text-brand-pink-dark animate-bounce" style={{ animationDelay: "0.5s" }}>
                <Sparkles size={18} />
              </div>

              {/* Card Header (Retro Polaroid CD vinyl cover vibe) */}
              <div className="mb-4 flex flex-col items-center text-center">
                <span className="text-[10px] uppercase tracking-wider font-cute text-brand-pink-dark bg-brand-pink-light border border-brand-pink-medium px-2.5 py-0.5 rounded-full mb-2">
                  ✨ happy birthday Ika ✨
                </span>
                <h3 className="font-cute text-xl font-bold text-brand-pink-deep">
                  suami kamu ini nitip pesan ✨
                </h3>
              </div>

              {/* Polaroid Image of Zayn (Generated Asset) */}
              <div className="relative mb-4 p-2 bg-white rounded-xl shadow-md border border-brand-pink-light/60 transform rotate-1 hover:rotate-0 transition-transform duration-300 max-w-[220px]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-yellow-medium/40 border border-brand-yellow-medium/60 h-6 w-16 -rotate-12 rounded-xs z-10" title="Sticky Tape decoration" />
                <img
                  src={ZAYN_IMAGE_PATH}
                  alt="Zayn Malik chibi"
                  referrerPolicy="no-referrer"
                  className="rounded-lg object-cover w-full h-auto"
                />
                <div className="text-center font-handwritten text-base text-brand-pink-deep font-bold mt-2">
                  happy birthday ika ✨
                </div>
              </div>

              {/* Zayn's Message */}
              <div className="w-full bg-white/75 border border-brand-pink-light p-4 rounded-2xl text-center shadow-xs mb-3">
                <p className="font-handwritten text-2xl leading-relaxed text-slate-700 font-medium">
                  “Happy birthday, Ika! ✨
                </p>
                <p className="font-handwritten text-2xl leading-relaxed text-slate-700 font-medium mt-1">
                  Hope you have an amazing day. Keep smiling and enjoy being 18 ✨”
                </p>
              </div>

              {/* Playful Confession */}
              <div className="text-center font-sans text-xs text-gray-400 italic">
                “okay fine… maybe I helped him write this 🤭”
              </div>

              {/* Little Floating particles inside card */}
              <div className="flex gap-2 mt-4 text-xs">
                <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-rose-300">🌸</motion.span>
                <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.3 }} className="text-yellow-300">💛</motion.span>
                <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.8, delay: 0.6 }} className="text-rose-300">🌷</motion.span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
