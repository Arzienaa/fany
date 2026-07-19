import { useState, useEffect, useRef } from "react";
import { Music, Music2 } from "lucide-react";

// Happy Birthday Notes in C Major: [frequency, duration in seconds]
const BIRTHDAY_MELODY = [
  [392.00, 0.4], // G4
  [392.00, 0.4], // G4
  [440.00, 0.8], // A4
  [392.00, 0.8], // G4
  [523.25, 0.8], // C5
  [493.88, 1.2], // B4
  
  [392.00, 0.4], // G4
  [392.00, 0.4], // G4
  [440.00, 0.8], // A4
  [392.00, 0.8], // G4
  [587.33, 0.8], // D5
  [523.25, 1.2], // C5
  
  [392.00, 0.4], // G4
  [392.00, 0.4], // G4
  [783.99, 0.8], // G5
  [659.25, 0.8], // E5
  [523.25, 0.8], // C5
  [493.88, 0.8], // B4
  [440.00, 1.2], // A4
  
  [698.46, 0.4], // F5
  [698.46, 0.4], // F5
  [659.25, 0.8], // E5
  [523.25, 0.8], // C5
  [587.33, 0.8], // D5
  [523.25, 1.6], // C5
];

interface AudioPlayerProps {
  autoPlayTrigger?: boolean;
}

export default function AudioPlayer({ autoPlayTrigger = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playTimeoutRef = useRef<number | null>(null);
  const currentNoteIndexRef = useRef<number>(0);
  const isStoppingRef = useRef<boolean>(false);

  // Initialize Audio Context lazily
  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
  };

  const playMusicBoxChime = (freq: number, duration: number, startTime: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Create a beautiful music box sound using dual oscillators (Fundamental + High harmonic for tinkling sound)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Soft chime-like waveforms
    osc1.type = "sine";
    osc2.type = "sine"; // Harmonic

    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq * 2, startTime); // Octave harmonic for tinkling music box effect

    // Volume Envelope for Music Box (instant attack, gentle decay/exponential release)
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.02); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Long tinkle decay

    // Connect them
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Play
    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  };

  const playNextNote = () => {
    if (isStoppingRef.current || !audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const index = currentNoteIndexRef.current;
    const [freq, duration] = BIRTHDAY_MELODY[index];
    const now = ctx.currentTime;

    playMusicBoxChime(freq, duration, now);

    // Calculate time to next note (duration + tiny pause for distinct separation)
    const nextTimeMs = (duration + 0.1) * 1000;

    currentNoteIndexRef.current = (index + 1) % BIRTHDAY_MELODY.length;

    playTimeoutRef.current = window.setTimeout(() => {
      playNextNote();
    }, nextTimeMs);
  };

  const stopMusic = () => {
    isStoppingRef.current = true;
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
    setIsPlaying(false);
  };

  const startMusic = () => {
    initAudioContext();
    isStoppingRef.current = false;
    setIsPlaying(true);
    playNextNote();
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  };

  // Trigger autoplay when transitioning
  useEffect(() => {
    if (autoPlayTrigger && !isPlaying) {
      // Delay slightly for smooth transition feel
      const t = setTimeout(() => {
        startMusic();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [autoPlayTrigger]);

  // Clean up
  useEffect(() => {
    return () => {
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
    };
  }, []);

  return null; // Headless player - plays automatically without showing any UI button as requested
}
