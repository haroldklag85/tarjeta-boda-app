import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Gift, PlusCircle, ArrowRight, Leaf, X, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export default function RSVP() {
  const [invitation, setInvitation] = useState<{ id: string; group_name: string; max_guests: number } | null>(null);
  const [existingRsvpId, setExistingRsvpId] = useState<string | null>(null);
  
  // Form states
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [asistencia, setAsistencia] = useState<'si' | 'no'>('si');
  const [alergias, setAlergias] = useState('');
  const [musica, setMusica] = useState('');
  const [deseoText, setDeseoText] = useState('');
  const [invitadosExtras, setInvitadosExtras] = useState<{ id: number; nombre: string }[]>([]);
  
  // UX states
  const [nextId, setNextId] = useState(1);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText('80881308');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Load invitation details and check for existing RSVP
  useEffect(() => {
    const loadInvitationAndRsvp = async () => {
      setLoading(true);
      const code = localStorage.getItem('invitation_code');
      if (!code) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch invitation details
        const { data: invData, error: invError } = await supabase
          .from('invitations')
          .select('id, group_name, max_guests')
          .eq('code', code)
          .single();

        if (invError) {
          // If invitation is not found, we don't throw, just allow anonymous RSVP
          console.warn('Invitation code not found in Supabase:', code);
          setLoading(false);
          return;
        }
        
        if (invData) {
          setInvitation(invData);
          setNombre(invData.group_name); // Pre-populate name with group name

          // 2. Fetch existing RSVP if any
          const { data: rsvpData, error: rsvpError } = await supabase
            .from('rsvp')
            .select('id, name, phone, is_attending, allergies, wish, extra_guests, song_suggestion')
            .eq('invitation_id', invData.id)
            .maybeSingle();

          if (rsvpError) throw rsvpError;

          if (rsvpData) {
            setExistingRsvpId(rsvpData.id);
            setNombre(rsvpData.name);
            setTelefono(rsvpData.phone);
            setAsistencia(rsvpData.is_attending ? 'si' : 'no');
            setAlergias(rsvpData.allergies || '');
            setMusica(rsvpData.song_suggestion || '');
            setDeseoText(rsvpData.wish || '');
            
            if (rsvpData.extra_guests && Array.isArray(rsvpData.extra_guests)) {
              const loadedExtras = rsvpData.extra_guests.map((name: string, index: number) => ({
                id: index + 1,
                nombre: name
              }));
              setInvitadosExtras(loadedExtras);
              setNextId(loadedExtras.length + 1);
            }
          }
        }
      } catch (err) {
        console.error('Error loading invitation details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInvitationAndRsvp();
  }, []);

  // Determine allowed extra guests count
  const maxExtraGuests = invitation ? invitation.max_guests - 1 : 1; // Default to max 1 extra if no code

  const agregarInvitado = () => {
    if (invitadosExtras.length < maxExtraGuests) {
      setInvitadosExtras([...invitadosExtras, { id: nextId, nombre: '' }]);
      setNextId(nextId + 1);
    }
  };

  const removerInvitado = (id: number) => {
    setInvitadosExtras(invitadosExtras.filter(inv => inv.id !== id));
  };

  const actualizarInvitado = (id: number, nombre: string) => {
    setInvitadosExtras(invitadosExtras.map(inv => inv.id === id ? { ...inv, nombre } : inv));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) {
      setSubmitError('Por favor completa todos los campos requeridos (*).');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const extraGuestsArray = invitadosExtras
        .map(i => i.nombre.trim())
        .filter(name => name.length > 0);

      const payload = {
        invitation_id: invitation?.id || null,
        name: nombre.trim(),
        phone: telefono.trim(),
        is_attending: asistencia === 'si',
        allergies: asistencia === 'si' ? allergiesNotEmpty(alergias) : null,
        wish: wishNotEmpty(deseoText),
        extra_guests: asistencia === 'si' ? extraGuestsArray : [],
        song_suggestion: asistencia === 'si' ? songNotEmpty(musica) : null,
        updated_at: new Date().toISOString()
      };

      if (existingRsvpId) {
        const { error } = await supabase
          .from('rsvp')
          .update(payload)
          .eq('id', existingRsvpId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rsvp')
          .insert([payload]);

        if (error) throw error;
        
        // Fetch it again to get the generated RSVP ID for updates
        if (invitation?.id) {
          const { data: newRsvp } = await supabase
            .from('rsvp')
            .select('id')
            .eq('invitation_id', invitation.id)
            .maybeSingle();
          if (newRsvp) {
            setExistingRsvpId(newRsvp.id);
          }
        }
      }

      setSubmitSuccess(true);
    } catch (err) {
      console.error('Error saving RSVP:', err);
      setSubmitError('Hubo un problema de conexión al guardar tu respuesta. Por favor verifica tu conexión e intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const allergiesNotEmpty = (val: string) => {
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const wishNotEmpty = (val: string) => {
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const songNotEmpty = (val: string) => {
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <motion.div
      className="flex flex-col w-full pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Hero Image */}
      <motion.div className="w-full h-48 rounded-xl overflow-hidden mt-6 mb-12 shadow-sm" variants={itemVariants}>
        <img
          alt="Hands with wedding bands"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDimWYmRKHU0Ydd3RZBngBXSihkABe3osiWU3LrOI2uKEbaYx9c82tj81ilQQb_Ub3ySWRGyKcjcf3kAka9w7wuXzg3O1NiuncebaMie6kiXnUBbE6_OGe9IYLaAVxhS8IbmF8D48SZY2QBaUSKbTnuGsF7kMYNAg62r-1W3MOoaGUTwRywKKHvqhOa6rHUcb8_AmTfz6-LJJOy7uOJYUYGUdYAXZXA6qHlyJ4pUL3NoQQHFXPgTWM83u87Yyoh-AUnUh0lAfE4EA"
        />
      </motion.div>

      {/* RSVP Section */}
      <motion.section className="flex flex-col items-center text-center mb-16" variants={itemVariants}>
        <Mail className="text-[#D1C4B0] mb-3" size={32} strokeWidth={1.5} />
        <h1 className="text-[2.25rem] font-serif text-[#2C3525] mb-3">Asistencia</h1>
        <p className="text-[1rem] text-[#44483f] mb-12 max-w-sm">
          Por favor confírmanos tu presencia para este día tan especial.
        </p>

        {loading ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-[#8a8d86] font-medium">Buscando tu invitación...</p>
          </div>
        ) : submitSuccess ? (
          // Success State Screen
          <motion.div 
            className="w-full bg-white rounded-xl p-8 border border-[#D1C4B0]/40 shadow-sm flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CheckCircle className="text-primary mb-4" size={48} strokeWidth={1.5} />
            <h2 className="text-xl font-serif text-[#2C3525] mb-2 font-bold">¡Asistencia Confirmada!</h2>
            <p className="text-[#44483f] text-sm mb-6 max-w-xs leading-relaxed">
              {asistencia === 'si' 
                ? 'Tu confirmación ha sido guardada exitosamente. ¡Nos emociona mucho poder celebrar juntos!' 
                : 'Lamentamos que no puedas acompañarnos físicamente, te extrañaremos ese día.'}
            </p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="bg-[#e7f2da] text-primary px-6 py-2.5 rounded font-semibold text-sm hover:bg-[#d7e5c2] transition-colors"
            >
              Editar respuesta
            </button>
          </motion.div>
        ) : (
          // Form Screen
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 text-left">
            {/* Error Message */}
            {submitError && (
              <div className="bg-[#b35c44]/10 border border-[#b35c44]/20 text-[#b35c44] p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
                <span className="text-xs font-medium">{submitError}</span>
              </div>
            )}

            {/* Name Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[0.875rem] font-semibold text-[#44483f]" htmlFor="nombre">Nombre Completo *</label>
              <input
                className="w-full bg-transparent border-0 border-b border-[#D1C4B0] px-0 py-3 text-[1rem] text-[#2C3525] focus:ring-0 focus:border-primary transition-colors placeholder:text-[#c4c8bc]"
                id="nombre"
                name="nombre"
                placeholder="Ej. Familia Pérez"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            {/* Phone Input */}
            <div className="flex flex-col gap-1 mt-2">
              <label className="text-[0.875rem] font-semibold text-[#44483f]" htmlFor="telefono">Teléfono de contacto *</label>
              <input
                className="w-full bg-transparent border-0 border-b border-[#D1C4B0] px-0 py-3 text-[1rem] text-[#2C3525] focus:ring-0 focus:border-primary transition-colors placeholder:text-[#c4c8bc]"
                id="telefono"
                name="telefono"
                placeholder="Ej. 300 123 4567"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </div>

            {/* Invitados Extras */}
            {asistencia === 'si' && maxExtraGuests > 0 && (
              <div className="flex flex-col gap-4 mt-2">
                <AnimatePresence>
                  {invitadosExtras.map((invitado, index) => (
                    <motion.div
                      key={invitado.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-1 overflow-hidden"
                    >
                      <div className="flex justify-between items-center mt-2">
                        <label className="text-[0.875rem] font-semibold text-[#44483f]" htmlFor={`invitado-${invitado.id}`}>
                          Invitado adicional {index + 1} (Opcional)
                        </label>
                        <button
                          type="button"
                          onClick={() => removerInvitado(invitado.id)}
                          className="text-[#8a8d86] hover:text-[#b35c44] transition-colors p-1"
                          aria-label="Eliminar invitado"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <input
                        className="w-full bg-transparent border-0 border-b border-[#D1C4B0] px-0 py-2 text-[1rem] text-[#2C3525] focus:ring-0 focus:border-primary transition-colors placeholder:text-[#c4c8bc]"
                        id={`invitado-${invitado.id}`}
                        name={`invitado-${invitado.id}`}
                        placeholder="Nombre completo del invitado"
                        type="text"
                        value={invitado.nombre}
                        onChange={(e) => actualizarInvitado(invitado.id, e.target.value)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {invitadosExtras.length < maxExtraGuests && (
                  <button
                    onClick={agregarInvitado}
                    className="flex items-center gap-2 text-primary font-serif italic hover:opacity-80 transition-opacity w-fit mt-1"
                    type="button"
                  >
                    <PlusCircle size={20} strokeWidth={1.5} />
                    Agregar acompañante {invitadosExtras.length > 0 && `(${invitadosExtras.length}/max ${maxExtraGuests})`}
                  </button>
                )}
              </div>
            )}

            {/* Attendance Toggle */}
            <div className="flex flex-col gap-3 mt-3">
              <span className="text-[0.875rem] font-semibold text-[#44483f]">¿Nos acompañarás?</span>
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                  <input 
                    className="peer sr-only" 
                    name="asistencia" 
                    type="radio" 
                    value="si" 
                    checked={asistencia === 'si'}
                    onChange={() => setAsistencia('si')} 
                  />
                  <div className="w-full text-center py-3 border border-[#D1C4B0] rounded bg-transparent text-[#44483f] peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-colors font-medium">
                    Sí, ahí estaré
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input 
                    className="peer sr-only" 
                    name="asistencia" 
                    type="radio" 
                    value="no" 
                    checked={asistencia === 'no'}
                    onChange={() => setAsistencia('no')}
                  />
                  <div className="w-full text-center py-3 border border-[#D1C4B0] rounded bg-transparent text-[#44483f] peer-checked:bg-[#dce6cf] peer-checked:text-[#161e10] peer-checked:border-[#74786e] transition-colors font-medium">
                    No podré
                  </div>
                </label>
              </div>
            </div>

            {/* Allergies & Song Suggestion Inputs */}
            {asistencia === 'si' && (
              <>
                <div className="flex flex-col gap-1 mt-3">
                  <label className="text-[0.875rem] font-semibold text-[#44483f]" htmlFor="alergias">Restricciones alimenticias o alergias</label>
                  <input
                    className="w-full bg-transparent border-0 border-b border-[#D1C4B0] px-0 py-3 text-[1rem] text-[#2C3525] focus:ring-0 focus:border-primary transition-colors placeholder:text-[#c4c8bc]"
                    id="alergias"
                    name="alergias"
                    placeholder="Ninguna"
                    type="text"
                    value={alergias}
                    onChange={(e) => setAlergias(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1 mt-3">
                  <label className="text-[0.875rem] font-semibold text-[#44483f]" htmlFor="musica">Sugiérenos una canción para la fiesta</label>
                  <input
                    className="w-full bg-transparent border-0 border-b border-[#D1C4B0] px-0 py-3 text-[1rem] text-[#2C3525] focus:ring-0 focus:border-primary transition-colors placeholder:text-[#c4c8bc]"
                    id="musica"
                    name="musica"
                    placeholder="Ej. La Camisa Negra - Juanes"
                    type="text"
                    value={musica}
                    onChange={(e) => setMusica(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Deseo Input */}
            <div className="flex flex-col gap-1 mt-6 mb-2">
              <label className="text-[0.875rem] font-semibold text-[#44483f]" htmlFor="deseo">Un deseo para nuestro camino</label>
              <div className="relative">
                <textarea
                  className="w-full bg-transparent border-0 border-b border-[#D1C4B0] px-0 py-3 text-[1rem] text-[#2C3525] focus:ring-0 focus:border-primary transition-colors placeholder:text-[#c4c8bc] resize-none min-h-[100px]"
                  id="deseo"
                  name="deseo"
                  placeholder="Escribe aquí un consejo, un mensaje de cariño o un buen deseo para esta nueva etapa..."
                  maxLength={1000}
                  value={deseoText}
                  onChange={(e) => setDeseoText(e.target.value)}
                />
                <span className="absolute -bottom-5 right-0 text-[11px] text-[#8a8d86] font-medium tracking-wide">
                  {deseoText.length} / 1000
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={submitting}
              className="mt-12 w-full bg-primary text-white font-semibold py-4 rounded flex items-center justify-center gap-2 hover:bg-[#384c2b] transition-colors shadow-sm disabled:opacity-50"
              type="submit"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Guardando confirmación...
                </>
              ) : (
                <>
                  Confirmar Asistencia
                  <ArrowRight size={18} strokeWidth={2} />
                </>
              )}
            </button>
          </form>
        )}
      </motion.section>

      {/* Divider */}
      <motion.div className="w-full flex justify-center items-center gap-4 mb-16 opacity-50" variants={itemVariants}>
        <div className="h-px bg-[#D1C4B0] flex-1"></div>
        <Leaf className="text-[#D1C4B0]" size={16} strokeWidth={1.5} />
        <div className="h-px bg-[#D1C4B0] flex-1"></div>
      </motion.div>

      {/* Regalos Section */}
      <motion.section className="flex flex-col items-center text-center mb-12" variants={itemVariants}>
        <Gift className="text-[#D1C4B0] mb-3" size={32} strokeWidth={1.5} />
        <h2 className="text-[1.75rem] font-serif text-[#2C3525] mb-3">Mesa de Regalos</h2>
        <p className="text-[1rem] text-[#44483f] mb-6 max-w-sm">
          El mejor regalo es tu presencia, pero si deseas tener un detalle con nosotros, te compartimos nuestras opciones.
        </p>

        <div className="flex flex-col gap-4 w-full">
          {/* Lluvia de Sobres Card */}
          <div className="w-full bg-white rounded-xl p-6 border border-[#D1C4B0]/40 shadow-sm flex flex-col items-center">
            <p className="font-serif italic text-primary mb-2 text-lg">Lluvia de sobres</p>
            <p className="text-sm text-[#44483f] text-center max-w-[250px] leading-relaxed">
              Recibiremos tu lluvia de sobres con mucho amor y gratitud.
            </p>
          </div>

          {/* Bank Details Card */}
          <div className="w-full bg-white rounded-xl p-6 border border-[#D1C4B0]/40 shadow-sm flex flex-col items-center">
            <p className="font-serif italic text-primary mb-2 text-lg">Transferencia Bancaria B-BRE</p>
            <p className="text-sm text-[#44483f] mb-1">Bancolombia llave</p>
            <p className="text-sm font-semibold tracking-wider text-[#2C3525] mb-4">80881308</p>
            <button 
              onClick={handleCopy}
              className="bg-[#e7f2da] text-primary px-6 py-2 rounded font-semibold text-sm hover:bg-[#d7e5c2] transition-colors"
            >
              {copied ? '¡Copiado!' : 'Copiar llave B-BRE'}
            </button>
          </div>
        </div>
      </motion.section>

      {/* Polaroid Photo */}
      <motion.div
        className="mt-6 mb-8 flex flex-col items-center"
        initial={{ opacity: 0, y: 30, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: 2.5 }}
        transition={{ duration: 1, delay: 1.3 }}
      >
        <div className="relative bg-white p-3 pb-24 rounded-sm shadow-[0_8px_30px_rgba(44,53,37,0.12)] border border-[#D1C4B0]">
          <div className="w-56 h-64 overflow-hidden rounded-sm">
            <img
              alt="Un momento especial"
              className="w-full h-full object-cover"
              src="/fotoDos.jpeg"
            />
          </div>
          {/* Handwritten caption */}
          <p
            className="absolute bottom-4 left-0 right-0 text-center text-[0.85rem] text-[#44483f] italic px-2"
            style={{ fontFamily: '"Noto Serif", serif', lineHeight: '1.2' }}
          >
            Cuando todavía éramos amigos… <br className="hidden sm:block"/> y yo ya estaba haciendo lobby por el amor...
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
