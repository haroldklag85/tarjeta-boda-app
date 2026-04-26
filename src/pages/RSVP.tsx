import { motion } from 'framer-motion';
import { Mail, Gift, PlusCircle, ArrowRight, Leaf } from 'lucide-react';
import { useState } from 'react';

export default function RSVP() {
  const [deseoText, setDeseoText] = useState('');

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

        <form className="w-full flex flex-col gap-6 text-left">
          {/* Name Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[0.875rem] font-semibold text-[#44483f]" htmlFor="nombre">Nombre Completo</label>
            <input 
              className="w-full bg-transparent border-0 border-b border-[#D1C4B0] px-0 py-3 text-[1rem] text-[#2C3525] focus:ring-0 focus:border-primary transition-colors placeholder:text-[#c4c8bc]" 
              id="nombre" 
              name="nombre" 
              placeholder="Ej. Familia Pérez" 
              type="text"
            />
          </div>

          <div className="flex flex-col gap-3 mt-3">
            <button className="flex items-center gap-2 text-primary font-serif italic hover:opacity-80 transition-opacity w-fit" type="button">
              <PlusCircle size={20} strokeWidth={1.5} />
              + Agregar invitado
            </button>
          </div>

          {/* Attendance Toggle */}
          <div className="flex flex-col gap-3 mt-3">
            <span className="text-[0.875rem] font-semibold text-[#44483f]">¿Nos acompañarás?</span>
            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer">
                <input className="peer sr-only" name="asistencia" type="radio" value="si" defaultChecked />
                <div className="w-full text-center py-3 border border-[#D1C4B0] rounded bg-transparent text-[#44483f] peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-colors">
                  Sí, ahí estaré
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input className="peer sr-only" name="asistencia" type="radio" value="no" />
                <div className="w-full text-center py-3 border border-[#D1C4B0] rounded bg-transparent text-[#44483f] peer-checked:bg-[#dce6cf] peer-checked:text-[#161e10] peer-checked:border-[#74786e] transition-colors">
                  No podré
                </div>
              </label>
            </div>
          </div>

          {/* Allergies Input */}
          <div className="flex flex-col gap-1 mt-3">
            <label className="text-[0.875rem] font-semibold text-[#44483f]" htmlFor="alergias">Restricciones alimenticias o alergias</label>
            <input 
              className="w-full bg-transparent border-0 border-b border-[#D1C4B0] px-0 py-3 text-[1rem] text-[#2C3525] focus:ring-0 focus:border-primary transition-colors placeholder:text-[#c4c8bc]" 
              id="alergias" 
              name="alergias" 
              placeholder="Ninguna" 
              type="text"
            />
          </div>

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
            className="mt-12 w-full bg-primary text-white font-semibold py-4 rounded flex items-center justify-center gap-2 hover:bg-[#384c2b] transition-colors shadow-sm" 
            type="button"
          >
            Confirmar Asistencia
            <ArrowRight size={18} strokeWidth={2} />
          </button>
        </form>
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
        
        {/* Bank Details Card */}
        <div className="w-full bg-white rounded-xl p-6 border border-[#D1C4B0]/40 shadow-sm flex flex-col items-center">
          <p className="font-serif italic text-primary mb-2">Transferencia Bancaria</p>
          <p className="text-sm text-[#44483f] mb-1">Banco BBVA</p>
          <p className="text-sm font-semibold tracking-wider text-[#2C3525] mb-4">012 345 6789 0123 4567</p>
          <button className="bg-[#e7f2da] text-primary px-6 py-2 rounded font-semibold text-sm hover:bg-[#d7e5c2] transition-colors">
            Copiar CLABE
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}
