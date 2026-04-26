import { useState } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';

interface TwoStateEnvelopeProps {
  onOpenComplete: () => void;
}

export default function TwoStateEnvelope({ onOpenComplete }: TwoStateEnvelopeProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const y = useMotionValue(0);
  const cardControls = useAnimation();

  // OPEN ENVELOPE SLICING MATH (envelope_closed.png)
  const FLAP_HINGE_Y = 40.8; 
  const POCKET_Y = 40.8;     
  const ENVELOPE_BOTTOM_Y = 70.8; 

  const handleEnvelopeClick = () => {
    if (isOpened) return;
    setIsOpened(true);
    
    // Wait for crossfade to finish, then slide card up
    setTimeout(() => {
      cardControls.start({ 
        y: -120, 
        transition: { type: 'spring', stiffness: 100, damping: 15 } 
      });
    }, 800);
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
      cardControls.start({ y: -120, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center overflow-hidden" 
      style={{ 
        backgroundImage: 'url(/Image_1.jpg)', // Silk background
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 1, delay: 0.2 }}
    >
      <div className="relative w-full max-w-[500px] h-full flex items-center justify-center">

        {/* STATE 2: THE OPEN ENVELOPE (With Card Inside) */}
        {/* We use the 1408x3042 aspect ratio for the open envelope */}
        <motion.div
          className="absolute w-[280px] h-[600px] sm:w-[350px] sm:h-[750px] pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isOpened ? 1 : 0, scale: isOpened ? 1 : 0.95 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* MIDDLE CHUNK (Inside Back visible part) */}
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

          {/* THE CARD */}
          <motion.div
            className={`absolute left-[5%] right-[5%] shadow-xl overflow-hidden rounded-sm flex flex-col items-center justify-center ${isOpened ? 'cursor-grab active:cursor-grabbing pointer-events-auto' : 'pointer-events-none'}`}
            style={{ 
              top: `${FLAP_HINGE_Y + 1}%`, 
              bottom: `${100 - ENVELOPE_BOTTOM_Y + 1}%`, // Fits EXACTLY inside the envelope body
              zIndex: 20, 
              y,
              backgroundImage: 'url(/Image_5-Photoroom.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            drag={isOpened ? "y" : false}
            dragConstraints={{ top: -1000, bottom: -100 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            animate={cardControls}
            initial={{ y: 0 }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-white/20 backdrop-blur-[1px]">
              <h2 className="font-serif text-5xl sm:text-6xl text-primary mb-4 mix-blend-multiply opacity-90">H & A</h2>
              <p className="font-sans text-xs sm:text-sm text-primary/80 uppercase tracking-[0.3em] mix-blend-multiply font-bold">
                {isOpened ? 'Desliza para sacar' : 'Nuestra Boda'}
              </p>
            </div>
          </motion.div>

          {/* BOTTOM CHUNK (Front Pocket) */}
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

          {/* TOP CHUNK (The Flap, static open) */}
          <div
            className="absolute inset-0"
            style={{ 
              backgroundImage: 'url(/envelope_closed.png)',
              backgroundSize: '100% 100%',
              clipPath: `polygon(0 0, 100% 0, 100% ${FLAP_HINGE_Y}%, 0 ${FLAP_HINGE_Y}%)`,
              zIndex: 40,
              filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.4))'
            }}
          />
        </motion.div>

        {/* STATE 1: THE CLOSED ENVELOPE (High Res with real wax seal) */}
        {/* We use the full image, scaled to match the width of the open envelope's body.
            The closed envelope image is wider, so we make it slightly wider than the 280px container to match physical proportions. */}
        <motion.div
          className="absolute z-50 cursor-pointer drop-shadow-2xl"
          style={{ 
            width: '100%', 
            // ALIGNMENT TUNING (Perfect match for the open envelope)
            scale: 0.95, 
            y: '14%' 
          }}
          onClick={handleEnvelopeClick}
          initial={{ opacity: 1, scale: 0.95 }}
          animate={{ opacity: isOpened ? 0 : 1, scale: isOpened ? 1.0 : 0.95 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          whileHover={!isOpened ? { scale: 0.97 } : {}}
          whileTap={!isOpened ? { scale: 0.93 } : {}}
        >
          <img 
            src="/envelope_open.png" // This is the high-res closed envelope
            className="w-full h-auto object-cover"
            alt="Sobre cerrado"
          />
        </motion.div>

      </div>
    </motion.div>
  );
}
