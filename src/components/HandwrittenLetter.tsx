import { motion } from "motion/react";

export default function HandwrittenLetter() {
  return (
    <div className="flex flex-col items-center justify-center p-4 my-8 select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-full max-w-xl rounded-3xl bg-cream border-2 border-brand-pink-medium p-8 shadow-lg overflow-visible"
      >
        {/* Aesthetic Paper Clip or Ribbon Decoration */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-yellow-medium/60 border border-brand-yellow-medium/70 px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 z-10 text-xs text-brand-yellow-dark font-cute font-bold transform -rotate-1">
          <span>🎀 special mail</span>
        </div>

        {/* Washi Tape on top left and top right */}
        <div className="absolute -top-3 -left-3 h-6 w-16 bg-brand-pink-medium/30 border border-white/20 transform -rotate-12 rounded-xs shadow-xs" />
        <div className="absolute -top-3 -right-3 h-6 w-16 bg-brand-yellow-medium/30 border border-white/20 transform rotate-12 rounded-xs shadow-xs" />

        {/* Grid Lined Background pattern */}
        <div className="absolute inset-0 rounded-3xl opacity-5 pointer-events-none" 
          style={{
            backgroundImage: "radial-gradient(#F794A7 1px, transparent 1px), radial-gradient(#FEE180 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 10px 10px"
          }}
        />

        {/* Outer card sparkles */}
        <div className="absolute -top-4 -left-4 text-2xl animate-float-slow">🌷</div>
        <div className="absolute -bottom-4 -right-4 text-2xl animate-float-medium">💛</div>

        {/* The Handwritten Note content */}
        <div className="relative flex flex-col gap-6 text-center">
          {/* Header */}
          <div className="flex flex-col items-center">
            <h2 className="font-cute text-2xl font-bold text-brand-pink-deep tracking-tight mb-2">
              happy 18th birthday, rizkah fany! 🎂💗
            </h2>
            <div className="h-0.5 w-24 bg-gradient-to-r from-brand-pink-medium via-brand-yellow-medium to-brand-pink-medium rounded-full" />
          </div>

          {/* Letter Body */}
          <div className="bg-white/80 border border-brand-pink-light p-6 md:p-8 rounded-2xl shadow-xs leading-relaxed text-left">
            {/* Greeting in a larger cursive letter */}
            <p className="font-handwritten text-3xl font-bold text-brand-pink-deep mb-4">
              Happy 18th birthday, HAHAHA!
            </p>
            
            {/* Adult joke highlighting */}
            <span className="inline-block bg-brand-yellow-light text-brand-yellow-dark font-cute text-xs font-bold px-3 py-1 rounded-full border border-brand-yellow-medium/30 transform -rotate-2 mb-4">
              ✨ YOU'RE AN ADULT NOW ♡ ✨
            </span>

            {/* Heartfelt notes */}
            <p className="font-handwritten text-2xl text-slate-700 font-medium">
              Thank you for being Ika. I hope this year brings you lots of happiness, fun days, beautiful memories, and everything you've ever wanted.
            </p>
            
            <p className="font-handwritten text-2xl text-slate-700 font-medium mt-4">
              You deserve all the beautiful things in the world 🌷💛
            </p>
          </div>

          {/* Footer details */}
          <div className="flex items-center justify-center text-xs text-gray-400 italic font-sans px-2">
            <span className="flex items-center gap-1">with love <span className="text-brand-pink-dark">💖</span></span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
