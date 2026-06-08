import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, CheckCircle2, AlertTriangle, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function SharePhotos() {
  const [guestName, setGuestName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';

  // Load name from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('guest_photo_name');
    if (savedName) {
      setGuestName(savedName);
      setNameSubmitted(true);
    }
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName.trim().length < 3) {
      setErrorMessage('Por favor ingresa tu nombre completo (mínimo 3 letras).');
      return;
    }
    setErrorMessage(null);
    localStorage.setItem('guest_photo_name', guestName.trim());
    setNameSubmitted(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    
    // Create preview URLs
    const newPreviews = filesArray.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...filesArray]);
    setPreviews(prev => [...prev, ...newPreviews]);
    setErrorMessage(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const uploadPhotos = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage('Por favor selecciona al menos una foto.');
      return;
    }

    setUploading(true);
    setErrorMessage(null);
    setUploadProgress({ current: 0, total: selectedFiles.length, percentage: 0 });

    const invitationCode = localStorage.getItem('invitation_code') || null;
    let completedCount = 0;

    try {
      for (const file of selectedFiles) {
        // Update progress state for current file
        const currentPercentage = Math.round((completedCount / selectedFiles.length) * 100);
        setUploadProgress(prev => ({
          ...prev,
          current: completedCount + 1,
          percentage: currentPercentage
        }));

        if (!googleScriptUrl) {
          // Simulation mode if script URL is not configured
          await new Promise(resolve => setTimeout(resolve, 800));
        } else {
          // Real upload to Google Drive via Google Apps Script Web App
          const base64Data = await fileToBase64(file);
          
          // Construct filename: GuestName_Timestamp_OriginalName
          const cleanGuestName = guestName.trim().replace(/[^a-zA-Z0-9]/g, '_');
          const timestamp = Date.now();
          const filename = `${cleanGuestName}_${timestamp}_${file.name}`;

          await fetch(googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors', // Opaque response due to Apps Script redirect/CORS constraints
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename: filename,
              mimeType: file.type,
              data: base64Data
            })
          });
        }

        completedCount++;
      }

      setUploadProgress(prev => ({
        ...prev,
        current: selectedFiles.length,
        percentage: 100
      }));

      // Log upload stats to Supabase for traceability
      try {
        await supabase
          .from('photo_uploads')
          .insert([{
            guest_name: guestName.trim(),
            invitation_code: invitationCode,
            photo_count: selectedFiles.length
          }]);
      } catch (supabaseErr) {
        // Non-blocking log error
        console.warn('Could not save traceability record in Supabase:', supabaseErr);
      }

      // Cleanup previews
      previews.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviews([]);
      setUploadSuccess(true);

    } catch (err) {
      console.error('Error uploading photos:', err);
      setErrorMessage('Hubo un problema al subir las fotos. Por favor inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2EFE9] text-[#44483f] flex flex-col font-sans px-4 py-8 relative">
      {/* Background silk overlay/grain texture simulation */}
      <div className="absolute inset-0 bg-[url('/textura-papel.png')] opacity-5 pointer-events-none" />

      <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-white border border-[#D1C4B0] flex items-center justify-center mx-auto shadow-sm mb-4">
            <span className="font-serif text-[#2C3525] text-xl font-bold">H&A</span>
          </div>
          <h1 className="font-serif text-2xl text-[#2C3525] font-bold">Fotos del Recuerdo</h1>
          <p className="text-xs text-[#8a8d86] mt-1.5 italic">Comparte con nosotros la alegría de este día</p>
        </div>

        {/* Card Body */}
        <div className="bg-white rounded-2xl border border-[#D1C4B0]/40 shadow-[0_8px_30px_rgba(44,53,37,0.06)] p-6 flex flex-col">
          
          <AnimatePresence mode="wait">
            {/* Step 1: Input Name */}
            {!nameSubmitted && (
              <motion.form
                key="name-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleNameSubmit}
                className="flex flex-col gap-4"
              >
                <div className="text-center mb-2">
                  <h2 className="font-serif text-lg text-[#2C3525] font-semibold">¿Quién nos comparte fotos?</h2>
                  <p className="text-xs text-[#8a8d86] mt-1">Ingresa tu nombre para saber quién tomó estas hermosas fotos.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Nombre Completo</label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FBFBFA] border border-[#D1C4B0] rounded-xl focus:ring-0 focus:border-primary placeholder-[#c4c8bc] text-sm text-[#2C3525] font-medium transition-colors"
                  />
                </div>

                {errorMessage && (
                  <div className="bg-[#b35c44]/10 border border-[#b35c44]/20 rounded-xl p-3 text-xs text-[#b35c44] flex items-center gap-2">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-primary hover:bg-[#384c2b] text-white text-sm font-semibold shadow-sm transition-colors mt-2"
                >
                  Continuar
                </button>
              </motion.form>
            )}

            {/* Step 2: Upload Files */}
            {nameSubmitted && !uploadSuccess && (
              <motion.div
                key="upload-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-5"
              >
                {/* User Greeting */}
                <div className="flex justify-between items-center border-b border-[#D1C4B0]/20 pb-3">
                  <span className="text-xs text-[#8a8d86]">
                    Subiendo como: <strong className="text-[#2C3525]">{guestName}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setNameSubmitted(false);
                      setErrorMessage(null);
                    }}
                    disabled={uploading}
                    className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    Cambiar nombre
                  </button>
                </div>

                {/* File input widget */}
                {!uploading && (
                  <div className="relative">
                    <input
                      type="file"
                      id="photos"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-15"
                    />
                    <div className="border-2 border-dashed border-[#D1C4B0] rounded-2xl p-8 text-center bg-[#FBFBFA] flex flex-col items-center gap-3 hover:bg-[#F2EFE9]/20 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-[#e7f2da] text-primary flex items-center justify-center">
                        <Camera size={22} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#2C3525]">Presiona para abrir la cámara</p>
                        <p className="text-xs text-[#8a8d86] mt-1">o selecciona fotos de tu galería</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Previews area */}
                {previews.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">
                      Seleccionadas ({selectedFiles.length})
                    </span>
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                      {previews.map((preview, index) => (
                        <div key={index} className="aspect-square rounded-lg relative overflow-hidden group border border-[#D1C4B0]/30 shadow-sm bg-stone-100">
                          <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
                          {!uploading && (
                            <button
                              onClick={() => removeFile(index)}
                              className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/85 text-white rounded-full transition-colors"
                              title="Remover foto"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Uploading progress indicator */}
                {uploading && (
                  <div className="bg-[#FBFBFA] border border-[#D1C4B0]/40 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-primary">
                        <Loader2 className="animate-spin h-3.5 w-3.5" />
                        Subiendo fotos...
                      </span>
                      <span className="text-[#2C3525]">
                        {uploadProgress.current} de {uploadProgress.total}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-[#EAE7DF] rounded-full h-2 overflow-hidden border border-[#D1C4B0]/20">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Status Warnings */}
                {!googleScriptUrl && !uploading && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2 leading-relaxed">
                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Modo Simulación:</strong> El endpoint de Google Drive no está configurado aún en el servidor. Las subidas se simularán de forma segura para demostración.
                    </span>
                  </div>
                )}

                {errorMessage && (
                  <div className="bg-[#b35c44]/10 border border-[#b35c44]/20 rounded-xl p-3 text-xs text-[#b35c44] flex items-center gap-2">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Upload Button */}
                {!uploading && selectedFiles.length > 0 && (
                  <button
                    onClick={uploadPhotos}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-[#384c2b] text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={16} />
                    Subir {selectedFiles.length} {selectedFiles.length === 1 ? 'Foto' : 'Fotos'} a Google Drive
                  </button>
                )}
              </motion.div>
            )}

            {/* Step 3: Success View */}
            {uploadSuccess && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-[#e7f2da] text-primary flex items-center justify-center shadow-sm">
                  <CheckCircle2 size={36} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="font-serif text-lg text-[#2C3525] font-bold">¡Fotos subidas con éxito!</h2>
                  <p className="text-xs text-[#8a8d86] mt-2 max-w-xs mx-auto leading-relaxed">
                    Muchas gracias por dejarnos este recuerdo en nuestro álbum compartido. Puedes seguir tomando y subiendo más fotos en cualquier momento.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 w-full mt-4">
                  <button
                    onClick={() => {
                      setUploadSuccess(false);
                      setSelectedFiles([]);
                      setPreviews([]);
                    }}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-[#384c2b] text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera size={16} />
                    Subir más fotos
                  </button>
                  <a
                    href="/"
                    className="w-full py-2.5 rounded-xl border border-[#D1C4B0] hover:bg-[#F2EFE9]/50 text-xs font-semibold text-[#566247] flex items-center justify-center gap-2 transition-colors"
                  >
                    <ArrowLeft size={12} />
                    Volver a la invitación
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
