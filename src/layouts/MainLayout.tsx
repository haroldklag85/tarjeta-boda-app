import { Outlet, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, MapPin, Mail, BookOpen, Music2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import GlobalAudio from '../utils/audio';

export default function MainLayout() {
  const [isMuted, setIsMuted] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);

  useEffect(() => {
    // Read initial audio state
    setIsMuted(GlobalAudio.isMuted());

    // Listen for letter state change events to hide/show layout headers/footers
    const handleLetterState = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen: boolean }>;
      if (customEvent.detail) {
        setIsLetterOpen(customEvent.detail.isOpen);
      }
    };
    window.addEventListener('letter_state_change', handleLetterState);
    return () => {
      window.removeEventListener('letter_state_change', handleLetterState);
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(GlobalAudio.toggleMute());
  };

  return (
    <motion.div
      key="main-app"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
      className="min-h-screen w-full max-w-[100vw] flex flex-col bg-background text-on-background font-sans antialiased relative overflow-x-hidden pb-24"
    >
      {/* TopAppBar - Hidden smoothly when letter is open */}
      <AnimatePresence>
        {!isLetterOpen && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="bg-[#FDFCF0] fixed top-0 left-0 w-full max-w-[100vw] z-50 flex justify-center items-center h-16 px-4 border-b border-[#E5E2D0] shadow-sm"
          >
            <h1 className="text-xl font-serif italic text-primary font-extrabold uppercase tracking-widest">
              A & H
            </h1>
            {/* Music Toggle Button */}
            <button 
              onClick={toggleMute}
              className="absolute right-4 text-primary hover:opacity-80 transition-opacity bg-[#e7f2da] p-2 rounded-full border border-[#D1C4B0]/50 shadow-sm"
              aria-label={isMuted ? "Unmute music" : "Mute music"}
            >
              {isMuted ? <VolumeX size={18} strokeWidth={1.5} /> : <Music2 size={18} strokeWidth={1.5} className="animate-[pulse_3s_ease-in-out_infinite]" />}
            </button>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-24 pb-32 px-5 max-w-2xl mx-auto w-full flex flex-col relative z-10">
        <Outlet />
      </main>

      {/* BottomNavBar - Hidden smoothly when letter is open */}
      <AnimatePresence>
        {!isLetterOpen && (
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="bg-[#FDFCF0]/95 backdrop-blur-md fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 pb-safe border-t border-[#E5E2D0]"
          >
            <NavItem to="/" icon={<Home strokeWidth={1.5} size={24} />} label="Inicio" />
            <NavItem to="/ubicacion" icon={<MapPin strokeWidth={1.5} size={24} />} label="Logística" />
            <NavItem to="/rsvp" icon={<Mail strokeWidth={1.5} size={24} />} label="RSVP" />
            <NavItem to="/info" icon={
              <div className="relative">
                <BookOpen strokeWidth={1.5} size={24} />
                <span className="absolute -top-[2px] -right-[4px] text-[10px] font-extrabold bg-[#FDFCF0] rounded-full w-3.5 h-3.5 flex items-center justify-center text-primary">!</span>
              </div>
            } label="Recomendaciones" />
          </motion.nav>
        )}
      </AnimatePresence>
      
      {/* Footer - Hidden smoothly when letter is open */}
      <AnimatePresence>
        {!isLetterOpen && (
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="w-full flex flex-col items-center gap-4 px-8 pb-32 pt-12 bg-[#F4F1E1] mt-auto"
          >
            <span className="text-sm font-bold text-primary font-serif italic text-center">
              Con amor, A & H | Evento formal sin niños
            </span>
            <div className="flex gap-4">
              <a className="font-serif text-xs italic text-center text-stone-600 hover:text-primary underline" href="/hoteles.pdf" target="_blank" rel="noopener noreferrer">Hoteles</a>
              <a className="font-serif text-xs italic text-center text-stone-600 hover:text-primary underline" href="/transporte.pdf" target="_blank" rel="noopener noreferrer">Transporte</a>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center w-full h-full transition-colors ${
          isActive 
            ? 'text-primary font-bold border-t-2 border-primary -mt-[1px]' 
            : 'text-stone-500 hover:text-primary/80'
        }`
      }
    >
      <div className="mb-1">{icon}</div>
      <span className="font-serif text-[10px] font-medium tracking-tight">{label}</span>
    </NavLink>
  );
}
