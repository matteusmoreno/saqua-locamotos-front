import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Wrench, Smartphone, FileCheck, MapPin, Scale, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="min-h-screen bg-[#050505] selection:bg-brand-gold selection:text-black pt-20">
      
      {/* 1. HERO SECTION - ULTRA CLEAN */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1920&auto=format&fit=crop" 
            alt="Moto" 
            className="w-full h-full object-cover opacity-30 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/95 to-[#050505]"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-brand-gold text-xs sm:text-sm font-black tracking-[0.2em] uppercase mb-6 block">
              Locação Exclusiva em Saquarema
            </span>
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white leading-[1.05] tracking-tighter mb-8">
              Acelere seus <br />
              <span className="text-brand-gold">ganhos hoje.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 font-light max-w-2xl mx-auto mb-12">
              Motos revisadas, seguradas e prontas para o asfalto. Sem aprovação de crédito complexa, apenas o que você precisa para rodar.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/login" 
                className="group flex items-center justify-center gap-3 bg-brand-gold hover:bg-yellow-400 text-black px-8 py-4 rounded-xl font-black text-lg transition-all w-full sm:w-auto"
              >
                Garantir minha moto
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#valores" 
                className="group flex items-center justify-center gap-3 bg-transparent text-white border border-gray-800 hover:border-brand-gold hover:text-brand-gold px-8 py-4 rounded-xl font-bold text-lg transition-all w-full sm:w-auto"
              >
                Ver condições
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. NUMBERS / PRICING - DIRECT TO THE POINT */}
      <section id="valores" className="py-24 sm:py-32 bg-[#050505] border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Texto Explicativo */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                Plano <span className="text-brand-gold">Mensal.</span> <br />
                Sem surpresas.
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed font-light">
                Esqueça oficinas e documentação. Nosso plano é desenhado exclusivamente para quem usa a moto como ferramenta de trabalho, garantindo previsibilidade total.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: ShieldCheck, text: "Seguro total e rastreamento inclusos" },
                  { icon: Wrench, text: "Manutenção preventiva por nossa conta" },
                  { icon: Smartphone, text: "Suporte dedicado via WhatsApp" }
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-4 text-white font-medium">
                    <div className="bg-brand-gold/10 p-2 rounded-lg text-brand-gold">
                      <item.icon size={20} />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Pricing Card Premium */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-[1px] rounded-3xl bg-gradient-to-b from-brand-gold/50 to-gray-900"
            >
              <div className="bg-[#0A0A0A] rounded-3xl p-8 sm:p-12 h-full flex flex-col justify-between">
                <div>
                  <span className="text-brand-gold text-sm font-bold uppercase tracking-widest mb-2 block">
                    Modelo Único
                  </span>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-white text-3xl font-medium">R$</span>
                    <span className="text-7xl font-black text-brand-gold tracking-tighter">300</span>
                    <span className="text-gray-500 font-medium">/semana</span>
                  </div>
                  
                  <div className="space-y-6 pt-8 border-t border-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Caução de garantia</span>
                      <span className="text-brand-gold font-bold text-xl">R$ 600,00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Tempo mínimo</span>
                      <span className="text-white font-bold text-xl">30 dias</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* 3. REQUIREMENTS - MODERN CARDS */}
      <section className="py-24 sm:py-32 bg-[#0A0A0A] border-y border-gray-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Tudo <span className="text-brand-gold">100% digital.</span>
            </h2>
            <p className="text-gray-400 text-lg font-light">
              Envie os documentos abaixo e tenha seu cadastro analisado em poucas horas.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <DocCard 
              icon={FileCheck}
              title="CNH Digital"
              desc="Categoria A válida. Obrigatório o envio do documento digital com QR Code."
            />
            <DocCard 
              icon={MapPin}
              title="Comprovante"
              desc="Residência no seu nome ou parentes de 1º grau (água, luz ou internet recente)."
            />
            <DocCard 
              icon={Scale}
              title="Antecedentes"
              desc="Certidão negativa estadual ou federal emitida nos últimos 30 dias."
            />
          </div>
        </div>
      </section>

      {/* 4. BOTTOM CTA */}
      <section className="py-32 bg-[#050505]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-8 tracking-tight">
            Pronto para <span className="text-brand-gold">rodar?</span>
          </h2>
          <Link 
            to="/login" 
            className="inline-flex items-center justify-center gap-3 bg-brand-gold hover:bg-yellow-400 text-black px-10 py-5 rounded-xl font-black text-xl transition-transform hover:scale-105"
          >
            Fazer meu cadastro <ChevronRight size={24} />
          </Link>
        </div>
      </section>
      
    </div>
  );
}

// Componente isolado para os cards de documento
function DocCard({ icon: Icon, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-[#050505] border border-gray-900 p-8 sm:p-10 rounded-3xl group hover:border-brand-gold/40 transition-colors"
    >
      <div className="mb-6 inline-flex p-4 rounded-2xl bg-[#0A0A0A] border border-gray-800 text-brand-gold group-hover:bg-brand-gold group-hover:text-black transition-colors">
        <Icon size={32} strokeWidth={2} />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-gray-400 font-light leading-relaxed">{desc}</p>
    </motion.div>
  );
}