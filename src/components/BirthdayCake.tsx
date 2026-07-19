import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, RefreshCw, Trash2, Sliders, Sparkles } from "lucide-react";

interface Topping {
  id: string;
  name: string;
  imageUrl: string;
  rotate: number; // angle in degrees
  stickHeight: number; // height of stick in pixels
  scale: number; // size scaling
  x: number; // visual offset x from default
  y: number; // visual offset y from default
}

interface SearchResult {
  name: string;
  imageUrl: string;
  source: string;
}

function cleanToppingName(name: string, searchQ: string): string {
  let cleaned = name;

  // 1. Remove standard prefixes like "File:" or "Category:"
  cleaned = cleaned.replace(/^(File|Image|Media|Category):/i, "");

  // 2. Remove common file extensions and trailing hashes/sizes
  cleaned = cleaned.replace(/\.(jpg|jpeg|png|gif|svg|webp|tiff|bmp)$/i, "");

  // 3. Replace underscores, hyphens, and multiple spaces with a single space
  cleaned = cleaned.replace(/_/g, " ");

  // 4. Remove content inside parentheses or brackets (e.g. "Zayn Malik (cropped)" -> "Zayn Malik")
  const tempCleaned = cleaned.replace(/\s*[([].*?[\])]/g, "").trim();
  if (tempCleaned.length > 1) {
    cleaned = tempCleaned;
  }

  // 5. If there is a separator like a hyphen or vertical pipe, keep only the first part
  // e.g. "Zayn Malik - Cannes Film Festival" -> "Zayn Malik"
  if (cleaned.includes(" - ") || cleaned.includes(" | ")) {
    const parts = cleaned.split(/\s*(?:-|\s+-\s+|\|)\s*/);
    if (parts[0] && parts[0].trim().length > 1) {
      cleaned = parts[0].trim();
    }
  }

  // 6. Special user request handling:
  // "misalnya dicari zayn malik, fotonya tulisannya zayn malik juga jangan ada tambahan"
  // If the user's search query is a substring of the name, keep only the matching query!
  if (searchQ.trim()) {
    const q = searchQ.trim().toLowerCase();
    const cleanedLower = cleaned.toLowerCase();
    const idx = cleanedLower.indexOf(q);
    if (idx !== -1) {
      const exactMatch = cleaned.substring(idx, idx + q.length);
      cleaned = exactMatch;
    }
  }

  // Clean trailing/leading whitespace and any redundant characters
  cleaned = cleaned.trim();

  // 7. Standard title casing for visual beauty
  cleaned = cleaned
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return cleaned || name;
}

export default function BirthdayCake() {
  const [candlesLit, setCandlesLit] = useState(true);
  const [wishMade, setWishMade] = useState(false);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTopping, setSelectedTopping] = useState<SearchResult | null>(null);
  const [activeToppingId, setActiveToppingId] = useState<string | null>(null);

  // Reference container to constrain dragging of toppings
  const arenaRef = useRef<HTMLDivElement>(null);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const toppingStart = useRef({ x: 0, y: 0 });

  // Add robust global window tracking to fix desktop dragging and prevent focus/drag losses
  useEffect(() => {
    if (draggingId === null) return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      setToppings((prev) =>
        prev.map((item) =>
          item.id === draggingId
            ? { ...item, x: toppingStart.current.x + dx, y: toppingStart.current.y + dy }
            : item
        )
      );
    };

    const handleWindowPointerUp = () => {
      setDraggingId(null);
    };

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
    };
  }, [draggingId]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, topping: Topping) => {
    e.preventDefault(); // Prevents browser native dragging/text selection!
    e.stopPropagation();
    setActiveToppingId(topping.id);
    setDraggingId(topping.id);
    dragStart.current = { x: e.clientX, y: e.clientY };
    toppingStart.current = { x: topping.x, y: topping.y };
  };

  const blowCandle = () => {
    if (!candlesLit) return;
    setCandlesLit(false);
    setTimeout(() => {
      setWishMade(true);
    }, 600);
  };

  const resetCandle = () => {
    setCandlesLit(true);
    setWishMade(false);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults([]);
    setSelectedTopping(null);

    try {
      // 1a. Search Wikipedia English (with page images)
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=12&prop=pageimages&piprop=thumbnail|original&pithumbsize=400&format=json&origin=*`;
      const wikiPromise = fetch(wikiUrl)
        .then((r) => r.json())
        .then((data) => {
          if (!data.query || !data.query.pages) return [];
          return Object.values(data.query.pages)
            .map((page: any) => ({
              name: page.title,
              imageUrl: page.original?.source || page.thumbnail?.source || "",
              source: "Wikipedia",
            }))
            .filter((item) => !!item.imageUrl && !item.imageUrl.toLowerCase().endsWith(".svg"));
        })
        .catch(() => []);

      // 1b. Search Indonesian Wikipedia (Crucial for Indonesian characters and local references)
      const idWikiUrl = `https://id.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=12&prop=pageimages&piprop=thumbnail|original&pithumbsize=400&format=json&origin=*`;
      const idWikiPromise = fetch(idWikiUrl)
        .then((r) => r.json())
        .then((data) => {
          if (!data.query || !data.query.pages) return [];
          return Object.values(data.query.pages)
            .map((page: any) => ({
              name: page.title,
              imageUrl: page.original?.source || page.thumbnail?.source || "",
              source: "Wiki ID",
            }))
            .filter((item) => !!item.imageUrl && !item.imageUrl.toLowerCase().endsWith(".svg"));
        })
        .catch(() => []);

      // 1c. Search Malay Wikipedia (Excellent for Malaysian cartoon figures like Boboiboy, Upin Ipin)
      const msWikiUrl = `https://ms.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=12&prop=pageimages&piprop=thumbnail|original&pithumbsize=400&format=json&origin=*`;
      const msWikiPromise = fetch(msWikiUrl)
        .then((r) => r.json())
        .then((data) => {
          if (!data.query || !data.query.pages) return [];
          return Object.values(data.query.pages)
            .map((page: any) => ({
              name: page.title,
              imageUrl: page.original?.source || page.thumbnail?.source || "",
              source: "Wiki MS",
            }))
            .filter((item) => !!item.imageUrl && !item.imageUrl.toLowerCase().endsWith(".svg"));
        })
        .catch(() => []);

      // 2a. Search Wikimedia Commons files (Excellent for SpongeBob, cartoon figures, movie characters, specific objects)
      const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=15&prop=imageinfo&iiprop=url&format=json&origin=*`;
      const commonsPromise = fetch(commonsUrl)
        .then((r) => r.json())
        .then((data) => {
          if (!data.query || !data.query.pages) return [];
          return Object.values(data.query.pages)
            .map((page: any) => {
              const info = page.imageinfo?.[0];
              const title = page.title
                .replace(/^File:/i, "")
                .replace(/\.[a-z0-9]+$/i, "")
                .replace(/_/g, " ");
              return {
                name: title,
                imageUrl: info?.url || "",
                source: "Commons",
              };
            })
            .filter((item) => !!item.imageUrl && !item.imageUrl.toLowerCase().endsWith(".svg"));
          })
          .catch(() => []);

      // 2b. Search Commons with "png" or "transparent" for transparent cutout toppings
      const cutoutQuery = `${query} png`;
      const cutoutUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(cutoutQuery)}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&format=json&origin=*`;
      const cutoutPromise = fetch(cutoutUrl)
        .then((r) => r.json())
        .then((data) => {
          if (!data.query || !data.query.pages) return [];
          return Object.values(data.query.pages)
            .map((page: any) => {
              const info = page.imageinfo?.[0];
              const title = page.title
                .replace(/^File:/i, "")
                .replace(/\.[a-z0-9]+$/i, "")
                .replace(/_/g, " ");
              return {
                name: title,
                imageUrl: info?.url || "",
                source: "Commons PNG",
              };
            })
            .filter((item) => !!item.imageUrl && !item.imageUrl.toLowerCase().endsWith(".svg"));
        })
        .catch(() => []);

      // 3. Search MyAnimeList characters via Jikan (API for any anime/manga figures)
      const animeUrl = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=10`;
      const animePromise = fetch(animeUrl)
        .then((r) => r.json())
        .then((res) => {
          if (!res.data || !Array.isArray(res.data)) return [];
          return res.data
            .map((char: any) => ({
              name: char.name,
              imageUrl: char.images?.jpg?.image_url || "",
              source: "Anime",
            }))
            .filter((item) => !!item.imageUrl);
        })
        .catch(() => []);

      // 4. Search Kitsu API characters (Wide character catalog, works well for various cartoon/anime series)
      const kitsuUrl = `https://kitsu.io/api/edge/characters?filter[name]=${encodeURIComponent(query)}&page[limit]=10`;
      const kitsuPromise = fetch(kitsuUrl)
        .then((r) => r.json())
        .then((res) => {
          if (!res.data || !Array.isArray(res.data)) return [];
          return res.data
            .map((char: any) => ({
              name: char.attributes?.canonicalName || char.attributes?.name || "",
              imageUrl: char.attributes?.image?.original || char.attributes?.image?.medium || "",
              source: "Kitsu",
            }))
            .filter((item) => !!item.imageUrl && !!item.name);
        })
        .catch(() => []);

      // 5. Search Disney API characters
      const disneyUrl = `https://api.disneyapi.dev/character?name=${encodeURIComponent(query)}`;
      const disneyPromise = fetch(disneyUrl)
        .then((r) => r.json())
        .then((res) => {
          if (!res.data) return [];
          const items = Array.isArray(res.data) ? res.data : [res.data];
          return items
            .map((char: any) => ({
              name: char.name,
              imageUrl: char.imageUrl || "",
              source: "Disney",
            }))
            .filter((item) => !!item.imageUrl);
        })
        .catch(() => []);

      const [wikiResults, idWikiResults, msWikiResults, commonsResults, cutoutResults, animeResults, kitsuResults, disneyResults] = await Promise.all([
        wikiPromise,
        idWikiPromise,
        msWikiPromise,
        commonsPromise,
        cutoutPromise,
        animePromise,
        kitsuPromise,
        disneyPromise,
      ]);

      // Combine and remove duplicate image URLs
      const combined = [
        ...disneyResults,
        ...kitsuResults,
        ...animeResults,
        ...msWikiResults,
        ...idWikiResults,
        ...cutoutResults,
        ...commonsResults,
        ...wikiResults,
      ];
      
      const seenUrls = new Set<string>();
      const uniqueResults: SearchResult[] = [];

      for (const item of combined) {
        if (!item.imageUrl) continue;
        const normalizedUrl = item.imageUrl.split("?")[0].toLowerCase();
        if (!seenUrls.has(normalizedUrl)) {
          seenUrls.add(normalizedUrl);
          // Apply name cleaning
          const cleanedName = cleanToppingName(item.name, query);
          uniqueResults.push({
            ...item,
            name: cleanedName,
          });
        }
      }

      // Advanced Scoring & Relevance Ranking Algorithm:
      // - Higher score means more relevant, moving it to the top.
      // - Exact matches or starts-with query get significant bonuses.
      // - Regional Wikis (MS, ID) and character-specific DBs (Disney, Kitsu, Anime) score higher for fictional cartoon inputs.
      // - Dedicated transparent/PNG commons results are prioritized.
      // - Voice actors, dubbers, seiyuu, actors, and other non-character bios are heavily penalized (unless explicitly searched).
      const rawQ = query.trim().toLowerCase();
      const penaltyWords = [
        "voice actor", "dubber", "pengisi suara", "cast", "crew", "director", 
        "seiyuu", "seiyu", "actor", "actress", "biography", "filmography", "profile"
      ];
      const isQueryAskingForActor = penaltyWords.some(word => rawQ.includes(word));

      const scoredResults = uniqueResults.map((item) => {
        const nameLower = item.name.toLowerCase();
        let score = 0;

        // 1. Match type scoring
        if (nameLower === rawQ) {
          score += 600;
        } else if (nameLower.startsWith(rawQ)) {
          score += 400;
        } else if (nameLower.includes(rawQ)) {
          score += 200;
        }

        // 2. Source-specific preferences
        if (item.source === "Disney" || item.source === "Kitsu" || item.source === "Anime") {
          score += 150; // High probability of being a direct cartoon/anime character
        }
        if (item.source === "Wiki MS" || item.source === "Wiki ID") {
          score += 120; // Excellent for regional content like BoBoiBoy
        }
        if (item.source === "Commons PNG") {
          score += 100; // Transparent cutout assets are ideal for cake decorations
        }

        // 3. Penalty for voice actors / dubbers / biographies
        const containsPenaltyWord = penaltyWords.some(word => nameLower.includes(word));
        if (containsPenaltyWord && !isQueryAskingForActor) {
          score -= 500; // Drastic penalty to filter dubbers when looking for the actual character
        }

        // 4. Minor penalty for files containing raw extensions in name
        if (nameLower.includes("jpg") || nameLower.includes("png") || nameLower.includes("jpeg")) {
          score -= 30;
        }

        return { item, score };
      });

      // Sort by score (descending)
      scoredResults.sort((a, b) => b.score - a.score);

      setSearchResults(scoredResults.map((x) => x.item).slice(0, 24));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const addTopping = () => {
    if (!selectedTopping) return;
    const id = `${Date.now()}-${Math.random()}`;
    const newTopping: Topping = {
      id,
      name: selectedTopping.name,
      imageUrl: selectedTopping.imageUrl,
      rotate: Math.random() * 20 - 10, // random start tilt -10deg to 10deg
      stickHeight: 110, // default stick length in pixels
      scale: 1.0,
      x: 0,
      y: -30, // start slightly higher than center
    };
    setToppings((prev) => [...prev, newTopping]);
    setActiveToppingId(id); // Automatically select newly added sticker for immediate tuning
    setSelectedTopping(null);
  };

  const removeTopping = (id: string) => {
    setToppings((prev) => prev.filter((t) => t.id !== id));
    if (activeToppingId === id) {
      setActiveToppingId(null);
    }
  };

  const updateActiveTopping = (key: keyof Topping, value: number) => {
    if (!activeToppingId) return;
    setToppings((prev) =>
      prev.map((t) => (t.id === activeToppingId ? { ...t, [key]: value } : t))
    );
  };

  const activeTopping = toppings.find((t) => t.id === activeToppingId);

  return (
    <div className="relative flex flex-col items-center justify-center p-4 w-full max-w-2xl mx-auto select-none">
      
      {/* 1. Playful, Clean Header */}
      <div className="text-center mb-6">
        <h2 className="font-cute text-2xl font-bold text-brand-pink-deep">
          okey ika ini hearmeoutcake HAHAHA
        </h2>
      </div>

      {/* 2. Interactive Wish / Candle Banner */}
      <div className="min-h-[32px] flex items-center justify-center mb-4">
        <AnimatePresence mode="wait">
          {candlesLit ? (
            <motion.div
              key="blow"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-[11px] font-cute font-medium text-brand-pink-deep bg-brand-pink-light/60 border border-brand-pink-medium/20 px-4 py-1.5 rounded-full shadow-xs cursor-pointer hover:bg-brand-pink-light transition-all flex items-center gap-1.5 animate-pulse"
              onClick={blowCandle}
            >
              <span>🕯️ click the candle to blow it out!</span>
            </motion.div>
          ) : (
            <motion.div
              key="wish"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-[11px] font-cute font-bold text-brand-yellow-dark bg-brand-yellow-light/80 border border-brand-yellow-medium/40 px-4 py-1.5 rounded-full shadow-xs flex items-center gap-1.5"
            >
              <Sparkles size={12} className="text-brand-yellow-dark" />
              <span>Make a secret birthday wish, Ika! 🌷💖</span>
              <button
                onClick={resetCandle}
                className="text-[9px] underline text-brand-pink-deep ml-2 hover:text-brand-pink-dark cursor-pointer font-sans"
              >
                relight 🕯️
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. The Play Arena (whitespace and beautiful game board) */}
      <div 
        ref={arenaRef}
        className="relative w-full h-[380px] bg-slate-50/40 border border-dashed border-slate-200/60 rounded-3xl overflow-hidden shadow-xs flex flex-col items-center justify-end p-8 mb-8"
      >
        {/* Draggable Toppings Layer */}
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
          {toppings.map((t) => {
            const isActive = t.id === activeToppingId;
            return (
              <motion.div
                key={t.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 12 }}
                onPointerDown={(e) => handlePointerDown(e, t)}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "35%",
                  x: t.x,
                  y: t.y,
                  translateX: "-50%",
                  translateY: "-50%",
                  zIndex: isActive ? 100 : 50,
                }}
                className="pointer-events-auto cursor-grab active:cursor-grabbing flex flex-col items-center touch-none select-none"
              >
                {/* Visual Stick + Cutout Container */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveToppingId(t.id);
                  }}
                  className="flex flex-col items-center select-none"
                >
                  {/* The Polaroid Cutout Photo */}
                  <div
                    style={{
                      transform: `rotate(${t.rotate}deg) scale(${t.scale})`,
                      transition: "transform 0.15s ease-out",
                    }}
                    className={`relative bg-white p-1 rounded-lg border-2 shadow-md flex flex-col items-center max-w-[70px] ${
                      isActive ? "border-brand-pink-medium ring-2 ring-brand-pink-light" : "border-white"
                    }`}
                  >
                    <img
                      src={t.imageUrl}
                      alt={t.name}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="w-11 h-11 rounded-xs object-cover border border-slate-100"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1518895389-9b63a2a4a497?w=100&auto=format&fit=crop&q=60";
                      }}
                    />
                    <span className="text-[6px] font-sans font-bold text-slate-700 bg-white/95 px-1 mt-0.5 rounded-xs line-clamp-1 text-center w-full">
                      {t.name}
                    </span>
                    
                    {/* Tiny active selection marker */}
                    {isActive && (
                      <div className="absolute -top-1.5 -right-1.5 bg-brand-pink-medium text-white w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold">
                        ✓
                      </div>
                    )}
                  </div>

                  {/* The Wooden Stick */}
                  <div
                    style={{ height: `${t.stickHeight}px` }}
                    className="w-[3px] bg-amber-800/60 border-l border-amber-950/20 shadow-xs mx-auto transition-all"
                  />

                  {/* Little tactile shadow/needle tip */}
                  <div className="w-1.5 h-1 rounded-full bg-slate-800/35 blur-xs" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Centered Single Cake & Plate Stand */}
        <div className="relative flex flex-col items-center z-10 select-none pointer-events-none mt-auto">
          
          {/* Custom Natural Striped Birthday Candle centered on the cake */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              blowCandle();
            }}
            className="absolute bottom-[92px] left-1/2 -translate-x-1/2 z-20 cursor-pointer pointer-events-auto flex flex-col items-center justify-end"
            style={{ width: "40px", height: "120px" }}
          >
            {/* Candle Puff smoke when blown out (aligned beautifully above the wick tip) */}
            <AnimatePresence>
              {!candlesLit && (
                <motion.div
                  initial={{ opacity: 1, scale: 0.4, y: -5 }}
                  animate={{ opacity: 0, scale: 1.4, y: -25 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute text-base pointer-events-none"
                  style={{ left: "0", right: "0", textAlign: "center", bottom: "88px" }}
                >
                  💨
                </motion.div>
              )}
            </AnimatePresence>

            {/* Beautiful Natural Striped Candle SVG */}
            <svg viewBox="0 0 40 120" className="h-full w-full overflow-visible pointer-events-none">
              <defs>
                {/* Clip path for the cylindrical candle body */}
                <clipPath id="candleBodyClip">
                  <path d="M 15 44 Q 20 42 25 44 L 25 120 L 15 120 Z" />
                </clipPath>

                {/* Main wax base color - lovely strawberry pink pastel */}
                <linearGradient id="waxBase" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FDA4AF" /> {/* rose-300 */}
                  <stop offset="50%" stopColor="#FECDD3" /> {/* rose-200 */}
                  <stop offset="100%" stopColor="#F43F5E" /> {/* rose-500 */}
                </linearGradient>

                {/* Stripes - soft creamy white */}
                <linearGradient id="creamStripe" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFF1F2" />
                  <stop offset="100%" stopColor="#FFE4E6" />
                </linearGradient>

                {/* 3D Cylindrical Shading Overlay */}
                <linearGradient id="cylinderShading" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(0,0,0,0.25)" />
                  <stop offset="30%" stopColor="rgba(255,255,255,0.3)" />
                  <stop offset="70%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
                </linearGradient>

                {/* Melted Wax highlight on top */}
                <radialGradient id="waxPool" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="70%" stopColor="#FFE4E6" />
                  <stop offset="100%" stopColor="#FDA4AF" />
                </radialGradient>

                {/* Flame gradients & glow */}
                <linearGradient id="outerFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#FF4500" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#FFA500" />
                  <stop offset="100%" stopColor="#FFE4B5" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="innerFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#FF8C00" />
                  <stop offset="60%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFFFE0" />
                </linearGradient>
                <filter id="flameGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* The Candle Body */}
              {/* Base wax */}
              <rect x="15" y="42" width="10" height="78" fill="url(#waxBase)" clipPath="url(#candleBodyClip)" />

              {/* Elegant Spiral Stripes */}
              <g clipPath="url(#candleBodyClip)">
                <path d="M 10 38 L 30 53 L 30 61 L 10 46 Z" fill="url(#creamStripe)" />
                <path d="M 10 56 L 30 71 L 30 79 L 10 64 Z" fill="url(#creamStripe)" />
                <path d="M 10 74 L 30 89 L 30 97 L 10 82 Z" fill="url(#creamStripe)" />
                <path d="M 10 92 L 30 107 L 30 115 L 10 100 Z" fill="url(#creamStripe)" />
                <path d="M 10 110 L 30 125 L 30 133 L 10 118 Z" fill="url(#creamStripe)" />
              </g>

              {/* 3D Cylinder Shading Overlay */}
              <rect x="15" y="42" width="10" height="78" fill="url(#cylinderShading)" clipPath="url(#candleBodyClip)" />

              {/* Melted Wax Pool Lip (Top curve) */}
              <ellipse cx="20" cy="44" rx="5" ry="1.5" fill="url(#waxPool)" stroke="#F43F5E" strokeWidth="0.5" />

              {/* Candle Wick - real cotton wick */}
              <line x1="20" y1="44" x2="20" y2="32" stroke="#2D1E10" strokeWidth="2" strokeLinecap="round" />
              {/* Little glowing ember at the very tip of the wick */}
              {candlesLit && (
                <circle cx="20" cy="32" r="1" fill="#FF5A00" className="animate-pulse" />
              )}

              {/* Flickering SVG Flame (Centers perfectly on the wick (20, 32) at any scale or zoom!) */}
              {candlesLit && (
                <motion.g
                  key="svgFlame"
                  animate={{
                    scaleX: [1, 1.15, 0.9, 1.05, 1],
                    scaleY: [1, 1.08, 0.95, 1.03, 1],
                    skewX: [0, -3, 3, -1, 0],
                    translateY: [0, -1, 0.5, -0.5, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.65,
                    ease: "easeInOut"
                  }}
                  style={{
                    transformOrigin: "20px 32px" // Center of flame bottom
                  }}
                >
                  {/* Outer Flame (Orange) */}
                  <path
                    d="M 20 32 C 14 32, 11 22, 20 5 C 29 22, 26 32, 20 32 Z"
                    fill="url(#outerFlameGrad)"
                    filter="url(#flameGlow)"
                  />
                  {/* Inner Flame (Amber/Yellow) */}
                  <path
                    d="M 20 32 C 16.5 32, 14.5 24, 20 10 C 25.5 24, 23.5 32, 20 32 Z"
                    fill="url(#innerFlameGrad)"
                  />
                  {/* Core Flame (White-Yellow highlight) */}
                  <path
                    d="M 20 32 C 18 32, 17 26, 20 16 C 23 26, 22 32, 20 32 Z"
                    fill="#FFFEE6"
                    opacity="0.95"
                  />
                </motion.g>
              )}
            </svg>
          </div>

          {/* Luxurious Frosted White Birthday Cake */}
          <div className="relative w-56 h-28 flex flex-col justify-end overflow-visible">
            
            {/* Top Surface (Pure Ivory/Cream Frosting with radial shading and dimensional depth) */}
            <div 
              style={{
                background: "radial-gradient(circle at 50% 35%, #FFFFFF 15%, #FAF9F6 55%, #F4F0E6 85%, #E3DDD2 100%)",
              }}
              className="absolute top-0 w-full h-12 rounded-[50%] border border-[#E3DCD2] z-10 shadow-inner flex items-center justify-center overflow-visible"
            >
              {/* Cozy Warm Glow from the candle flame */}
              {candlesLit && (
                <div 
                  style={{
                    background: "radial-gradient(circle at 50% 35%, rgba(251, 146, 60, 0.28) 0%, rgba(251, 146, 60, 0) 75%)",
                  }}
                  className="absolute inset-0 rounded-[50%] pointer-events-none mix-blend-color-burn animate-pulse"
                />
              )}

              {/* Beautiful Whipped Cream Frosting Swirls (Dollops) spaced in a loop along the cake perimeter */}
              <div className="absolute inset-[3px] pointer-events-none rounded-[50%] overflow-visible">
                {[
                  { left: "10%", top: "45%" },
                  { left: "15%", top: "20%" },
                  { left: "30%", top: "8%" },
                  { left: "50%", top: "4%" },
                  { left: "70%", top: "8%" },
                  { left: "85%", top: "20%" },
                  { left: "90%", top: "45%" },
                  { left: "85%", top: "70%" },
                  { left: "70%", top: "86%" },
                  { left: "50%", top: "92%" },
                  { left: "30%", top: "86%" },
                  { left: "15%", top: "70%" }
                ].map((pos, idx) => (
                  <div 
                    key={idx}
                    style={{ left: pos.left, top: pos.top }} 
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <svg width="18" height="18" viewBox="0 0 100 100" className="overflow-visible filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.15)]">
                      <defs>
                        <radialGradient id={`dollopGrad-${idx}`} cx="40%" cy="35%" r="60%">
                          <stop offset="0%" stopColor="#FFFFFF" />
                          <stop offset="60%" stopColor="#FAF7F0" />
                          <stop offset="100%" stopColor="#D5CBB9" />
                        </radialGradient>
                      </defs>
                      <path 
                        d="M 50 15 
                           C 53 35, 68 32, 65 45 
                           C 63 55, 80 50, 75 65 
                           C 70 80, 50 75, 50 85 
                           C 50 75, 30 80, 25 65 
                           C 20 50, 37 55, 35 45 
                           C 32 32, 47 35, 50 15 Z" 
                        fill={`url(#dollopGrad-${idx})`} 
                      />
                      <path d="M 50 15 Q 52 45, 58 65" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                      <path d="M 50 15 Q 48 45, 42 65" fill="none" stroke="#E6DDD0" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                      <path d="M 50 15 Q 60 40, 70 58" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                      <path d="M 50 15 Q 40 40, 30 58" fill="none" stroke="#E6DDD0" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                    </svg>
                  </div>
                ))}
              </div>

              {/* Fresh Organic Berries Garnish & Herbs on Top of Cake */}
              <div className="absolute inset-0 pointer-events-none overflow-visible z-10">
                <svg viewBox="0 0 224 48" className="w-full h-full overflow-visible">
                  <defs>
                    {/* Gradients for juicy fruits */}
                    <linearGradient id="strawberryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF4D6D" />
                      <stop offset="40%" stopColor="#E0115F" />
                      <stop offset="100%" stopColor="#800020" />
                    </linearGradient>
                    <linearGradient id="strawberryCore" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFF0F5" />
                      <stop offset="60%" stopColor="#FFB3C1" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                    <radialGradient id="blueberryGrad1" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#6C7ECB" />
                      <stop offset="50%" stopColor="#2F3E75" />
                      <stop offset="100%" stopColor="#10152B" />
                    </radialGradient>
                    <radialGradient id="blueberryGrad2" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#5E6FA3" />
                      <stop offset="50%" stopColor="#242F59" />
                      <stop offset="100%" stopColor="#0B0E1C" />
                    </radialGradient>
                    <radialGradient id="cherryGrad" cx="35%" cy="25%" r="65%">
                      <stop offset="0%" stopColor="#FF4D4D" />
                      <stop offset="30%" stopColor="#D60000" />
                      <stop offset="85%" stopColor="#7A0000" />
                      <stop offset="100%" stopColor="#3B0000" />
                    </radialGradient>
                    <linearGradient id="mintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#52B788" />
                      <stop offset="50%" stopColor="#2D6A4F" />
                      <stop offset="100%" stopColor="#1B4332" />
                    </linearGradient>
                    <linearGradient id="mintGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#74C69D" />
                      <stop offset="100%" stopColor="#40916C" />
                    </linearGradient>
                    <linearGradient id="chocolateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4E2F1D" />
                      <stop offset="50%" stopColor="#643E26" />
                      <stop offset="100%" stopColor="#301B0F" />
                    </linearGradient>
                    <filter id="fruitShadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="1.5" stdDeviation="0.8" floodOpacity="0.25" />
                    </filter>
                  </defs>

                  {/* LEFT FRUIT CLUSTER (Strawberry slice, Blueberries, Mint leaves) */}
                  <g filter="url(#fruitShadow)">
                    {/* Mint Leaves behind the strawberry */}
                    <path d="M 46 16 C 36 10, 26 14, 28 22 C 32 26, 42 22, 46 16 Z" fill="url(#mintGrad)" />
                    <path d="M 46 16 C 38 12, 32 16, 28 22" fill="none" stroke="#74C69D" strokeWidth="0.5" opacity="0.6" />
                    
                    <path d="M 48 20 C 44 26, 36 30, 38 34 C 42 36, 48 30, 48 20 Z" fill="url(#mintGradLight)" transform="rotate(-15 48 20)" />

                    {/* Exquisite Strawberry slice */}
                    <path d="M 48 10 C 58 10, 64 20, 58 32 C 54 38, 48 40, 44 34 C 38 24, 42 10, 48 10 Z" fill="url(#strawberryGrad)" />
                    {/* Inner core flesh pattern */}
                    <path d="M 48 15 C 53 15, 56 22, 53 28 C 51 31, 48 32, 46 29 C 43 23, 45 15, 48 15 Z" fill="url(#strawberryCore)" opacity="0.85" />
                    {/* Radial core lines (starburst) */}
                    <path d="M 48 22 L 46 18 M 48 22 L 51 17 M 48 22 L 53 20 M 48 22 L 52 25 M 48 22 L 50 28 M 48 22 L 46 27 M 48 22 L 44 24 M 48 22 L 44 20" fill="none" stroke="#FFF" strokeWidth="0.65" opacity="0.75" />
                    {/* Strawberry Seeds */}
                    <circle cx="41" cy="20" r="0.6" fill="#FEE440" />
                    <circle cx="43" cy="15" r="0.6" fill="#FEE440" />
                    <circle cx="53" cy="14" r="0.6" fill="#FEE440" />
                    <circle cx="55" cy="21" r="0.6" fill="#FEE440" />
                    <circle cx="54" cy="28" r="0.6" fill="#FEE440" />
                    <circle cx="49" cy="33" r="0.6" fill="#FEE440" />
                    <circle cx="44" cy="27" r="0.6" fill="#FEE440" />

                    {/* Plump Glazed Blueberries */}
                    <circle cx="62" cy="16" r="4.5" fill="url(#blueberryGrad1)" />
                    <circle cx="61.2" cy="15" r="1" fill="#8EA1E6" opacity="0.45" filter="blur(0.5px)" /> {/* Soft reflection shine */}

                    <circle cx="56" cy="24" r="3.8" fill="url(#blueberryGrad2)" />
                    <circle cx="55.2" cy="23" r="0.8" fill="#8EA1E6" opacity="0.4" filter="blur(0.5px)" />
                  </g>

                  {/* RIGHT FRUIT CLUSTER (Glossy Cherry, Blueberries, Mint leaves) */}
                  <g filter="url(#fruitShadow)">
                    {/* Mint Leaves */}
                    <path d="M 172 14 C 182 8, 192 12, 190 20 C 186 24, 176 20, 172 14 Z" fill="url(#mintGrad)" />
                    <path d="M 172 14 C 180 10, 186 14, 190 20" fill="none" stroke="#74C69D" strokeWidth="0.5" opacity="0.6" />

                    {/* Plump Glazed Blueberries */}
                    <circle cx="164" cy="23" r="4" fill="url(#blueberryGrad1)" />
                    <circle cx="163" cy="22" r="0.9" fill="#8EA1E6" opacity="0.45" filter="blur(0.5px)" />

                    <circle cx="170" cy="27" r="3.5" fill="url(#blueberryGrad2)" />
                    <circle cx="169.2" cy="26" r="0.7" fill="#8EA1E6" opacity="0.4" filter="blur(0.5px)" />

                    {/* Glossy Cherry */}
                    <circle cx="178" cy="18" r="6.5" fill="url(#cherryGrad)" />
                    {/* Cherry Highlight */}
                    <ellipse cx="175.5" cy="15" rx="1.8" ry="1.2" fill="#FFF" opacity="0.8" transform="rotate(-30 175.5 15)" />
                    {/* Cherry Stem */}
                    <path d="M 178 14 Q 183 2, 190 -2" fill="none" stroke="#543D2B" strokeWidth="1" strokeLinecap="round" />
                  </g>

                  {/* BACK SCATTER (Shaved Chocolate Curls, Gold Sprinkles) */}
                  <g>
                    {/* Chocolate Curls (elegant ribbons) */}
                    <path d="M 100 12 C 104 10, 108 12, 110 15 C 108 17, 104 15, 101 16" fill="none" stroke="url(#chocolateGrad)" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M 122 14 C 126 12, 130 14, 132 17 C 130 19, 126 17, 123 18" fill="none" stroke="url(#chocolateGrad)" strokeWidth="1.8" strokeLinecap="round" />

                    {/* Premium White Pearls & Luxury Gold Sprinkles scattered around */}
                    <ellipse cx="85" cy="13" rx="1.5" ry="0.8" fill="#F4D35E" transform="rotate(25 85 13)" />
                    <ellipse cx="140" cy="15" rx="1.5" ry="0.8" fill="#F4D35E" transform="rotate(-35 140 15)" />
                    <ellipse cx="112" cy="28" rx="1.2" ry="0.6" fill="#F4D35E" transform="rotate(15 112 28)" />
                    <ellipse cx="132" cy="26" rx="1.2" ry="0.6" fill="#F4D35E" transform="rotate(-15 132 26)" />

                    {/* White Pearls with soft drop shadows */}
                    <circle cx="75" cy="20" r="1.2" fill="#FFF" filter="url(#fruitShadow)" />
                    <circle cx="92" cy="25" r="1" fill="#FFF" filter="url(#fruitShadow)" />
                    <circle cx="148" cy="21" r="1.2" fill="#FFF" filter="url(#fruitShadow)" />
                    <circle cx="102" cy="27" r="1" fill="#FFF" filter="url(#fruitShadow)" />
                    <circle cx="112" cy="8" r="1" fill="#FFF" filter="url(#fruitShadow)" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Cohesive 3D Curved Buttercream Side Wall & Dripping White Chocolate Ganache */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
              <svg viewBox="0 0 224 112" className="w-full h-full overflow-visible">
                <defs>
                  {/* Luxurious scraped ivory buttercream gradient */}
                  <linearGradient id="buttercreamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D3CABB" />
                    <stop offset="15%" stopColor="#EBE5D9" />
                    <stop offset="50%" stopColor="#FFFFFF" />
                    <stop offset="85%" stopColor="#E5DEC9" />
                    <stop offset="100%" stopColor="#C9C0AF" />
                  </linearGradient>
                  {/* Glossy White Chocolate Ganache drip gradient */}
                  <linearGradient id="ganacheGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="70%" stopColor="#FAFAF7" />
                    <stop offset="100%" stopColor="#EAE5D9" />
                  </linearGradient>
                  {/* Soft Drop Shadow for realistic depth */}
                  <filter id="dripShadow" x="-10%" y="-10%" width="120%" height="130%">
                    <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#2E2312" floodOpacity="0.12" />
                  </filter>
                </defs>

                {/* 1. Cake Buttercream Side Wall Cylinder (Curves down perfectly at the bottom) */}
                <path 
                  d="M 0 24 A 112 24 0 0 0 224 24 L 224 88 A 112 24 0 0 1 0 88 Z" 
                  fill="url(#buttercreamGrad)" 
                />

                {/* Elegant horizontal scraped grooved frosting lines */}
                <path d="M 0 42 A 112 24 0 0 0 224 42" fill="none" stroke="#E1D9CC" strokeWidth="1.5" opacity="0.45" />
                <path d="M 0 42 A 112 24 0 0 0 224 42" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" transform="translate(0, 0.8)" />

                <path d="M 0 58 A 112 24 0 0 0 224 58" fill="none" stroke="#E1D9CC" strokeWidth="1.5" opacity="0.5" />
                <path d="M 0 58 A 112 24 0 0 0 224 58" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" transform="translate(0, 0.8)" />

                <path d="M 0 74 A 112 24 0 0 0 224 74" fill="none" stroke="#E1D9CC" strokeWidth="1.5" opacity="0.45" />
                <path d="M 0 74 A 112 24 0 0 0 224 74" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" transform="translate(0, 0.8)" />

                {/* 2. Dripping White Ganache Frosting (Perfect curved waves & beautiful organic hanging drips) */}
                <path 
                  d="M 0 24 
                     A 112 24 0 0 0 224 24
                     L 224 26
                     C 220 29, 218 33, 214 33
                     C 210 33, 204 36, 198 37
                     C 192 38, 190 51, 186 51
                     C 182 51, 180 40, 175 40
                     C 170 40, 164 37, 158 38
                     C 152 39, 150 47, 146 47
                     C 142 47, 140 39, 135 39
                     C 130 39, 124 37, 118 38
                     C 112 39, 110 53, 106 53
                     C 102 53, 100 37, 95 37
                     C 90 37, 84 34, 78 35
                     C 72 36, 70 49, 66 49
                     C 62 49, 60 34, 55 34
                     C 50 34, 45 31, 40 32
                     C 36 33, 34 45, 30 45
                     C 26 45, 24 31, 20 31
                     C 15 31, 10 27, 0 25
                     Z"
                  fill="url(#ganacheGrad)"
                  filter="url(#dripShadow)"
                />

                {/* Glossy Highlights on major drip tips */}
                <ellipse cx="30" cy="42" rx="1" ry="2.5" fill="#FFFFFF" opacity="0.75" transform="rotate(-10 30 42)" />
                <ellipse cx="66" cy="46" rx="1.2" ry="3" fill="#FFFFFF" opacity="0.75" transform="rotate(-10 66 46)" />
                <ellipse cx="106" cy="50" rx="1.2" ry="3" fill="#FFFFFF" opacity="0.8" transform="rotate(-10 106 50)" />
                <ellipse cx="146" cy="44" rx="1" ry="2.5" fill="#FFFFFF" opacity="0.75" transform="rotate(-10 146 44)" />
                <ellipse cx="186" cy="48" rx="1.2" ry="3" fill="#FFFFFF" opacity="0.75" transform="rotate(-10 186 48)" />
              </svg>
            </div>

            {/* Natural Rustic Wood Log Slice Platter / Serving Stand */}
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[252px] h-6 z-[-1] pointer-events-none">
              {/* Top Face of Wood Log showing tree rings */}
              <div 
                style={{
                  background: "radial-gradient(ellipse at 50% 50%, #E8C6A3 10%, #D4AF87 45%, #C29A72 70%, #9F754D 90%, #5B4025 100%)",
                }}
                className="w-full h-4 rounded-full border border-[#8A5F35] shadow-[0_2px_4px_rgba(0,0,0,0.15)] relative overflow-hidden"
              >
                {/* Fine concentric rings lines */}
                <div className="absolute inset-[3px] border border-[#A7784E]/25 rounded-full" />
                <div className="absolute inset-[9px] border border-[#A7784E]/20 rounded-full" />
                <div className="absolute inset-[18px] border border-[#A7784E]/15 rounded-full" />
              </div>
              {/* Bark Edge of the Wood Slab with rich brown/charcoal texture */}
              <div className="w-[250px] h-3.5 bg-gradient-to-b from-[#5B4025] to-[#2E1F11] rounded-b-xl -mt-2 mx-auto border-x border-[#1F140A] shadow-[0_6px_14px_rgba(0,0,0,0.35)]" />
            </div>
          </div>

        </div>

      </div>

      {/* 4. Draggable Topping Config Slider Box (Only appears when a sticker is active!) */}
      <AnimatePresence>
        {activeTopping && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="w-full max-w-sm bg-white/95 border-2 border-brand-pink-medium p-4 rounded-3xl shadow-md mb-6 flex flex-col gap-3 relative z-40"
          >
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <img
                  src={activeTopping.imageUrl}
                  alt={activeTopping.name}
                  className="w-7 h-7 rounded-md object-cover border border-slate-200"
                />
                <span className="font-cute text-xs font-bold text-brand-pink-deep max-w-[150px] truncate">
                  {activeTopping.name}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeTopping(activeTopping.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer"
                  title="Remove from cake"
                >
                  <Trash2 size={13} />
                </button>
                <button
                  onClick={() => setActiveToppingId(null)}
                  className="font-cute text-[10px] font-bold text-brand-pink-dark hover:text-brand-pink-deep px-2.5 py-1 bg-brand-pink-light/60 rounded-full transition-all"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Multi-Sliders */}
            <div className="flex flex-col gap-2.5 text-[10px]">
              {/* Stick Length */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500 font-medium w-16 text-left">📏 stick length</span>
                <input
                  type="range"
                  min="40"
                  max="190"
                  value={activeTopping.stickHeight}
                  onChange={(e) => updateActiveTopping("stickHeight", parseInt(e.target.value))}
                  className="flex-1 accent-brand-pink-medium cursor-pointer h-1 rounded-lg bg-slate-100"
                />
                <span className="text-slate-400 font-mono w-8 text-right">{activeTopping.stickHeight}px</span>
              </div>

              {/* Rotation Tilt */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500 font-medium w-16 text-left">🔄 tilt angle</span>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={activeTopping.rotate}
                  onChange={(e) => updateActiveTopping("rotate", parseInt(e.target.value))}
                  className="flex-1 accent-brand-pink-medium cursor-pointer h-1 rounded-lg bg-slate-100"
                />
                <span className="text-slate-400 font-mono w-8 text-right">{activeTopping.rotate}°</span>
              </div>

              {/* Scale Size */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500 font-medium w-16 text-left">🔎 sticker size</span>
                <input
                  type="range"
                  min="6"
                  max="16"
                  step="1"
                  value={Math.round(activeTopping.scale * 10)}
                  onChange={(e) => updateActiveTopping("scale", parseInt(e.target.value) / 10)}
                  className="flex-1 accent-brand-pink-medium cursor-pointer h-1 rounded-lg bg-slate-100"
                />
                <span className="text-slate-400 font-mono w-8 text-right">{Math.round(activeTopping.scale * 100)}%</span>
              </div>
            </div>

            <p className="text-[9px] text-gray-400 text-center italic mt-1 font-sans">
              💡 you can drag the image directly on the board to move it!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Minimal Search Bar */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3 relative z-20">
        
        {/* Search input and button */}
        <div className="flex gap-1.5 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="search your hear me out…"
            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-brand-pink-medium focus:bg-white transition-all"
          />
          <button
            onClick={() => handleSearch(searchQuery)}
            disabled={isSearching}
            className="bg-brand-pink-medium hover:bg-brand-pink-dark text-white font-cute text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSearching ? <RefreshCw size={11} className="animate-spin" /> : <Search size={11} />}
            <span>Search</span>
          </button>
        </div>

        {/* 6. Minimal Horizontal Search Results or Loading/Not-Found Indicators */}
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="searching"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-100 pt-3 flex flex-col items-center justify-center py-4 gap-2 text-slate-400"
            >
              <RefreshCw size={14} className="animate-spin text-brand-pink-medium" />
              <span className="text-[10px] font-sans">searching characters, cartoons, films & objects...</span>
            </motion.div>
          ) : hasSearched && searchResults.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-100 pt-3"
            >
              <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-3 text-left flex items-start gap-2.5">
                <span className="text-sm mt-0.5">👀</span>
                <div className="flex-1">
                  <h4 className="text-[10px] font-bold text-amber-800 font-sans">No "hear me out" matching found</h4>
                  <p className="text-[9px] text-amber-700/80 mt-0.5 leading-relaxed font-sans">
                    We searched characters, cartoons, films, objects, anime, and Wikipedia, but couldn't find any image. Try typing something simpler or check spelling!
                  </p>
                </div>
              </div>
            </motion.div>
          ) : searchResults.length > 0 ? (
            <motion.div
              key="results"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                <span className="text-[9px] font-cute text-slate-400 font-bold uppercase tracking-wider block">
                  Click to select:
                </span>
                
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {searchResults.map((result, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedTopping(result)}
                      className={`flex-shrink-0 flex items-center gap-2 p-1.5 rounded-xl border cursor-pointer transition-all ${
                        selectedTopping?.name === result.name
                          ? "bg-brand-pink-light/80 border-brand-pink-medium"
                          : "bg-slate-50/60 border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={result.imageUrl}
                        alt={result.name}
                        className="w-8 h-8 rounded-lg object-cover border border-white shadow-xs"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1518895389-9b63a2a4a497?w=100&auto=format&fit=crop&q=60";
                        }}
                      />
                      <div className="flex flex-col text-left pr-1">
                        <span className="text-[9px] font-sans font-bold text-slate-700 max-w-[75px] truncate leading-tight">
                          {result.name}
                        </span>
                        <span className="text-[6.5px] font-sans text-slate-400">
                          {result.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* 7. Beautiful Preview & Action Button */}
        <AnimatePresence>
          {selectedTopping && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedTopping.imageUrl}
                    alt={selectedTopping.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                  />
                  <div className="text-left">
                    <p className="text-[8px] text-slate-400 uppercase tracking-wide">Ready to stick:</p>
                    <p className="text-xs font-cute font-bold text-brand-pink-deep leading-tight">{selectedTopping.name}</p>
                  </div>
                </div>

                <button
                  onClick={addTopping}
                  className="bg-brand-pink-medium hover:bg-brand-pink-dark text-white text-[11px] font-cute font-bold px-4 py-2 rounded-xl cursor-pointer shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>put it on the cake 🎂</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
