import { motion, AnimatePresence } from 'framer-motion';
import { Church, Wine, Utensils, PartyPopper, Shirt, MapPin, Navigation, X } from 'lucide-react';
import { useState } from 'react';

export default function Location() {
  const [showMapOptions, setShowMapOptions] = useState(false);

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
      className="flex flex-col gap-20 w-full pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header Section */}
      <motion.section className="text-center mt-4" variants={itemVariants}>
        <h2 className="text-[2.25rem] text-primary mb-3 font-serif leading-tight">
          Logística<br />
          <span className="italic text-[#544b3c] text-[1.75rem]">e</span> Itinerario
        </h2>
        <p className="text-[1.125rem] text-[#44483f] max-w-md mx-auto leading-relaxed">
          Acompáñanos a celebrar nuestra unión. Aquí encontrarás los detalles de nuestro día.
        </p>
      </motion.section>

      {/* Itinerary (Timeline) */}
      <motion.section className="relative w-full" variants={itemVariants}>
        {/* Connecting Line (Desktop only technically, but we can keep it relative) */}
        <div className="absolute left-6 top-6 bottom-6 w-px bg-[#D1C4B0] opacity-50 hidden md:block"></div>

        <div className="flex flex-col gap-12 relative">

          {/* Event 1: Ceremonia */}
          <div className="flex flex-col md:flex-row gap-6 items-start group">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e7f2da] flex items-center justify-center border border-[#D1C4B0] relative z-10 shadow-sm">
              <Church className="text-primary" size={20} strokeWidth={1.5} />
            </div>
            <div className="bg-white rounded-xl p-6 border border-[#D1C4B0]/40 w-full shadow-sm hover:bg-[#e7f2da]/30 transition-colors duration-300">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-xl font-serif text-[#2C3525]">Ceremonia Religiosa</h3>
                <span className="text-sm font-semibold text-[#566247]">16:00 hrs</span>
              </div>
              <p className="text-[#44483f] mb-3">Parroquia de San Miguel Arcángel. Solicitamos puntualidad para dar inicio a la celebración.</p>
              <a href="https://maps.app.goo.gl/gHeK8PrupLjzwroq5" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary text-sm font-semibold hover:opacity-80 transition-opacity">
                <MapPin size={16} />
                Ver en el mapa
              </a>
            </div>
          </div>

          {/* Event 2: Cóctel */}
          <div className="flex flex-col md:flex-row gap-6 items-start group">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e7f2da] flex items-center justify-center border border-[#D1C4B0] relative z-10 shadow-sm">
              <Wine className="text-primary" size={20} strokeWidth={1.5} />
            </div>
            <div className="bg-white rounded-xl p-6 border border-[#D1C4B0]/40 w-full shadow-sm hover:bg-[#e7f2da]/30 transition-colors duration-300">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-xl font-serif text-[#2C3525]">Cóctel de Bienvenida</h3>
                <span className="text-sm font-semibold text-[#566247]">17:30 hrs</span>
              </div>
              <p className="text-[#44483f]">Jardín Principal de la Hacienda. Disfruta de bebidas frescas y bocadillos mientras llegan los novios.</p>
            </div>
          </div>

          {/* Event 3: Banquete */}
          <div className="flex flex-col md:flex-row gap-6 items-start group">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e7f2da] flex items-center justify-center border border-[#D1C4B0] relative z-10 shadow-sm">
              <Utensils className="text-primary" size={20} strokeWidth={1.5} />
            </div>
            <div className="bg-white rounded-xl p-6 border border-[#D1C4B0]/40 w-full shadow-sm hover:bg-[#e7f2da]/30 transition-colors duration-300">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-xl font-serif text-[#2C3525]">Banquete</h3>
                <span className="text-sm font-semibold text-[#566247]">19:00 hrs</span>
              </div>
              <p className="text-[#44483f]">Cena de tres tiempos servida en el Salón Terraza. Favor de ubicar su mesa en el seating plan.</p>
            </div>
          </div>

          {/* Event 4: Fiesta */}
          <div className="flex flex-col md:flex-row gap-6 items-start group">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e7f2da] flex items-center justify-center border border-[#D1C4B0] relative z-10 shadow-sm">
              <PartyPopper className="text-primary" size={20} strokeWidth={1.5} />
            </div>
            <div className="bg-white rounded-xl p-6 border border-[#D1C4B0]/40 w-full shadow-sm hover:bg-[#e7f2da]/30 transition-colors duration-300">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-xl font-serif text-[#2C3525]">Fiesta</h3>
                <span className="text-sm font-semibold text-[#566247]">21:00 hrs</span>
              </div>
              <p className="text-[#44483f]">¡A celebrar! Música en vivo, baile y barra libre hasta el amanecer.</p>
            </div>
          </div>

        </div>
      </motion.section>

      {/* Dress Code Section */}
      <motion.section className="w-full relative overflow-hidden rounded-xl bg-[#edf7df] border border-[#D1C4B0]/30 p-8 sm:p-12 text-center flex flex-col items-center justify-center shadow-sm" variants={itemVariants}>
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#556b47] rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#d7e5c2] rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 flex flex-col items-center w-full">
          <Shirt className="text-primary mb-3" size={36} strokeWidth={1.5} />
          <h2 className="text-[1.75rem] font-serif text-[#2C3525] mb-1">Dress Code</h2>
          <p className="text-xl font-serif text-primary italic mb-4">Elegancia Cálida</p>

          <p className="text-[0.95rem] text-[#44483f] mb-6 leading-relaxed max-w-sm">
            Nuestra boda será en tierra caliente, por eso les sugerimos un estilo formal tropical: fresco, cómodo y elegante.
          </p>

          <div className="flex flex-col gap-6 justify-center mt-2 border-t border-[#D1C4B0]/50 pt-6 w-full max-w-md">
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-bold text-[#2C3525] uppercase tracking-wider">Mujeres</span>
              <span className="text-sm text-[#44483f] leading-relaxed">Vestidos largos o trajes elegantes. <br/><span className="italic">Agradecemos evitar blanco, marfil y beige.</span></span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-bold text-[#2C3525] uppercase tracking-wider">Hombres</span>
              <span className="text-sm text-[#44483f] leading-relaxed">Pantalón formal liviano en lino o drill elegante, con camisa elegante.</span>
            </div>
          </div>

          <p className="mt-8 text-xs text-[#566247] italic font-medium opacity-90 max-w-xs">
            * Agradecemos evitar prendas deportivas, bermudas, pantalonetas o tenis.
          </p>
        </div>
      </motion.section>

      {/* Location/Map Section */}
      <motion.section className="w-full flex flex-col gap-3" variants={itemVariants}>
        <h2 className="text-[1.75rem] font-serif text-[#2C3525] text-center mb-2">Ubicación</h2>
        <div className="w-full h-64 rounded-xl overflow-hidden border border-[#D1C4B0]/40 relative shadow-[0_4px_20px_rgba(44,53,37,0.05)] bg-[#F2EFE9]">
          <iframe 
            src="https://maps.google.com/maps?q=Casa+de+Campo+Diana+Carolina,+Rivera,+Huila&t=&z=15&ie=UTF8&iwloc=&output=embed" 
            className="w-full h-[150%] -mt-10 object-cover opacity-60 grayscale-[50%] pointer-events-none" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy"
            title="Mapa de Ubicación"
          ></iframe>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#F2EFE9] via-[#F2EFE9]/60 to-transparent flex flex-col justify-end p-6 pointer-events-none">
            <h3 className="text-xl font-serif text-[#2C3525] mb-1">Hacienda Casa de Campo Diana Carolina</h3>
            <p className="text-[#44483f] mb-4 text-sm">Huila, Carretera a Rivera</p>
            <button 
              onClick={() => setShowMapOptions(true)}
              className="pointer-events-auto bg-white/90 backdrop-blur-md border border-primary text-primary px-4 py-2 rounded text-sm font-semibold w-fit hover:bg-primary hover:text-white transition-colors block text-center mt-2 shadow-sm"
            >
              Abrir en Maps
            </button>
          </div>
        </div>
      </motion.section>

      {/* Map Options Modal */}
      <AnimatePresence>
        {showMapOptions && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMapOptions(false)}
          >
            <motion.div 
              className="bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 shadow-xl flex flex-col gap-4"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-serif text-xl text-[#2C3525]">Elegir aplicación</h3>
                <button onClick={() => setShowMapOptions(false)} className="text-[#8a8d86] hover:text-[#2C3525] transition-colors p-1">
                  <X size={20} />
                </button>
              </div>
              
              <a 
                href="https://maps.app.goo.gl/gHeK8PrupLjzwroq5" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border border-[#D1C4B0] hover:bg-[#e7f2da]/30 transition-colors"
                onClick={() => setShowMapOptions(false)}
              >
                <MapPin className="text-primary" size={20} />
                <span className="font-semibold text-[#44483f]">Google Maps</span>
              </a>

              <a 
                href="https://waze.com/ul?q=Hacienda%20Casa%20de%20Campo%20Diana%20Carolina%20Rivera%20Huila" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border border-[#D1C4B0] hover:bg-[#e7f2da]/30 transition-colors"
                onClick={() => setShowMapOptions(false)}
              >
                <Navigation className="text-primary" size={20} />
                <span className="font-semibold text-[#44483f]">Waze</span>
              </a>
              
              <div className="h-4 sm:hidden"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
