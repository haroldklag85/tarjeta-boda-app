import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import html2canvas from 'html2canvas';

interface NostalgicLetterProps {
  message: string;
  onClose: () => void;
}

export default function NostalgicLetter({ message, onClose }: NostalgicLetterProps) {
  const letterRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Play the paper unfold sound
    const audio = new Audio('/papel.mp3');
    audio.volume = 0.6;
    audio.play().catch((err) => {
      console.warn('Autoplay of paper sound was blocked:', err);
    });
  }, []);

  const handleDownload = async () => {
    if (!letterRef.current || downloading) return;
    
    setDownloading(true);
    try {
      // Find and temporarily hide action buttons during capture
      const actionButtons = letterRef.current.querySelector('.action-buttons') as HTMLElement;
      const closeBtn = letterRef.current.querySelector('.close-btn') as HTMLElement;
      
      if (actionButtons) actionButtons.style.opacity = '0';
      if (closeBtn) closeBtn.style.opacity = '0';

      const canvas = await html2canvas(letterRef.current, {
        useCORS: true,
        scale: 2.5, // High resolution capture
        backgroundColor: '#f5efe6',
        logging: false,
        onclone: (clonedDoc) => {
          // Additional cleanup on cloned element if needed
          const clonedButtons = clonedDoc.querySelector('.action-buttons') as HTMLElement;
          const clonedClose = clonedDoc.querySelector('.close-btn') as HTMLElement;
          if (clonedButtons) clonedButtons.style.display = 'none';
          if (clonedClose) clonedClose.style.display = 'none';
        }
      });

      // Restore button visibility
      if (actionButtons) actionButtons.style.opacity = '1';
      if (closeBtn) closeBtn.style.opacity = '1';

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'nuestra_carta_de_boda.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exporting nostalgic letter:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 w-full h-full bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[999] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 3D Paper Unfolding Container */}
      <motion.div
        ref={letterRef}
        className="relative w-full max-w-[350px] sm:max-w-md bg-[#f5efe6] rounded shadow-[0_15px_50px_rgba(0,0,0,0.3)] border border-[#e8dfcf] p-8 pb-12 overflow-hidden flex flex-col justify-between"
        style={{
          boxShadow: '0 15px 50px rgba(0,0,0,0.3), inset 0 0 40px rgba(139, 90, 43, 0.1)',
          backgroundImage: 'radial-gradient(circle, transparent 20%, #f5efe6 20%, #f5efe6 80%, rgba(220, 205, 180, 0.15) 100%)',
          perspective: 1000,
          transformStyle: 'preserve-3d'
        }}
        initial={{ opacity: 0, rotateX: 65, scale: 0.85, y: 80 }}
        animate={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
        exit={{ opacity: 0, rotateX: -45, scale: 0.9, y: -50 }}
        transition={{ type: 'spring', stiffness: 90, damping: 14, duration: 1 }}
      >
        {/* Retro Postal Cancel Mark & Stamp */}
        <div className="absolute top-4 right-4 flex items-center gap-3 pointer-events-none select-none opacity-85 z-10">
          {/* Cancel Mark (Circular ink lines) */}
          <div className="relative w-16 h-16 border border-[#2e2621]/30 rounded-full flex items-center justify-center rotate-12">
            <div className="absolute inset-2 border border-dashed border-[#2e2621]/30 rounded-full" />
            <span className="font-serif text-[7px] text-[#2e2621]/40 uppercase tracking-widest text-center">
              CORREO AÉREO<br />1996
            </span>
            <div className="absolute w-[120%] h-px bg-[#2e2621]/20 -rotate-12" />
            <div className="absolute w-[120%] h-px bg-[#2e2621]/20 -rotate-45" />
          </div>

          {/* Sello Postal (Postage Stamp) */}
          <div 
            className="w-12 h-14 bg-[#eedec4] border-2 border-dashed border-[#cbb898] p-1 flex flex-col justify-between shadow-sm relative overflow-hidden"
            style={{ transform: 'rotate(-4deg)' }}
          >
            <div className="w-full h-full border border-[#cbb898] bg-[#f5efe6] flex flex-col items-center justify-center p-0.5">
              <span className="font-serif text-[5px] text-[#cbb898] tracking-tighter uppercase">Matrimonio</span>
              <span className="font-serif text-[8px] font-bold text-[#8f7959] mt-0.5">H&A</span>
              <span className="font-serif text-[5px] text-[#cbb898] tracking-widest mt-0.5">11.27.26</span>
            </div>
            {/* Stamp serrated edge simulation */}
            <div className="absolute inset-0 border-[3px] border-double border-[#eedec4] pointer-events-none" />
          </div>
        </div>

        {/* Nostalgic Coffee Stain / Aging marks */}
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#b59e7f]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-20 -left-6 w-16 h-16 bg-[#b59e7f]/10 rounded-full blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="close-btn absolute top-4 left-4 p-1.5 rounded-full hover:bg-black/5 text-[#8f7959] hover:text-[#2c2621] transition-colors z-20 cursor-pointer"
          aria-label="Cerrar carta"
        >
          <X size={18} />
        </button>

        {/* Letter Content */}
        <div className="mt-12 mb-8 flex-1 flex flex-col">
          {/* Main Body */}
          <div 
            className="text-[#2b211a] italic px-2 flex-1 text-center flex items-center justify-center"
            style={{
              fontFamily: '"Pinyon Script", cursive',
              fontSize: 'min(7vw, 1.85rem)',
              lineHeight: '1.4',
              mixBlendMode: 'multiply',
              wordBreak: 'break-word',
              textShadow: '0.5px 0.5px 0px rgba(255,255,255,0.8)'
            }}
          >
            <p className="whitespace-pre-line leading-relaxed py-4">
              {message}
            </p>
          </div>

          {/* Handwritten Signatures */}
          <div className="mt-6 flex flex-col items-center border-t border-[#8f7959]/20 pt-4">
            <span className="font-serif italic text-[#8f7959] text-[10px] uppercase tracking-widest opacity-80 mb-2">Con amor,</span>
            <div 
              className="flex justify-center items-center gap-4 text-[#2b211a] opacity-90 select-none text-2xl"
              style={{ fontFamily: '"Sacramento", cursive' }}
            >
              <span>Ana Maria</span>
              <span className="text-red-600/40 text-sm">❤</span>
              <span>Harold</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons flex justify-center mt-4 pt-4 border-t border-[#8f7959]/10 gap-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 bg-[#8f7959] hover:bg-[#726046] text-white px-5 py-2.5 rounded font-semibold text-xs transition-colors shadow-md disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          >
            <Download size={14} />
            {downloading ? 'Capturando carta...' : 'Guardar Carta'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
