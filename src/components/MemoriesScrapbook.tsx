import { useState, useRef, useEffect, ChangeEvent, MouseEvent } from "react";
import { motion } from "motion/react";
import { Camera, RefreshCw, Trash2 } from "lucide-react";

// Paths of the generated placeholder illustrations
const DEFAULT_MEMORIES = [
  {
    placeholder: "/src/assets/images/memory_selfie_1784442906751.jpg",
    caption: "us being us",
    rotation: "-3deg",
    borderColor: "border-brand-pink-medium",
    tapeColor: "bg-brand-yellow-medium/40",
    tapeRotation: "-15deg",
  },
  {
    placeholder: "/src/assets/images/memory_treat_1784442923532.jpg",
    caption: "thank you for being my friend ♡",
    rotation: "2deg",
    borderColor: "border-brand-yellow-medium",
    tapeColor: "bg-brand-pink-medium/40",
    tapeRotation: "8deg",
  },
  {
    placeholder: "/src/assets/images/memory_sunset_1784442940095.jpg",
    caption: "more memories to come...",
    rotation: "-1.5deg",
    borderColor: "border-brand-pink-medium",
    tapeColor: "bg-brand-yellow-medium/40",
    tapeRotation: "-8deg",
  },
];

export default function MemoriesScrapbook() {
  // Load memories from localStorage or fallback to default generated assets
  const [photos, setPhotos] = useState<string[]>(["", "", ""]);
  const fileInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  useEffect(() => {
    try {
      const saved1 = localStorage.getItem("ika_birthday_memory_0") || "";
      const saved2 = localStorage.getItem("ika_birthday_memory_1") || "";
      const saved3 = localStorage.getItem("ika_birthday_memory_2") || "";
      setPhotos([saved1, saved2, saved3]);
    } catch (e) {
      console.error("Local storage not available", e);
    }
  }, []);

  const handlePhotoUpload = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      if (base64String) {
        const newPhotos = [...photos];
        newPhotos[index] = base64String;
        setPhotos(newPhotos);
        try {
          localStorage.setItem(`ika_birthday_memory_${index}`, base64String);
        } catch (err) {
          console.warn("Storage quota might be exceeded, saving to local state only", err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index: number, e: MouseEvent) => {
    e.stopPropagation(); // Prevent triggering file input click
    const newPhotos = [...photos];
    newPhotos[index] = "";
    setPhotos(newPhotos);
    try {
      localStorage.removeItem(`ika_birthday_memory_${index}`);
    } catch (err) {
      console.error(err);
    }
  };

  const triggerFileInput = (index: number) => {
    fileInputRefs[index].current?.click();
  };

  return (
    <div className="my-12 px-4 select-none">
      <div className="text-center mb-8">
        <h2 className="font-handwritten text-4xl font-bold text-brand-pink-deep drop-shadow-xs">
          some little memories ♡
        </h2>
        <p className="font-sans text-xs text-gray-400 mt-1">
          click on any card to insert a real photo of you and Ika! 📸
        </p>
      </div>

      {/* Grid of Polaroid Frames */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start justify-items-center">
        {DEFAULT_MEMORIES.map((memory, i) => {
          const currentPhoto = photos[i] || memory.placeholder;
          const isUploaded = !!photos[i];

          return (
            <motion.div
              key={i}
              whileHover={!isUploaded ? { scale: 1.03, y: -4, rotate: i % 2 === 0 ? "-1deg" : "1deg" } : { y: -2 }}
              style={{ transform: `rotate(${memory.rotation})` }}
              className={`relative w-72 bg-white rounded-md shadow-lg p-4 border-2 border-slate-100 flex flex-col items-center group ${isUploaded ? "cursor-default" : "cursor-pointer"} transition-shadow hover:shadow-xl pb-6`}
              onClick={() => !isUploaded && triggerFileInput(i)}
            >
              {/* Invisible file input */}
              <input
                type="file"
                ref={fileInputRefs[i]}
                onChange={(e) => handlePhotoUpload(i, e)}
                accept="image/*"
                className="hidden"
              />

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

                {/* Upload Hover Overlay - Only show if not uploaded yet */}
                {!isUploaded && (
                  <div className="absolute inset-0 bg-brand-pink-deep/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 p-2.5 rounded-full shadow-md text-brand-pink-deep">
                      <Camera size={20} />
                    </div>
                  </div>
                )}
              </div>

              {/* Caption */}
              <div className="mt-4 font-handwritten text-2xl text-slate-700 text-center px-2 h-10 flex items-center justify-center">
                {memory.caption}
              </div>

              {/* Decorative push pin doodle or heart */}
              <div className="absolute bottom-2 right-2 text-sm text-brand-pink-medium opacity-50 group-hover:opacity-100 transition-opacity">
                {isUploaded ? ["🌸", "🎀", "💖"][i % 3] : "🌷 sketch"}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
