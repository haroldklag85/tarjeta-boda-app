import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import SealFragments from './SealFragments';
import GlobalAudio from '../utils/audio';

interface LayeredEnvelopeProps {
  onOpenComplete: () => void;
}

/*
 * LAYERED ENVELOPE v7 — VIDEO-ONLY (Zero Mismatch)
 * 
 * PROBLEM SOLVED: v6 had visual discontinuities because static PNGs
 * (tilted, different size, different background) didn't match the video.
 * 
 * SOLUTION: The video IS everything.
 * - Sealed state: video paused at t=0.35s (first good frame with satin bg)
 * - Opening: video plays from t=0.35s to end (8s)
 * - Open state: video stays on last frame, card overlaid on top
 * 
 * This eliminates ALL mismatches: size, orientation, background.
 * 
 * VIDEO DATA (720×1280):
 * - t=0s: black fade-in (unusable)
 * - t=0.3s+: golden satin bg visible, envelope closed
 * - Envelope center line: y=39% to y=75% (vertical)
 * - Flap tip at ~39% from top
 * - Seal overlay target: ~53% from top, centered horizontally
 */

// Time in the video where the first usable frame is (after black fade)
const VIDEO_START_TIME = 0.35;

type Phase = 'sealed' | 'breaking' | 'playing' | 'open' | 'pulling';

export default function LayeredEnvelope({ onOpenComplete }: LayeredEnvelopeProps) {
  const [phase, setPhase] = useState<Phase>('sealed');
  const [sealBroken, setSealBroken] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [envelopeTextVisible, setEnvelopeTextVisible] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const typewriterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardControls = useAnimation();

  // ══════════════════════════════════════════════════════════════
  // TODO [BACKEND]: Reemplazar este nombre mock por el nombre real
  // del invitado obtenido de la base de datos (Supabase).
  // El valor debe venir como prop o desde un contexto/hook.
  // Ej: const guestName = useGuestName(invitationId);
  // ══════════════════════════════════════════════════════════════
  const GUEST_NAME_MOCK = 'Señor y Señora\nPipito Pérez e Hijos';

  // On mount: seek video to the first good frame
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const handleReady = () => {
      v.currentTime = VIDEO_START_TIME;
    };

    const handleSeeked = () => {
      // Video is now showing the first good frame
      setVideoReady(true);
    };

    v.addEventListener('loadeddata', handleReady);
    v.addEventListener('seeked', handleSeeked);
    v.load();

    return () => {
      v.removeEventListener('loadeddata', handleReady);
      v.removeEventListener('seeked', handleSeeked);
    };
  }, []);

  // Typewriter effect — triggered when envelopeTextVisible becomes true
  useEffect(() => {
    if (envelopeTextVisible) {
      let i = 0;
      const fullText = GUEST_NAME_MOCK.replace(/\n/g, '\n');
      setTypewriterText('');
      const charDelay = 1500 / fullText.length; // ~1.5s to type entire text (fast)
      const interval = setInterval(() => {
        i++;
        setTypewriterText(fullText.slice(0, i));
        if (i >= fullText.length) {
          clearInterval(interval);
        }
      }, charDelay);
      typewriterIntervalRef.current = interval;

      return () => {
        if (typewriterIntervalRef.current) {
          clearInterval(typewriterIntervalRef.current);
        }
      };
    } else {
      setTypewriterText('');
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }
    }
  }, [envelopeTextVisible]);

  // Video timeupdate — controls when the guest name text is visible
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || phase !== 'playing') return;

    const t = v.currentTime;

    // Text appears at 1.5s, stays for ~6 seconds, then fades out
    const textStartTime = 1.5;
    const textEndTime = textStartTime + 5.2; // 5.2 seconds of visibility

    if (t >= textStartTime && t < textEndTime) {
      setEnvelopeTextVisible(true);
    } else if (t >= textEndTime) {
      setEnvelopeTextVisible(false);
    }
  }, [phase]);

  const handleSealTap = useCallback(() => {
    if (phase !== 'sealed') return;

    // Start background music globally (it will persist across routes)
    GlobalAudio.play();

    // Break the seal
    setPhase('breaking');
    setSealBroken(true);

    // After seal animation, play the video from the start
    setTimeout(() => {
      setPhase('playing');
      const v = videoRef.current;
      if (v) {
        // Play from the beginning (t=0) to avoid seek/buffer issues
        // The first 0.3s is a fade-in from black — we hide it with CSS opacity transition
        v.currentTime = 0;
        const playPromise = v.play();
        if (playPromise) {
          playPromise.catch(() => {
            // Autoplay blocked — skip to open
            setPhase('open');
            setTimeout(() => setPhase('pulling'), 600);
          });
        }
      }
    }, 1400);
  }, [phase]);

  const handleVideoEnd = useCallback(() => {
    // Video finished — stay on last frame, show card
    setPhase('open');

    setTimeout(() => {
      setPhase('pulling');
      cardControls.start({
        y: '-6%',
        transition: { duration: 0.5 }
      });
    }, 600);
  }, [cardControls]);

  const handleCardDragEnd = useCallback(
    (_e: any, info: any) => {
      if (phase !== 'pulling' || isZoomed) return;

      if (info.offset.y < -60 || info.velocity.y < -180) {
        cardControls
          .start({
            y: '-400%',
            scale: 2.5,
            opacity: 0,
            transition: { duration: 1.4, ease: [0.4, 0, 0.2, 1] },
          })
          .then(() => setTimeout(onOpenComplete, 400));
      } else {
        cardControls.start({
          y: '0%',
          transition: { type: 'spring', stiffness: 200, damping: 20 },
        });
      }
    },
    [phase, cardControls, onOpenComplete]
  );

  const isSealed = phase === 'sealed' || phase === 'breaking';
  const isOpen = phase === 'open' || phase === 'pulling';

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden bg-black"
      initial={{ scale: 1 }}
      animate={{ scale: isZoomed ? 1.8 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
    >

      {/* ═══════════════════════════════════════════
          THE VIDEO — always visible, is the entire scene
          ═══════════════════════════════════════════ */}
      <video
        ref={videoRef}
        src="/sobre_apertura.mp4"
        className="absolute inset-0 w-full h-full"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          // Hide until the first good frame is loaded
          opacity: videoReady ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
        playsInline
        muted
        preload="auto"
        onEnded={handleVideoEnd}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Fallback bg while video loads */}
      {!videoReady && (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #d4b896 0%, #c4a37a 50%, #d9c5a8 100%)',
          }}
        />
      )}

      {/* ═══════════════════════════════════════════
          GUEST NAME TEXT — typewriter on the visible paper
          Appears at video t=1.5s, disappears at t=(duration-2)s
          Rotated 15° to match paper angle inside envelope
          ═══════════════════════════════════════════ */}
      {phase === 'playing' && envelopeTextVisible && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            top: '46%',
            left: '48%',
            transform: 'translate(-50%, -50%) rotate(15deg)',
            zIndex: 4,
            width: 'min(42vw, 170px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p
            className="text-center leading-tight"
            style={{
              color: '#514e3a',
              fontSize: 'clamp(11px, 3vw, 15px)',
              fontFamily: '"Noto Serif", serif',
              whiteSpace: 'pre-line',
              textShadow: 'none',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              mixBlendMode: 'multiply',
            }}
          >
            {typewriterText}
            <motion.span
              className="inline-block ml-[1px]"
              style={{ color: '#44483f' }}
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            >
              |
            </motion.span>
          </p>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════
          WAX SEAL OVERLAY — positioned over the video's envelope
          Video analysis: flap tip y=62.2%, crease y=39%
          Seal center: exactly at the flap tip (y=62.2%, x=50%)
          ═══════════════════════════════════════════ */}
      {isSealed && (
        <div className="absolute inset-0" style={{ zIndex: 5 }}>
          {/* Real Wax seal — from sello2.png */}
          {!sealBroken && (
            <motion.div
              className="absolute flex items-center justify-center pointer-events-none"
              style={{
                top: '61.2%',
                left: '46%',
                transform: 'translate(-50%, -50%)',
                width: 'min(22vw, 100px)',
                height: 'min(22vw, 100px)',
                backgroundImage: 'url(/sello2.png)',
                backgroundSize: '450% auto',
                backgroundPosition: '47.55% 63.88%',
                backgroundRepeat: 'no-repeat',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
                zIndex: 5,
              }}
            />
          )}

          {/* Seal fragments — breaking */}
          {sealBroken && (
            <div
              className="absolute"
              style={{
                top: '61.2%',
                left: '46%',
                transform: 'translate(-50%, -50%)',
                width: 'min(22vw, 100px)',
                height: 'min(22vw, 100px)',
                zIndex: 10,
              }}
            >
              <SealFragments isBreaking={true} />
            </div>
          )}

          {/* Crack line */}
          {phase === 'breaking' && (
            <motion.div
              className="absolute pointer-events-none"
              style={{
                zIndex: 20,
                top: '61.2%',
                left: '46%',
                x: '-50%',
                y: '-50%',
                width: 'min(18vw, 80px)',
                height: '2px',
                background:
                  'linear-gradient(90deg, transparent 5%, rgba(20,15,5,0.6) 15%, rgba(20,15,5,0.9) 50%, rgba(20,15,5,0.6) 85%, transparent 95%)',
                borderRadius: '2px',
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}

          {/* Tap target over the seal */}
          {phase === 'sealed' && videoReady && (
            <motion.div
              className="absolute cursor-pointer rounded-full"
              style={{
                zIndex: 25,
                top: '61.2%',
                left: '46%',
                x: '-50%',
                y: '-50%',
                width: 'min(22vw, 100px)',
                height: 'min(22vw, 100px)',
              }}
              onClick={handleSealTap}
              whileTap={{ scale: 0.94 }}
            >
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-[-10%] rounded-full border-[3px] border-white/80 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                animate={{ scale: [1, 1.35, 1.35], opacity: [1, 0, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              />
            </motion.div>
          )}

          {/* Hint text */}
          {phase === 'sealed' && videoReady && (
            <motion.p
              className="absolute left-0 right-0 text-center text-[12px] md:text-[14px] text-[#2C3525] font-sans tracking-[0.2em] uppercase font-bold"
              style={{ bottom: '10%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
            >
              Toca el sello para abrir
            </motion.p>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          CARD OVERLAY — appears after video ends
          The video stays on its last frame as background
          ═══════════════════════════════════════════ */}
      {isOpen && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ touchAction: 'none' }} // Prevent browser pull-to-refresh
        >
          {/* Invisible full-screen draggable/clickable area */}
          <motion.div
            className={`absolute inset-0 flex items-center justify-center ${isZoomed ? 'cursor-zoom-out' : 'cursor-grab active:cursor-grabbing'}`}
            drag={phase === 'pulling' && !isZoomed ? 'y' : false}
            dragConstraints={{ top: -600, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleCardDragEnd}
            onClick={() => {
              if (phase === 'pulling') {
                setIsZoomed(!isZoomed);
              }
            }}
          >
            {/* Card positioned over the video's open envelope opening */}
            {/* Video last frame: envelope center ~50%, opening starts ~38% */}
            <motion.div
              className="absolute pointer-events-none"
              style={{
                top: '36%',
                left: '50%',
                x: '-50%',
                rotate: '-1.5deg',
                width: 'min(58vw, 230px)',
                height: '26vh',
              }}
              initial={{ opacity: 0, y: '0%' }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.div className="w-full h-full relative" animate={cardControls}>
                {/* Card text */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center"
                  style={{
                    color: '#2C3525',
                    fontFamily: '"Noto Serif", serif'
                  }}
                >
                  <p className="text-[6px] sm:text-[8px] leading-snug mb-1 opacity-90 max-w-[90%] mx-auto">
                    Con nuestro amor, la bendición de Dios y la de nuestros padres
                  </p>
                  <p className="text-[7px] sm:text-[9px] mb-1">
                    Nosotros
                  </p>
                  <h2 className="text-sm sm:text-base font-bold my-1 uppercase tracking-widest">
                    Ana M. & Harold
                  </h2>
                  <p className="text-[6px] sm:text-[8px] leading-snug mt-1 opacity-90 max-w-[90%] mx-auto">
                    tenemos el honor de invitarte<br />
                    a nuestro matrimonio.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Drag / Zoom hints */}
            {phase === 'pulling' && !isZoomed && (
              <motion.div
                className="absolute left-0 right-0 flex flex-col items-center gap-2 pointer-events-none"
                style={{ bottom: '12%' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <p className="text-[10px] text-[#2C3525] font-bold font-sans tracking-[0.2em] uppercase">
                  Toca para acercar 🔍
                </p>
                <p className="text-[10px] text-[#2C3525] font-bold font-sans tracking-[0.2em] uppercase">
                  ↑ Desliza hacia arriba
                </p>
              </motion.div>
            )}

            {isZoomed && (
              <motion.p
                className="absolute left-0 right-0 text-center text-[8px] text-[#2C3525] font-bold font-sans tracking-[0.2em] uppercase pointer-events-none"
                style={{ bottom: '28%' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Toca para alejar
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
