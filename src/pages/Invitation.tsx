import { motion } from 'framer-motion';
import { useCountdown } from '../hooks/useCountdown';
import { useState, useEffect } from 'react';

export default function Invitation() {
  const timeLeft = useCountdown('2026-11-27T00:00:00');
  const [customMessage, setCustomMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomMessage = () => {
      const msg = localStorage.getItem('invitation_custom_message');
      setCustomMessage(msg);
    };

    loadCustomMessage();

    window.addEventListener('invitation_loaded', loadCustomMessage);
    return () => window.removeEventListener('invitation_loaded', loadCustomMessage);
  }, []);

  return (
    <>
      {/* Subtle Background Decorative Element */}
      <div className="absolute top-0 left-[-10%] w-64 h-64 bg-[#e1ecd4] rounded-full blur-3xl opacity-50 z-0 pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-80 h-80 bg-[#dce6cf] rounded-full blur-3xl opacity-50 z-0 pointer-events-none"></div>

      <motion.div 
        className="z-10 flex flex-col items-center w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Hero Image (Arch Mask) */}
        <motion.div 
          className="w-48 h-64 md:w-64 md:h-80 mb-8 rounded-t-full rounded-b-lg overflow-hidden border border-[#D1C4B0] shadow-[0_4px_20px_rgba(44,53,37,0.05)]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <img 
            alt="Pareja" 
            className="w-full h-full object-cover" 
            src="/screenPrincipal.png" 
          />
        </motion.div>

        {/* Welcome Message */}
        <motion.div 
          className="text-[#44483f] mb-12 space-y-6 max-w-sm text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <p className="text-primary italic font-serif leading-[1.8]">La magia de la conexión, la suerte de coincidir, el esfuerzo de permanecer y la bendición de ser un nosotros.</p>
          <p className="text-primary italic font-serif leading-[1.8]">Con el corazón lleno de amor y alegría, queremos invitarlos a acompañarnos en el día en que celebraremos nuestra unión.</p>
          <p className="text-primary italic font-serif leading-[1.8]">Será un momento íntimo y especial, y nos hará muy felices compartirlo con las personas que han sido parte de nuestra historia.</p>
        </motion.div>


        {/* Prominent Text Addition */}
        <motion.p 
          className="font-serif italic text-2xl text-primary tracking-[0.2em] uppercase mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          ¡NOS CASAMOS!
        </motion.p>

        {/* Main Title */}
        <motion.h1 
          className="text-[2.75rem] leading-tight text-on-background text-center mb-6 tracking-[0.15em] uppercase font-serif"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          ANa Maria<br />&amp;<br />Harold
        </motion.h1>

        {/* Decorative Separator */}
        <motion.div 
          className="w-12 h-[1px] bg-[#D1C4B0] mb-6"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        ></motion.div>

        {/* Date Highlighted */}
        <motion.h2 
          className="text-[1.25rem] text-on-background text-center mb-12 font-serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          Viernes, 27 de Noviembre 2026
        </motion.h2>

        {/* Countdown Grid (Glassmorphism/Minimalist) */}
        <motion.div 
          className="w-full bg-white/50 backdrop-blur-sm border border-[#D1C4B0]/50 rounded-lg p-5 flex justify-between items-center shadow-[0_4px_20px_rgba(44,53,37,0.02)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="flex flex-col items-center flex-1">
            <span className="text-[1.5rem] md:text-[1.75rem] text-primary font-serif">{timeLeft.days}</span>
            <span className="text-on-surface-variant uppercase tracking-widest text-[9px] md:text-[10px] mt-1 font-semibold">Días</span>
          </div>
          <span className="text-[1.25rem] text-[#D1C4B0] font-serif">:</span>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[1.5rem] md:text-[1.75rem] text-primary font-serif">{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className="text-on-surface-variant uppercase tracking-widest text-[9px] md:text-[10px] mt-1 font-semibold">Hrs</span>
          </div>
          <span className="text-[1.25rem] text-[#D1C4B0] font-serif">:</span>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[1.5rem] md:text-[1.75rem] text-primary font-serif">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="text-on-surface-variant uppercase tracking-widest text-[9px] md:text-[10px] mt-1 font-semibold">Min</span>
          </div>
          <span className="text-[1.25rem] text-[#D1C4B0] font-serif">:</span>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[1.5rem] md:text-[1.75rem] text-primary font-serif">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className="text-on-surface-variant uppercase tracking-widest text-[9px] md:text-[10px] mt-1 font-semibold">Seg</span>
          </div>
        </motion.div>

        {/* Engagement Photo — Polaroid Style */}
        <motion.div
          className="mt-14 mb-4 flex flex-col items-center"
          initial={{ opacity: 0, y: 30, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: -2.5 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          <div
            className="relative bg-white p-3 pb-14 rounded-sm shadow-[0_8px_30px_rgba(44,53,37,0.12)] border border-[#D1C4B0]/30"
            style={{ transform: 'rotate(-2.5deg)' }}
          >
            <div className="w-56 h-64 overflow-hidden rounded-sm">
              <img
                alt="Día del compromiso"
                className="w-full h-full object-cover"
                src="/fotoPropuesta.jpeg"
              />
            </div>
            {/* Handwritten caption */}
            <p
              className="absolute bottom-4 left-0 right-0 text-center text-[0.85rem] text-[#44483f] italic"
              style={{ fontFamily: '"Noto Serif", serif' }}
            >
              El día que todo comenzó...
            </p>
          </div>
        </motion.div>

        {/* Subtle Teaser for the surprise custom message */}
        {customMessage && (
          <motion.p
            className="text-xs text-[#8a8d86] font-serif italic mt-6 text-center leading-relaxed max-w-[280px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            Te hemos dejado una nota personal que podrás leer al confirmar tu asistencia en la sección de "Asistencia".
          </motion.p>
        )}
      </motion.div>
    </>
  );
}
