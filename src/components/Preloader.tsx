import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IMAGES_TO_PRELOAD = [
  '/Image_1.jpg',
  '/sobre_cerrado2.png',
  '/sobre_abriendo_4.png',
  '/sello2.png',
  '/fondo_papel.png',
  '/papael_completo.png',
];

const VIDEO_TO_PRELOAD = '/sobre_apertura.mp4';

export default function Preloader({ onLoaded }: { onLoaded: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let loaded = 0;
    const totalAssets = IMAGES_TO_PRELOAD.length + 1; // +1 for video

    const checkDone = () => {
      loaded++;
      setProgress((loaded / totalAssets) * 100);
      if (loaded === totalAssets) {
        setTimeout(onLoaded, 500);
      }
    };

    // Preload images
    IMAGES_TO_PRELOAD.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = checkDone;
      img.onerror = checkDone;
    });

    // Preload video
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    
    let videoResolved = false;
    const resolveVideo = () => {
      if (!videoResolved) {
        videoResolved = true;
        checkDone();
      }
    };

    video.oncanplaythrough = resolveVideo;
    video.onloadeddata = resolveVideo;
    video.onerror = resolveVideo;
    video.src = VIDEO_TO_PRELOAD;

    // Fallback de seguridad para iOS (Ahorro de batería bloquea el preload)
    setTimeout(resolveVideo, 3000);
  }, [onLoaded]);

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Wax seal spinner */}
        <div className="relative w-20 h-20 mb-8">
          <div 
            className="w-full h-full rounded-full border-4 border-[#C49550]/20 border-t-[#C49550] animate-spin"
          />
          <span className="absolute inset-0 flex items-center justify-center font-serif text-lg text-[#2C3525]">
            H&A
          </span>
        </div>
        <p className="font-serif text-primary tracking-widest text-sm uppercase">
          Preparando invitación...
        </p>
        <div className="w-48 h-1 bg-[#C49550]/20 rounded-full mt-4 overflow-hidden">
          <motion.div 
            className="h-full bg-[#C49550] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
