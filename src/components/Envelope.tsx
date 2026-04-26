import { useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import WaxSeal from './WaxSeal';

interface EnvelopeProps {
  onOpenComplete: () => void;
}

export default function Envelope({ onOpenComplete }: EnvelopeProps) {
  const [isBroken, setIsBroken] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Dragging the card
  const y = useMotionValue(0);
  const cardControls = useAnimation();
  
  // Gyroscope / Mouse depth effect
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Subtle rotation based on mouse position (max 10 degrees)
      const x = (e.clientX / window.innerWidth - 0.5) * 20; 
      const y = (e.clientY / window.innerHeight - 0.5) * -20;
      setRotateY(x);
      setRotateX(y);
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma && e.beta) {
        const x = Math.max(-15, Math.min(15, e.gamma));
        const y = Math.max(-15, Math.min(15, e.beta - 45)); // adjust for holding angle
        setRotateY(x);
        setRotateX(-y);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleDeviceOrientation as EventListener);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation as EventListener);
    };
  }, []);

  const handleSealClick = () => {
    if (isBroken) return;
    setIsBroken(true);
    
    // Wait for seal to break, then open flap
    setTimeout(() => {
      setIsOpen(true);
      // Automatically bump the card up slightly to indicate it can be dragged
      cardControls.start({ 
        y: -50, 
        transition: { type: 'spring', stiffness: 100, delay: 0.4 } 
      });
    }, 500);
  };

  const handleDragEnd = (_e: any, info: any) => {
    // If dragged up more than 150px or thrown up with velocity
    if (info.offset.y < -120 || info.velocity.y < -500) {
      setIsExiting(true);
      // Animate card up and out, then trigger completion
      cardControls.start({ 
        y: -window.innerHeight, 
        scale: 1.2, 
        opacity: 0, 
        transition: { duration: 0.6, ease: "easeIn" } 
      }).then(() => {
        onOpenComplete();
      });
    } else {
      // Snap back if not pulled enough
      cardControls.start({ y: -50, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-surface overflow-hidden" 
      style={{ perspective: '1200px' }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <motion.div
        className="relative w-[340px] h-[220px] sm:w-[450px] sm:h-[300px]"
        animate={{ rotateX, rotateY }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ENVELOPE BACK (Inside) */}
        <div className="absolute inset-0 bg-primary-container rounded-sm shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black/15"></div>
        </div>

        {/* THE CARD */}
        <motion.div
          className={`absolute inset-2 bg-surface-container-lowest rounded-md shadow-lg flex items-center justify-center p-4 border border-outline-variant/30 ${isOpen ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
          style={{ zIndex: 10, y }}
          drag={isOpen ? "y" : false}
          dragConstraints={{ top: -800, bottom: -50 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          animate={cardControls}
          initial={{ y: 0 }}
        >
          <div className="w-full h-full border border-primary/20 rounded-sm flex flex-col items-center justify-center text-center p-4 bg-white/40 backdrop-blur-md">
            <h2 className="font-serif text-4xl text-primary mb-3">H & A</h2>
            <p className="font-sans text-xs text-on-surface-variant uppercase tracking-[0.2em]">
              {isOpen ? 'Desliza hacia arriba' : 'Nuestra Boda'}
            </p>
          </div>
        </motion.div>

        {/* ENVELOPE FRONT (Bottom Flap) */}
        <div 
          className="absolute bottom-0 left-0 w-full h-[70%] bg-primary shadow-[0_-10px_20px_rgba(0,0,0,0.15)] rounded-b-sm border-t border-white/5"
          style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 50% 30%, 0 0)', zIndex: 20 }}
        ></div>

        {/* ENVELOPE FRONT (Side Flaps) */}
        <div 
          className="absolute top-0 left-0 w-full h-full bg-primary/95"
          style={{ clipPath: 'polygon(0 0, 48% 50%, 0 100%)', zIndex: 20 }}
        ></div>
        <div 
          className="absolute top-0 right-0 w-full h-full bg-primary/95"
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 52% 50%)', zIndex: 20 }}
        ></div>

        {/* ENVELOPE FLAP (Top) */}
        <motion.div
          className="absolute top-0 left-0 w-full h-[65%] bg-primary shadow-[0_5px_15px_rgba(0,0,0,0.2)] origin-top rounded-t-sm border-b border-black/10"
          style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', zIndex: 30, backfaceVisibility: 'hidden' }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: isOpen ? 180 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        
        {/* Inside of the top flap (visible when open) */}
        <motion.div
          className="absolute top-0 left-0 w-full h-[65%] bg-primary-container origin-top rounded-t-sm"
          style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', zIndex: 5, backfaceVisibility: 'hidden' }}
          initial={{ rotateX: 180 }}
          animate={{ rotateX: isOpen ? 0 : 180 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {/* THE WAX SEAL */}
        <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: isOpen ? 0 : 40 }}>
          <WaxSeal isBroken={isBroken} onClick={handleSealClick} />
        </div>
      </motion.div>
    </motion.div>
  );
}
