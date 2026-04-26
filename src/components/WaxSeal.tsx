import { motion } from 'framer-motion';

interface WaxSealProps {
  isBroken: boolean;
  onClick: () => void;
}

export default function WaxSeal({ isBroken, onClick }: WaxSealProps) {
  // A highly realistic CSS wax seal using radial gradients and inset shadows
  const realisticSealStyle = {
    background: 'radial-gradient(circle at 30% 30%, #ffd700, #b8860b 60%, #8b6508 100%)',
    boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.6), inset 3px 3px 8px rgba(255,255,255,0.5), 0 8px 15px rgba(0,0,0,0.6)',
    border: '2px solid #8b6508'
  };

  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 cursor-pointer" onClick={onClick}>
      {/* Top Half of the broken seal (or full seal when closed) */}
      <motion.div
        className="absolute top-0 left-0 w-full h-1/2 overflow-hidden flex justify-center items-end"
        animate={{ y: isBroken ? -15 : 0, rotate: isBroken ? -5 : 0, opacity: isBroken ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div 
          className="absolute top-0 rounded-full w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center font-serif text-white/90 text-2xl sm:text-3xl"
          style={{
            ...realisticSealStyle,
            textShadow: '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.3)',
          }}
        >
          <span className="translate-y-[-2px] tracking-wider font-bold">H&A</span>
        </div>
      </motion.div>

      {/* Bottom Half */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden flex justify-center items-start"
        animate={{ y: isBroken ? 15 : 0, rotate: isBroken ? 5 : 0, opacity: isBroken ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div 
          className="absolute bottom-0 rounded-full w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center font-serif text-white/90 text-2xl sm:text-3xl"
          style={{
            ...realisticSealStyle,
            textShadow: '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.3)',
          }}
        >
          <span className="translate-y-[-2px] tracking-wider font-bold">H&A</span>
        </div>
      </motion.div>
    </div>
  );
}
