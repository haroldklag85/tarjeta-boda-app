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
      <motion.section className="text-center mb-12 mt-4 px-2" variants={itemVariants}>
        <h2 className="text-[1.75rem] sm:text-[2.25rem] font-serif text-primary mb-6 uppercase tracking-wider break-words">
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
              <h3 className="text-[1.25rem] font-serif text-[#2C3525] mb-4">Código de Vestimenta</h3>

              <div className="flex flex-col gap-4 text-left text-[0.95rem] text-[#44483f]">
                <p>
                  <span className="font-serif italic text-primary font-bold">Elegancia cálida</span>, nuestra boda será en Rivera, Huila, en un ambiente natural, cálido y muy alegre. Les sugerimos asistir con un estilo formal tropical: elegante, fresco y cómodo para disfrutar la tarde y la noche.
                </p>
                <p>
                  <span className="font-bold text-[#2C3525]">Para ellas</span>, recomendamos vestidos largos o trajes elegantes en tonos cálidos y naturales. Agradecemos evitar el blanco, marfil, beige o tonos muy claros similares, reservados para la novia.
                </p>
                <p>
                  <span className="font-bold text-[#2C3525]">Para ellos</span>, sugerimos pantalón formal liviano, en lino o drill elegante, acompañado de camisa elegante de manga larga o manga corta. Por el clima, no será necesario usar saco o blazer.
                </p>
                <p className="italic text-[0.85rem] text-[#566247]">
                  Les agradecemos evitar prendas deportivas o demasiado informales, como bermudas, pantalonetas o tenis.
                </p>
                <p className="text-center font-medium text-primary mt-2">
                  Vengan cómodos, elegantes y listos para celebrar con mucha alegría.
                </p>
              </div>

              {/* Color Palette */}
              <div className="mt-8 border-t border-[#D1C4B0]/30 pt-6">
                <h4 className="text-sm font-serif text-[#2C3525] mb-4 text-center">Paleta de Colores Sugerida</h4>
                <div className="grid grid-cols-6 gap-2 sm:gap-3 justify-items-center max-w-[280px] mx-auto">
                  {[
                    '#6B705C', '#A3A380', '#B35C44', '#A65F46', '#D1A14A', '#D8A7A7',
                    '#A9C5D3', '#3F6F73', '#B8734B', '#7B3F4C', '#5A3E2B', '#B08A5A'
                  ].map((color, idx) => (
                    <motion.div
                      key={idx}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-sm cursor-pointer border border-black/10"
                      style={{ backgroundColor: color }}
                      whileHover={{ scale: 1.25, zIndex: 10 }}
                      whileTap={{ scale: 1.15 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      aria-label={`Color sugerido ${color}`}
                    />
                  ))}
                </div>
              </div>

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
                La ceremonia comenzará puntualmente a las 16:30 hrs. Agradecemos su llegada con anticipación para tomar sus lugares con calma y disfrutar de la bienvenida.
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
                Inspirados en la tradición de las bodas australianas, queremos brindar y celebrar con ustedes. Cada mesa contará con dos botellas para iniciar la fiesta. Luego, quienes deseen seguir disfrutando de otras bebidas, podrán encontrarlas en nuestra barra disponible para compra durante toda la celebración.
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
