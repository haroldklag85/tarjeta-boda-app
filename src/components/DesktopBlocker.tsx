import { motion } from 'framer-motion';
import { useCountdown } from '../hooks/useCountdown';
import { Smartphone } from 'lucide-react';

export default function DesktopBlocker() {
  const timeLeft = useCountdown('2026-11-27T00:00:00');

  return (
    <div className="fixed inset-0 w-full h-full bg-[#F2EFE9] flex flex-col items-center justify-center p-8 z-[9999] text-center overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#e1ecd4] rounded-full blur-3xl opacity-60 z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-[#dce6cf] rounded-full blur-3xl opacity-60 z-0 pointer-events-none"></div>

      <motion.div
        className="z-10 flex flex-col items-center max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Smartphone size={48} className="text-primary mb-6 opacity-80" strokeWidth={1.5} />

        <h1 className="text-[3rem] md:text-[4rem] leading-tight text-on-background text-center mb-2 tracking-[0.15em] uppercase font-serif">
          ANa Maria<br />&amp;<br />Harold
        </h1>
        
        <p className="font-serif italic text-2xl text-primary tracking-[0.2em] uppercase mb-8">
          ¡NOS CASAMOS!
        </p>

        <h2 className="text-[1.5rem] text-on-background text-center mb-12 font-serif opacity-90">
          Viernes, 27 de Noviembre 2026
        </h2>

        {/* Countdown Grid */}
        <div className="w-full bg-white/60 backdrop-blur-md border border-[#D1C4B0]/50 rounded-xl p-6 flex justify-between items-center shadow-[0_8px_30px_rgba(44,53,37,0.04)] mb-12">
          <div className="flex flex-col items-center flex-1">
            <span className="text-[2rem] text-primary font-serif">{timeLeft.days}</span>
            <span className="text-on-surface-variant uppercase tracking-widest text-[11px] mt-1 font-semibold">Días</span>
          </div>
          <span className="text-[1.5rem] text-[#D1C4B0] font-serif">:</span>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[2rem] text-primary font-serif">{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className="text-on-surface-variant uppercase tracking-widest text-[11px] mt-1 font-semibold">Hrs</span>
          </div>
          <span className="text-[1.5rem] text-[#D1C4B0] font-serif">:</span>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[2rem] text-primary font-serif">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="text-on-surface-variant uppercase tracking-widest text-[11px] mt-1 font-semibold">Min</span>
          </div>
          <span className="text-[1.5rem] text-[#D1C4B0] font-serif">:</span>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[2rem] text-primary font-serif">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className="text-on-surface-variant uppercase tracking-widest text-[11px] mt-1 font-semibold">Seg</span>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 px-8 py-4 rounded-full">
          <p className="text-primary font-medium tracking-wide uppercase text-sm flex items-center gap-3">
            <Smartphone size={18} />
            Abre tu invitación en un móvil
          </p>
        </div>
      </motion.div>
    </div>
  );
}
