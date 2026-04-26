import { motion } from 'framer-motion';

/*
 * SEAL FRAGMENTS v3 — Real seal fragmentation
 * 
 * Renders multiple irregular pieces using the real sello2.png
 * each with a different clip-path polygon to simulate wax breaking.
 */

interface SealFragmentsProps {
  isBreaking: boolean;
}

// All fragments share the exact same background extraction as the main seal.
// They cover the whole 100%x100% area of the parent div.
// We just clip different parts of them so they piece together perfectly.
const FRAGMENTS = [
  // Top left piece
  {
    clip: 'polygon(0% 0%, 55% 0%, 45% 45%, 0% 50%)',
    exitX: -40, exitY: -35, exitRotate: -35, delay: 0
  },
  // Top right piece
  {
    clip: 'polygon(55% 0%, 100% 0%, 100% 40%, 65% 45%, 45% 45%)',
    exitX: 45, exitY: -30, exitRotate: 25, delay: 0.05
  },
  // Middle left
  {
    clip: 'polygon(0% 50%, 45% 45%, 35% 65%, 0% 80%)',
    exitX: -50, exitY: 5, exitRotate: -15, delay: 0.02
  },
  // Middle right
  {
    clip: 'polygon(65% 45%, 100% 40%, 100% 75%, 70% 60%)',
    exitX: 55, exitY: 15, exitRotate: 45, delay: 0.08
  },
  // Center small chunk
  {
    clip: 'polygon(45% 45%, 65% 45%, 70% 60%, 55% 75%, 35% 65%)',
    exitX: 10, exitY: 20, exitRotate: 80, delay: 0.12
  },
  // Bottom left
  {
    clip: 'polygon(0% 80%, 35% 65%, 55% 75%, 45% 100%, 0% 100%)',
    exitX: -25, exitY: 45, exitRotate: -40, delay: 0.07
  },
  // Bottom right
  {
    clip: 'polygon(55% 75%, 70% 60%, 100% 75%, 100% 100%, 45% 100%)',
    exitX: 30, exitY: 50, exitRotate: 20, delay: 0.04
  }
];

export default function SealFragments({ isBreaking }: SealFragmentsProps) {
  return (
    <div className="absolute inset-0">
      {FRAGMENTS.map((frag, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/sello2.png)',
            backgroundSize: '450% auto',
            backgroundPosition: '47.55% 63.88%',
            backgroundRepeat: 'no-repeat',
            clipPath: frag.clip,
            // drop-shadow on clipped elements requires filter in some browsers
            // but for performance and compatibility, we just let the pieces fly
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
          animate={
            isBreaking
              ? {
                  x: frag.exitX,
                  y: frag.exitY,
                  rotate: frag.exitRotate,
                  opacity: 0,
                  scale: 0.7,
                }
              : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
          }
          transition={{
            duration: 1.2,
            delay: frag.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
            opacity: { duration: 1.5, delay: 0.3 + frag.delay },
          }}
        />
      ))}
    </div>
  );
}
