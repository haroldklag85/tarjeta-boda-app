import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, VolumeX, Mail } from 'lucide-react';
import GlobalAudio from '../utils/audio';
import NostalgicLetter from '../components/NostalgicLetter';

export default function ParticipationInvitation() {
  const [isMuted, setIsMuted] = useState(false);
  const [customMessage, setCustomMessage] = useState<string | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);

  useEffect(() => {
    // 1. Play the music automatically
    GlobalAudio.play();
    setIsMuted(GlobalAudio.isMuted());

    // 2. Load custom message
    const msg = localStorage.getItem('invitation_custom_message');
    setCustomMessage(msg);
  }, []);

  const toggleMute = () => {
    setIsMuted(GlobalAudio.toggleMute());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="min-h-screen w-full bg-[#F2EFE9] text-on-background font-sans antialiased relative overflow-x-hidden pb-24 flex flex-col items-center"
    >
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-[-10%] w-64 h-64 bg-[#e1ecd4] rounded-full blur-3xl opacity-50 z-0 pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-80 h-80 bg-[#dce6cf] rounded-full blur-3xl opacity-50 z-0 pointer-events-none"></div>

      {/* Floating Music Button */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={toggleMute}
          className="text-primary hover:opacity-80 transition-opacity bg-[#e7f2da] p-2.5 rounded-full border border-[#D1C4B0]/50 shadow-md flex items-center justify-center cursor-pointer"
          aria-label={isMuted ? "Unmute music" : "Mute music"}
        >
          {isMuted ? (
            <VolumeX size={20} strokeWidth={1.5} />
          ) : (
            <Music2 size={20} strokeWidth={1.5} className="animate-[pulse_3s_ease-in-out_infinite] text-primary" />
          )}
        </button>
      </div>

      {/* Main Container */}
      <div className="z-10 flex flex-col items-center w-full max-w-md mx-auto px-5 pt-16 relative">
        {/* Elegant Initials Header */}
        <motion.div 
          className="text-center mb-8 flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[3rem] font-serif text-primary" style={{ fontFamily: '"Sacramento", cursive' }}>
            Ana Maria &amp; Harold
          </span>
          <div className="w-16 h-px bg-[#D1C4B0] mt-2"></div>
        </motion.div>

        {/* Elegant Card with message */}
        <motion.div 
          className="w-full bg-white/75 backdrop-blur-sm rounded-2xl p-8 border border-[#D1C4B0]/40 shadow-[0_8px_30px_rgba(44,53,37,0.04)] flex flex-col items-center text-center relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, transparent 20%, rgba(251, 251, 250, 0.5) 20%, rgba(251, 251, 250, 0.5) 80%, rgba(220, 205, 180, 0.05) 100%)',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Subtle paper textures */}
          <div className="absolute top-[10%] left-[-15%] w-32 h-32 bg-[#b59e7f]/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-[10%] right-[-15%] w-32 h-32 bg-[#b59e7f]/5 rounded-full blur-xl pointer-events-none" />

          {/* Invitation Message */}
          <div className="font-serif text-[#4d3725] text-[1.05rem] leading-[1.8] space-y-6 text-center italic">
            <p className="font-bold tracking-wide not-italic text-primary mb-6">¡NOS CASAMOS!</p>
            <p>Queremos compartir contigo una de las alegrías más grandes de nuestras vidas: ¡nos casamos!</p>
            <p>El próximo 27 de noviembre de 2026 daremos un paso muy importante en nuestra historia: unir nuestras vidas y comenzar juntos una nueva etapa llena de amor, sueños y esperanza.</p>
            <p>Aunque la vida a veces nos lleve por caminos distintos, hay personas que permanecen en el corazón por lo que han significado, por los momentos compartidos y por el cariño que han dejado en nuestra historia. Tú eres una de esas personas.</p>
            <p>Por eso, no queríamos vivir este momento sin hacerte parte de nuestra felicidad. Gracias por tu cariño, por tu presencia en nuestras vidas y por acompañarnos, de una u otra forma, en este camino.</p>
          </div>

          {/* Signature */}
          <div className="mt-8 pt-6 border-t border-[#8f7959]/20 w-full flex flex-col items-center">
            <span className="font-serif italic text-[#8f7959] text-[10px] uppercase tracking-widest opacity-80 mb-2">Con todo nuestro amor y aprecio,</span>
            <div 
              className="text-[#4d3725] opacity-95 text-2xl mb-1"
              style={{ fontFamily: '"Sacramento", cursive' }}
            >
              Ana M. Perdomo y Harold Gómez
            </div>
            <span className="text-[11px] text-stone-500 font-mono tracking-widest mt-1">2026</span>
          </div>

          {/* Golden Button for Secret/Custom Message */}
          {customMessage && (
            <motion.div 
              className="mt-8 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <button
                onClick={() => setLetterOpen(true)}
                className="flex items-center justify-center gap-2 bg-[#8f7959] hover:bg-[#726046] text-white px-6 py-3 rounded-full font-bold text-xs transition-colors shadow-md cursor-pointer w-full uppercase tracking-wider"
              >
                <Mail size={14} />
                Leer mensaje personal
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Polaroid Style Photo */}
        <motion.div
          className="mt-12 mb-4 flex flex-col items-center"
          initial={{ opacity: 0, y: 30, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: 2.5 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div
            className="relative bg-white p-3.5 pb-16 rounded-sm shadow-[0_8px_30px_rgba(44,53,37,0.12)] border border-[#D1C4B0]/30"
            style={{ transform: 'rotate(2.5deg)' }}
          >
            <div className="w-60 h-68 overflow-hidden rounded-sm">
              <img
                alt="Nosotros"
                className="w-full h-full object-cover"
                src="/fotoTres.jpeg"
              />
            </div>
            {/* Handwritten caption */}
            <p
              className="absolute bottom-5 left-0 right-0 text-center text-[0.95rem] text-[#44483f] italic"
              style={{ fontFamily: '"Sacramento", cursive', fontSize: '1.75rem' }}
            >
              Ana Maria &amp; Harold
            </p>
          </div>
        </motion.div>
      </div>

      {/* Secret Letter Modal */}
      <AnimatePresence>
        {letterOpen && customMessage && (
          <NostalgicLetter
            message={customMessage}
            onClose={() => setLetterOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
