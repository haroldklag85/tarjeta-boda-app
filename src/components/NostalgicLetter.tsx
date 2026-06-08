import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface NostalgicLetterProps {
  message: string;
  onClose: () => void;
}

export default function NostalgicLetter({ message, onClose }: NostalgicLetterProps) {
  const letterRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [generating, setGenerating] = useState(true);
  const [pdfData, setPdfData] = useState<{ file: File; pdf: jsPDF; blob: Blob } | null>(null);

  useEffect(() => {
    // 1. Dispatch custom event to tell MainLayout to hide header, nav, and footer
    window.dispatchEvent(new CustomEvent('letter_state_change', { detail: { isOpen: true } }));

    // 2. Play the paper unfold sound
    const audio = new Audio('/papel.mp3');
    audio.volume = 0.6;
    audio.play().catch((err) => {
      console.warn('Autoplay of paper sound was blocked:', err);
    });

    // 3. Request Fullscreen (hides browser chrome on Android)
    const enterFullscreen = async () => {
      try {
        if (backdropRef.current) {
          const elem = backdropRef.current as any;
          if (elem.requestFullscreen) {
            await elem.requestFullscreen();
          } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
          } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
          }
        }
      } catch (err) {
        console.warn('Failed to enter fullscreen mode:', err);
      }
    };

    const timer = setTimeout(enterFullscreen, 100);

    // 4. Pre-generate the PDF in the background after the unfold animation stabilizes
    const generateTimer = setTimeout(async () => {
      if (!letterRef.current) return;
      try {
        // html2canvas-pro supports modern colors oklch/oklab/color-mix, so no sanitization needed!
        const canvas = await html2canvas(letterRef.current, {
          useCORS: true,
          scale: 2, // 2x resolution is perfect for PDF performance
          backgroundColor: '#f5efe6',
          logging: false,
          onclone: (_, clonedLetter) => {
            // Hide action buttons in cloned doc
            const clonedButtons = clonedLetter.querySelector('.action-buttons') as HTMLElement;
            if (clonedButtons) clonedButtons.style.display = 'none';

            // Force US Letter aspect ratio and scaling on the cloned letter container
            if (clonedLetter) {
              // US Letter width: 8.5in * 96px = 816px. Height is dynamic (auto) to support long letters.
              clonedLetter.style.width = '816px';
              clonedLetter.style.height = 'auto'; // Dynamic height
              clonedLetter.style.maxWidth = 'none';
              clonedLetter.style.transform = 'none';
              clonedLetter.style.rotate = 'none';
              clonedLetter.style.margin = '0';
              clonedLetter.style.padding = '72px 56px 56px 56px';
              clonedLetter.style.clipPath = 'none'; // Borderless print looks much better
              clonedLetter.style.borderRadius = '0';
              
              // Adjust body text font size dynamically based on message length for high readability and fit
              const textContainer = clonedLetter.querySelector('.letter-body-text') as HTMLElement;
              if (textContainer) {
                let fontSize = '38px';
                let lineHeight = '1.6';
                const len = message.length;
                
                if (len > 3500) {
                  fontSize = '18px';
                  lineHeight = '1.45';
                } else if (len > 2000) {
                  fontSize = '22px';
                  lineHeight = '1.5';
                } else if (len > 1000) {
                  fontSize = '26px';
                  lineHeight = '1.5';
                } else if (len > 600) {
                  fontSize = '32px';
                  lineHeight = '1.55';
                }
                
                textContainer.style.fontSize = fontSize;
                textContainer.style.lineHeight = lineHeight;
                
                if (len > 1000) {
                  textContainer.style.padding = '100px 30px 40px 30px';
                } else {
                  textContainer.style.padding = '80px 20px 40px 20px';
                }
              }

              // Adjust postmark/stamp position and scale
              const postmark = clonedLetter.querySelector('.postmark-section') as HTMLElement;
              if (postmark) {
                postmark.style.top = '36px';
                postmark.style.right = '36px';
                postmark.style.transform = 'scale(1.4)';
                postmark.style.transformOrigin = 'top right';
              }

              // Adjust signature layout
              const signatureSec = clonedLetter.querySelector('.signature-section') as HTMLElement;
              if (signatureSec) {
                signatureSec.style.marginTop = '48px';
                signatureSec.style.paddingTop = '32px';
                
                const label = signatureSec.querySelector('.signature-label') as HTMLElement;
                if (label) {
                  label.style.fontSize = '13px';
                  label.style.marginBottom = '8px';
                }
                
                const names = signatureSec.querySelector('.signature-names') as HTMLElement;
                if (names) {
                  names.style.fontSize = '44px';
                  names.style.gap = '20px';
                }
              }
            }
          }
        });

        // Create PDF
        const imgWidth = 8.5; // US Letter width in inches
        const pageHeight = 11; // US Letter height in inches
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'in',
          format: 'letter'
        });

        let position = 0;
        
        // Page 1
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        
        // Subsequent pages (sliced dynamically)
        let remainingHeight = imgHeight - pageHeight;
        let pageNum = 1;
        while (remainingHeight > 0) {
          pdf.addPage();
          position = -(pageNum * pageHeight);
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          remainingHeight -= pageHeight;
          pageNum++;
        }

        const fileName = 'nuestra_carta_de_boda.pdf';
        const pdfBlob = pdf.output('blob');
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

        setPdfData({ file, pdf, blob: pdfBlob });
      } catch (err) {
        console.error('Error pre-generating nostalgic letter PDF in background:', err);
      } finally {
        setGenerating(false);
      }
    }, 1500);

    // Clean up event, timers, and exit fullscreen on unmount
    return () => {
      clearTimeout(timer);
      clearTimeout(generateTimer);
      window.dispatchEvent(new CustomEvent('letter_state_change', { detail: { isOpen: false } }));
      
      try {
        const doc = document as any;
        if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (doc.webkitExitFullscreen) {
            doc.webkitExitFullscreen();
          } else if (doc.msExitFullscreen) {
            doc.msExitFullscreen();
          }
        }
      } catch (err) {
        console.warn('Failed to exit fullscreen mode:', err);
      }
    };
  }, [message]);

  const handleDownload = async () => {
    if (!pdfData || downloading) return;
    
    setDownloading(true);

    if (navigator.canShare && navigator.canShare({ files: [pdfData.file] })) {
      try {
        await navigator.share({
          files: [pdfData.file],
          title: 'Nuestra Carta de Boda',
          text: 'Aquí tienes nuestra carta de boda personalizada.',
        });
      } catch (shareErr: any) {
        // User aborted share sheet, or WebView blocked it
        if (shareErr.name !== 'AbortError') {
          console.error('Error sharing file via Web Share API:', shareErr);
          fallbackSave(pdfData);
        }
      } finally {
        setDownloading(false);
      }
    } else {
      fallbackSave(pdfData);
      setDownloading(false);
    }
  };

  const fallbackSave = (data: { file: File; pdf: jsPDF; blob: Blob }) => {
    const fileName = 'nuestra_carta_de_boda.pdf';
    // Check for iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
      try {
        // Open PDF in a new tab so user can use iOS native Safari PDF viewer & share options
        const fileURL = URL.createObjectURL(data.blob);
        const newWindow = window.open(fileURL, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Fallback if blocked by Safari popup blocker
          data.pdf.save(fileName);
        }
      } catch (err) {
        console.error('Failed to open PDF in new tab, falling back to direct save:', err);
        data.pdf.save(fileName);
      }
    } else {
      // Standard save on Android/Desktop
      data.pdf.save(fileName);
    }
  };

  const len = message.length;
  let fontSize = 'clamp(21px, 5.8vw, 26px)';
  let lineHeight = '1.45';
  let paddingY = 'py-4';
  let contentSpacing = 'mt-12 mb-6';

  if (len > 2500) {
    fontSize = 'clamp(15px, 4.2vw, 17px)';
    lineHeight = '1.3';
    paddingY = 'py-1';
    contentSpacing = 'mt-6 mb-2';
  } else if (len > 1500) {
    fontSize = 'clamp(17px, 4.5vw, 19px)';
    lineHeight = '1.35';
    paddingY = 'py-2';
    contentSpacing = 'mt-8 mb-3';
  } else if (len > 800) {
    fontSize = 'clamp(19px, 5vw, 22px)';
    lineHeight = '1.4';
    paddingY = 'py-3';
    contentSpacing = 'mt-10 mb-4';
  }

  return (
    <motion.div
      ref={backdropRef}
      className="fixed inset-0 w-full h-full bg-black/85 backdrop-blur-md flex justify-center p-4 z-[999] overflow-y-auto items-start sm:items-center py-8 sm:py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 3D Paper Unfolding Container */}
      <motion.div
        ref={letterRef}
        id="nostalgic-letter-paper"
        className="relative w-full max-w-[360px] sm:max-w-md bg-[#f5efe6] shadow-[0_20px_60px_rgba(0,0,0,0.5),_inset_0_0_50px_rgba(77,55,37,0.2)] border border-[#e8dfcf] p-8 pb-10 flex flex-col justify-between my-auto flex-shrink-0"
        style={{
          perspective: 1200,
          transformStyle: 'preserve-3d',
          // Organic hand-cut paper edge simulation using CSS clip-path
          clipPath: 'polygon(0% 0.5%, 25% 0%, 50% 0.5%, 75% 0%, 100% 0.5%, 99.5% 25%, 100% 50%, 99.5% 75%, 100% 99.5%, 75% 100%, 50% 99.5%, 25% 100%, 0% 99.5%, 0.5% 75%, 0% 50%, 0.5% 25%)',
          backgroundImage: 'radial-gradient(circle, transparent 20%, #f5efe6 20%, #f5efe6 80%, rgba(220, 205, 180, 0.1) 100%)',
        }}
        initial={{ opacity: 0, rotateX: 65, scale: 0.85, y: 80 }}
        animate={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
        exit={{ opacity: 0, rotateX: -45, scale: 0.9, y: -50 }}
        transition={{ type: 'spring', stiffness: 90, damping: 14, duration: 1 }}
      >
        {/* Horizontal Fold Creases - Divider into 3 parts */}
        <div 
          className="absolute top-[33.3%] left-0 right-0 h-[4px] pointer-events-none opacity-45 mix-blend-multiply z-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(77,55,37,0.18) 0%, rgba(255,255,255,0.4) 50%, rgba(77,55,37,0.08) 100%)',
            boxShadow: '0 0.5px 1px rgba(77,55,37,0.05)'
          }}
        />
        <div 
          className="absolute top-[66.6%] left-0 right-0 h-[4px] pointer-events-none opacity-45 mix-blend-multiply z-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(77,55,37,0.18) 0%, rgba(255,255,255,0.4) 50%, rgba(77,55,37,0.08) 100%)',
            boxShadow: '0 0.5px 1px rgba(77,55,37,0.05)'
          }}
        />
 
        {/* Retro Postal Cancel Mark & Stamp */}
        <div className="postmark-section absolute top-5 right-5 flex items-center gap-3 pointer-events-none select-none opacity-80 z-10">
          {/* Cancel Mark (Circular ink lines) */}
          <div className="relative w-16 h-16 border border-[#4d3725]/30 rounded-full flex items-center justify-center rotate-12">
            <div className="absolute inset-2 border border-dashed border-[#4d3725]/30 rounded-full" />
            <span className="font-serif text-[7px] text-[#4d3725]/45 uppercase tracking-widest text-center leading-none">
              CORREO AÉREO<br />1996
            </span>
            <div className="absolute w-[120%] h-px bg-[#4d3725]/25 -rotate-12" />
            <div className="absolute w-[120%] h-px bg-[#4d3725]/25 -rotate-45" />
          </div>
 
          {/* Sello Postal (Postage Stamp) */}
          <div 
            className="w-11 h-13 bg-[#eedec4] border-2 border-dashed border-[#cbb898] p-1 flex flex-col justify-between shadow-sm relative overflow-hidden"
            style={{ transform: 'rotate(-4deg)' }}
          >
            <div className="w-full h-full border border-[#cbb898] bg-[#f5efe6] flex flex-col items-center justify-center p-0.5">
              <span className="font-serif text-[4.5px] text-[#cbb898] tracking-tighter uppercase leading-none">Matrimonio</span>
              <span className="font-serif text-[8px] font-bold text-[#8f7959] mt-0.5 leading-none">H&A</span>
              <span className="font-serif text-[4.5px] text-[#cbb898] tracking-widest mt-0.5 leading-none">11.27.26</span>
            </div>
            {/* Stamp serrated edge simulation */}
            <div className="absolute inset-0 border-[3px] border-double border-[#eedec4] pointer-events-none" />
          </div>
        </div>
 
        {/* Nostalgic Coffee Stain / Aging marks */}
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-[#b59e7f]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-24 -left-8 w-20 h-20 bg-[#b59e7f]/15 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-[40%] right-[-10px] w-24 h-24 bg-[#8b6b4e]/10 rounded-full blur-2xl pointer-events-none" />
 
        {/* Letter Content */}
        <div className={`${contentSpacing} flex-grow flex-1 flex flex-col justify-between`}>
          {/* Main Body with Caveat Font (Legible, real handwriting look) */}
          <div 
            className={`letter-body-text text-[#4d3725] px-3 flex-grow flex items-center justify-center text-center ${paddingY}`}
            style={{
              fontFamily: '"Caveat", cursive',
              fontSize: fontSize,
              lineHeight: lineHeight,
              mixBlendMode: 'multiply',
              wordBreak: 'break-word',
              textShadow: '0.4px 0.4px 0px rgba(255,255,255,0.7)'
            }}
          >
            <p className="whitespace-pre-line">
              {message.replace(/\\n/g, '\n')}
            </p>
          </div>
 
          {/* Handwritten Signatures */}
          <div className="signature-section mt-4 flex flex-col items-center border-t border-[#8f7959]/20 pt-4">
            <span className="signature-label font-serif italic text-[#8f7959] text-[9px] uppercase tracking-widest opacity-80 mb-1">Con amor,</span>
            <div 
              className="signature-names flex justify-center items-center gap-4 text-[#4d3725] opacity-95 select-none text-2xl"
              style={{ fontFamily: '"Sacramento", cursive' }}
            >
              <span>Ana Maria</span>
              <span className="text-red-700/40 text-sm">❤</span>
              <span>Harold</span>
            </div>
          </div>
        </div>
 
        {/* Action Buttons & Close Icon Centered Below */}
        <div className="action-buttons flex flex-col items-center mt-2 pt-3 border-t border-[#8f7959]/10 gap-3">
          {/* Save Button */}
          <button
            onClick={handleDownload}
            disabled={generating || downloading}
            className="flex items-center justify-center gap-2 bg-[#8f7959] hover:bg-[#726046] text-white px-5 py-2.5 rounded font-semibold text-xs transition-colors shadow-md disabled:opacity-50 cursor-pointer w-full"
          >
            <Download size={14} />
            {generating 
              ? 'Preparando carta...' 
              : downloading 
                ? 'Guardando...' 
                : 'Guardar Carta'}
          </button>
 
          {/* Centered Close Icon / Link at the end */}
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 text-[#8f7959] hover:text-[#4d3725] transition-colors text-xs font-semibold py-2 hover:underline cursor-pointer"
          >
            <X size={14} />
            Cerrar y volver
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
