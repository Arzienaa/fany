import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import OpeningScreen from "./components/OpeningScreen";
import FloatingPetals from "./components/FloatingPetals";
import AudioPlayer from "./components/AudioPlayer";
import BirthdayCake from "./components/BirthdayCake";
import HandwrittenLetter from "./components/HandwrittenLetter";
import ZaynMalikSurprise from "./components/ZaynMalikSurprise";
import MemoriesScrapbook from "./components/MemoriesScrapbook";
import HiddenMessage from "./components/HiddenMessage";

export default function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [shouldPlayMusic, setShouldPlayMusic] = useState(false);

  const handleOpenWebsite = () => {
    setIsOpened(true);
    setShouldPlayMusic(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-brand-pink-light overflow-x-hidden font-sans text-slate-700 select-none">
      {/* Background soft gradients matching pink and yellow lilies */}
      <div className="fixed top-0 left-0 -z-20 h-full w-full bg-linear-to-b from-brand-pink-light via-brand-peach to-brand-yellow-light/30" />
      
      {/* Soft floating background lights */}
      <div className="fixed top-1/4 -left-20 -z-10 h-96 w-96 rounded-full bg-brand-pink-medium/15 blur-3xl" />
      <div className="fixed bottom-1/4 -right-20 -z-10 h-96 w-96 rounded-full bg-brand-yellow-medium/15 blur-3xl" />

      {/* Persistent Audio Player & Particle effects across the app */}
      <AudioPlayer autoPlayTrigger={shouldPlayMusic} />
      <FloatingPetals intensity={isOpened ? "high" : "normal"} interactive={true} />

      <AnimatePresence mode="wait">
        {!isOpened ? (
          <motion.div
            key="intro"
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full"
          >
            <OpeningScreen onOpen={handleOpenWebsite} />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mx-auto w-full max-w-4xl px-4 py-16 flex flex-col items-center gap-10"
          >
            {/* Top Aesthetic Decorative Floral Divider */}
            <div className="flex items-center gap-3 text-2xl md:text-3xl animate-float-slow text-brand-pink-deep">
              <span>🌷</span>
              <span className="text-sm tracking-wider font-cute text-brand-pink-dark">handmade for you</span>
              <span>💛</span>
            </div>

            {/* Main Handwritten Letter Card */}
            <HandwrittenLetter />

            {/* Interactive Candle-Blowing Cake Section */}
            <div className="relative w-full max-w-md rounded-3xl bg-white/70 border border-brand-pink-medium/30 p-6 shadow-xs flex flex-col items-center">
              {/* Corner tape details */}
              <div className="absolute top-2 left-2 text-xs text-brand-pink-medium">🌸</div>
              <div className="absolute bottom-2 right-2 text-xs text-brand-yellow-medium">🌼</div>
              
              <h3 className="font-handwritten text-3xl font-bold text-brand-pink-deep mb-2 text-center">
                blow out the candles, fany!
              </h3>
              <BirthdayCake />
            </div>

            {/* Zayn Malik Surprising Message Component */}
            <ZaynMalikSurprise />

            {/* Memories Polaroid Scrapbook Grid */}
            <MemoriesScrapbook />

            {/* "One more thing..." Drawer message */}
            <HiddenMessage />

            {/* Final Heartwarming Outro Section */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mt-12 text-center flex flex-col items-center gap-4 py-12 px-6 max-w-lg bg-cream border border-brand-pink-medium/20 rounded-3xl shadow-xs"
            >
              {/* Spinning / floating lilies icon */}
              <div className="flex gap-2 text-3xl">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  🌷
                </motion.span>
                <motion.span
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="text-brand-pink-dark"
                >
                  💗
                </motion.span>
                <motion.span
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
                >
                  💛
                </motion.span>
              </div>

              <h2 className="font-handwritten text-4xl font-bold text-brand-pink-deep">
                happy birthday again, ika ♡
              </h2>
              
              <p className="font-sans text-base text-gray-500 font-medium">
                i hope 18 is kind to you.
              </p>
              
              <p className="font-handwritten text-3xl font-bold text-brand-pink-deep tracking-wide mt-2">
                love you always 🌷💛
              </p>
            </motion.div>

            {/* Bottom floating flower bunches in corners for a dreamy finish */}
            <div className="fixed bottom-0 left-0 -z-5 pointer-events-none opacity-40 md:opacity-75 select-none animate-float-slow">
              <svg viewBox="0 0 100 100" className="h-28 w-28 md:h-40 md:w-40 overflow-visible">
                {/* Lilies bouquet sketch */}
                <path d="M 10 100 Q 30 70 45 40" stroke="#A7C957" strokeWidth="2" fill="none" />
                <path d="M 10 100 Q 15 65 25 35" stroke="#A7C957" strokeWidth="2" fill="none" />
                <path d="M 10 100 Q 40 85 55 60" stroke="#A7C957" strokeWidth="2" fill="none" />
                {/* Lily Flowers */}
                <circle cx="45" cy="40" r="10" fill="#FFF6D1" stroke="#FEE180" strokeWidth="1" />
                <circle cx="25" cy="35" r="8" fill="#FDC2D0" stroke="#F794A7" strokeWidth="1" />
                <circle cx="55" cy="60" r="12" fill="#FDC2D0" stroke="#F794A7" strokeWidth="1" />
                <circle cx="45" cy="40" r="3" fill="#FFF" />
                <circle cx="25" cy="35" r="2" fill="#FFF" />
                <circle cx="55" cy="60" r="4" fill="#FFF" />
              </svg>
            </div>
            <div className="fixed bottom-0 right-0 -z-5 pointer-events-none opacity-40 md:opacity-75 select-none animate-float-medium" style={{ animationDelay: "1s" }}>
              <svg viewBox="0 0 100 100" className="h-28 w-28 md:h-40 md:w-40 overflow-visible">
                {/* Lilies bouquet sketch */}
                <path d="M 90 100 Q 70 70 55 40" stroke="#A7C957" strokeWidth="2" fill="none" />
                <path d="M 90 100 Q 85 65 75 35" stroke="#A7C957" strokeWidth="2" fill="none" />
                <path d="M 90 100 Q 60 85 45 60" stroke="#A7C957" strokeWidth="2" fill="none" />
                {/* Lily Flowers */}
                <circle cx="55" cy="40" r="10" fill="#FDC2D0" stroke="#F794A7" strokeWidth="1" />
                <circle cx="75" cy="35" r="8" fill="#FFF6D1" stroke="#FEE180" strokeWidth="1" />
                <circle cx="45" cy="60" r="12" fill="#FFF6D1" stroke="#FEE180" strokeWidth="1" />
                <circle cx="55" cy="40" r="3" fill="#FFF" />
                <circle cx="75" cy="35" r="2" fill="#FFF" />
                <circle cx="45" cy="60" r="4" fill="#FFF" />
              </svg>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
