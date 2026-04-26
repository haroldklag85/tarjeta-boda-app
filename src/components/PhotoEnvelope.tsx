import { useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';

interface PhotoEnvelopeProps {
  onOpenComplete: () => void;
}

export default function PhotoEnvelope({ onOpenComplete }: PhotoEnvelopeProps) {
  const [isBroken, setIsBroken] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const y = useMotionValue(0);
  const cardControls = useAnimation();
  
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // Measurements from envelope_closed.png (which is actually the OPEN envelope image)
  // Image size: 1408 x 3042
  const FLAP_HINGE_Y = 40.8; 
  const POCKET_Y = 40.8;     
  const ENVELOPE_BOTTOM_Y = 70.8; 

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 15; 
      const y = (e.clientY / window.innerHeight - 0.5) * -15;
      setRotateY(x);
      setRotateX(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSealClick = () => {
    if (isBroken) return;
    setIsBroken(true);
    
    setTimeout(() => {
      setIsOpen(true);
      cardControls.start({ 
        y: -100, 
        transition: { type: 'spring', stiffness: 100, delay: 0.5 } 
      });
    }, 600);
  };

  const handleDragEnd = (_e: any, info: any) => {
    if (info.offset.y < -150 || info.velocity.y < -400) {
      setIsExiting(true);
      cardControls.start({ 
        y: -window.innerHeight * 1.5, 
        scale: 1.5, 
        opacity: 0, 
        transition: { duration: 0.8, ease: "easeInOut" } 
      }).then(() => {
        onOpenComplete();
      });
    } else {
      cardControls.start({ y: -100, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center overflow-hidden" 
      style={{ 
        perspective: '1500px',
        backgroundImage: 'url(/Image_1.jpg)', // Silk background
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 1, delay: 0.2 }}
    >
      <motion.div
        // Aspect ratio of the 1408x3042 image
        className="relative w-[280px] h-[600px] sm:w-[350px] sm:h-[750px]"
        animate={{ rotateX, rotateY }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 1. MIDDLE CHUNK (Inside Back visible part) */}
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: 'url(/envelope_closed.png)',
            backgroundSize: '100% 100%',
            clipPath: `polygon(0 ${FLAP_HINGE_Y}%, 100% ${FLAP_HINGE_Y}%, 100% ${POCKET_Y}%, 0 ${POCKET_Y}%)`,
            zIndex: 10,
            filter: 'drop-shadow(0px 20px 30px rgba(0,0,0,0.5))'
          }}
        ></div>

        {/* 2. THE CARD */}
        <motion.div
          className={`absolute left-[5%] right-[5%] shadow-xl overflow-hidden rounded-sm flex flex-col items-center justify-center ${isOpen ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
          style={{ 
            top: `${FLAP_HINGE_Y + 1}%`, 
            bottom: `${100 - ENVELOPE_BOTTOM_Y + 1}%`, // Dynamic bottom constraint
            zIndex: 20, 
            y,
            backgroundImage: 'url(/Image_5-Photoroom.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          drag={isOpen ? "y" : false}
          dragConstraints={{ top: -1000, bottom: -100 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          animate={cardControls}
          initial={{ y: 0 }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-white/20 backdrop-blur-[1px]">
            <h2 className="font-serif text-5xl sm:text-6xl text-primary mb-4 mix-blend-multiply opacity-90">H & A</h2>
            <p className="font-sans text-xs sm:text-sm text-primary/80 uppercase tracking-[0.3em] mix-blend-multiply">
              {isOpen ? 'Desliza para sacar' : 'Nuestra Boda'}
            </p>
          </div>
        </motion.div>

        {/* 3. BOTTOM CHUNK (Front Pocket) */}
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: 'url(/envelope_closed.png)',
            backgroundSize: '100% 100%',
            clipPath: `polygon(0 ${POCKET_Y}%, 100% ${POCKET_Y}%, 100% 100%, 0 100%)`,
            zIndex: 30,
            filter: 'drop-shadow(0px -5px 15px rgba(0,0,0,0.3)) drop-shadow(0px 20px 30px rgba(0,0,0,0.5))'
          }}
        >
           <div className="absolute top-[41%] left-0 w-full h-4 bg-gradient-to-b from-black/20 to-transparent"></div>
        </div>

        {/* 4. TOP CHUNK (The Flap) */}
        <motion.div
          className="absolute inset-0 origin-top"
          style={{ 
            backgroundImage: 'url(/envelope_closed.png)',
            backgroundSize: '100% 100%',
            clipPath: `polygon(0 0, 100% 0, 100% ${FLAP_HINGE_Y}%, 0 ${FLAP_HINGE_Y}%)`,
            zIndex: 40,
            transformOrigin: `50% ${FLAP_HINGE_Y}%`,
            filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.4))'
          }}
          initial={{ rotateX: 180 }}
          animate={{ rotateX: isOpen ? 0 : 180 }}
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        />

        {/* 5. THE REAL WAX SEAL */}
        {/* We extract the real wax seal from envelope_open.png (which contains the closed envelope) */}
        <motion.div 
          className="absolute left-1/2 -translate-x-1/2 cursor-pointer z-50 rounded-full shadow-lg"
          style={{ 
            top: `${FLAP_HINGE_Y + 12}%`, // Positioned over the fold
            width: '80px',
            height: '80px',
            backgroundImage: 'url(/envelope_open.png)',
            backgroundPosition: '50% 61%', // Zoomed into the exact seal coordinates
            backgroundSize: '1100%', // Zoom level
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))'
          }}
          onClick={handleSealClick}
          animate={{ 
            opacity: isOpen ? 0 : 1,
            scale: isBroken ? 1.2 : 1,
            filter: isBroken ? 'drop-shadow(0 0 0 rgba(0,0,0,0))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>
    </motion.div>
  );
}
