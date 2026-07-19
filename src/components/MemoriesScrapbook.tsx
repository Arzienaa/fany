import { motion } from "motion/react";
import memorySelfie from "../assets/images/memory_selfie_1784442906751.jpg";
import memorySunset from "../assets/images/memory_sunset_1784442940095.jpg";
import memoryTreat from "../assets/images/memory_treat_1784442923532.jpg";

// Paths of the generated placeholder illustrations
const DEFAULT_MEMORIES = [
  {
    placeholder: memorySelfie,
    caption: "us being us",
    rotation: "-3deg",
    borderColor: "border-brand-pink-medium",
    tapeColor: "bg-brand-yellow-medium/40",
    tapeRotation: "-15deg",
  },
  {
    placeholder: memoryTreat,
    caption: "thank you for being my friend",
    rotation: "2deg",
    borderColor: "border-brand-yellow-medium",
    tapeColor: "bg-brand-pink-medium/40",
    tapeRotation: "8deg",
  },
  {
    placeholder: memorySunset,
    caption: "more memories to come...",
    rotation: "-1.5deg",
    borderColor: "border-brand-pink-medium",
    tapeColor: "bg-brand-yellow-medium/40",
    tapeRotation: "-8deg",
  },
];

export default function MemoriesScrapbook() {

  return (
    <div className="my-12 px-4 select-none">
      <div className="text-center mb-8">
        <h2 className="font-handwritten text-4xl font-bold text-brand-pink-deep drop-shadow-xs">
          some little memories 
        </h2>
        <p className="font-sans text-xs text-gray-400 mt-1">
          🌷🥰
        </p>
      </div>

      {/* Grid of Polaroid Frames */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start justify-items-center">
        {DEFAULT_MEMORIES.map((memory, i) => {
          const currentPhoto = memory.placeholder;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              style={{ transform: `rotate(${memory.rotation})` }}
              className="relative w-72 bg-white rounded-md shadow-lg p-4 border-2 border-slate-100 flex flex-col items-center transition-shadow hover:shadow-xl pb-6"
            >

              {/* Sticky washi tape decoration */}
              <div
                style={{ transform: `rotate(${memory.tapeRotation})` }}
                className={`absolute -top-4 h-6 w-24 border border-white/20 shadow-xs rounded-xs z-10 ${memory.tapeColor}`}
              />

              {/* Polaroid Image Box */}
              <div className={`relative w-full aspect-square overflow-hidden bg-slate-50 border-4 ${memory.borderColor} rounded-sm flex items-center justify-center`}>
                <img
                  src={currentPhoto}
                  alt={memory.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                </div>


              {/* Caption */}
              <div className="mt-4 font-handwritten text-2xl text-slate-700 text-center px-2 h-10 flex items-center justify-center">
                {memory.caption}
              </div>

              {/* Decorative push pin doodle or heart */}
              <div className="absolute bottom-2 right-2 text-sm text-brand-pink-medium opacity-50 group-hover:opacity-100 transition-opacity">
                {["🌸", "🎀", "💖"][i % 3]}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
