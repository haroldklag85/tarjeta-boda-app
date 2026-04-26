import { motion } from 'framer-motion';
import { Shirt, Clock, Baby, Wine, Zap, Car } from 'lucide-react';

export default function Info() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div 
      className="flex flex-col w-full pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header Section */}
      <motion.section className="text-center mb-12 mt-4" variants={itemVariants}>
        <h2 className="text-[2.25rem] font-serif text-primary mb-6 uppercase tracking-wider">
          Recomendaciones
        </h2>
        <p className="text-[1rem] text-[#44483f] max-w-md mx-auto italic">
          Queremos que disfruten esta celebración con alegría, comodidad y mucho amor.
        </p>
      </motion.section>

      {/* Content List */}
      <motion.section className="relative w-full" variants={itemVariants}>
        <div className="flex flex-col gap-12 relative">
          
          {/* Card 1: Dress Code */}
          <div className="flex flex-col gap-3 items-center text-center">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e7f2da] flex items-center justify-center border border-[#D1C4B0] shadow-sm">
              <Shirt className="text-primary" size={20} strokeWidth={1.5} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(44,53,37,0.05)] w-full border border-[#D1C4B0]/20">
              <h3 className="text-[1.25rem] font-serif text-[#2C3525] mb-2">Código de Vestimenta</h3>
              <p className="text-[1rem] text-[#44483f]">
                Nuestra boda será en tierra caliente, por eso les sugerimos asistir con ropa fresca, cómoda y elegante. También recomendamos elegir un calzado apropiado para disfrutar cada momento, desde la ceremonia hasta la última canción.
              </p>
            </div>
          </div>

          {/* Card 2: Punctuality */}
          <div className="flex flex-col gap-3 items-center text-center">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e7f2da] flex items-center justify-center border border-[#D1C4B0] shadow-sm">
              <Clock className="text-primary" size={20} strokeWidth={1.5} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(44,53,37,0.05)] w-full border border-[#D1C4B0]/20">
              <h3 className="text-[1.25rem] font-serif text-[#2C3525] mb-2">Puntualidad</h3>
              <p className="text-[1rem] text-[#44483f]">
                La ceremonia comenzará puntualmente a las 14:00 hrs. Agradecemos su llegada con anticipación para tomar sus lugares con calma y disfrutar de la bienvenida.
              </p>
            </div>
          </div>

          {/* Card 3: Adult Only */}
          <div className="flex flex-col gap-3 items-center text-center">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e7f2da] flex items-center justify-center border border-[#D1C4B0] shadow-sm">
              <Baby className="text-primary" size={20} strokeWidth={1.5} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(44,53,37,0.05)] w-full border border-[#D1C4B0]/20">
              <h3 className="text-[1.25rem] font-serif text-[#2C3525] mb-2">Solo Adultos</h3>
              <p className="text-[1rem] text-[#44483f]">
                Amamos a sus pequeños, pero para que todos podamos disfrutar, relajarnos y celebrar al máximo, nuestra recepción será exclusivamente para adultos.
              </p>
            </div>
          </div>

          {/* Card 4: Australian Bar */}
          <div className="flex flex-col gap-3 items-center text-center">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e7f2da] flex items-center justify-center border border-[#D1C4B0] shadow-sm">
              <Wine className="text-primary" size={20} strokeWidth={1.5} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(44,53,37,0.05)] w-full border border-[#D1C4B0]/20">
              <h3 className="text-[1.25rem] font-serif text-[#2C3525] mb-2">Australian Bar</h3>
              <p className="text-[1rem] text-[#44483f]">
                Durante el evento tendremos bebidas disponibles y, adicionalmente, contaremos con un bar estilo australiano para quienes deseen consumir opciones extra.
              </p>
            </div>
          </div>

          {/* Card 5: EV Charging */}
          <div className="flex flex-col gap-3 items-center text-center">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e7f2da] flex items-center justify-center border border-[#D1C4B0] shadow-sm">
              <Zap className="text-primary" size={20} strokeWidth={1.5} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(44,53,37,0.05)] w-full border border-[#D1C4B0]/20">
              <h3 className="text-[1.25rem] font-serif text-[#2C3525] mb-2">Carga Eléctrica</h3>
              <p className="text-[1rem] text-[#44483f]">
                Pensando en la comodidad de todos nuestros invitados, el estacionamiento del recinto cuenta con estaciones de carga disponibles para vehículos eléctricos.
              </p>
            </div>
          </div>

          {/* Card 6: Designated Driver */}
          <div className="flex flex-col gap-3 items-center text-center">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e7f2da] flex items-center justify-center border border-[#D1C4B0] shadow-sm">
              <Car className="text-primary" size={20} strokeWidth={1.5} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(44,53,37,0.05)] w-full border border-[#D1C4B0]/20">
              <h3 className="text-[1.25rem] font-serif text-[#2C3525] mb-2">Conductor Designado</h3>
              <p className="text-[1rem] text-[#44483f]">
                Queremos que la pasen increíble y regresen a casa con bien. Si van a tomar, por favor no manejen. Sugerimos organizar su transporte o asignar un conductor designado.
              </p>
            </div>
          </div>

        </div>
      </motion.section>
    </motion.div>
  );
}
