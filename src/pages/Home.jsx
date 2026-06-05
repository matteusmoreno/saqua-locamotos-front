import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="min-h-screen bg-black-pure pt-20">
      {/* Hero Section - Estilo Premium Dark */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden border-b border-gray-mid">
        {/* Fundo com imagem de moto escura e gradiente agressivo */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1622199015096-7c30026e6f18?q=80&w=1920&auto=format&fit=crop" 
            alt="Moto em fundo escuro" 
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
          />
          {/* Radial Gradient para focar no texto e esconder bordas da imagem */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000_100%)]"></div>
          {/* Gradiente inferior para o Vermelho sutil */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-brand-red/10 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Badge Superior */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-gray-darker border border-brand-red/30 text-brand-red px-4 py-1.5 rounded-full text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <Gauge size={16} /> O melhor custo-benefício da Região dos Lagos
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-8xl font-black text-white mb-8 leading-tight tracking-tighter"
          >
            Alugue sua moto <br />
            sem burocracia. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-white to-brand-gold [text-shadow:0_0_30px_rgba(250,204,21,0.5)]">
              Acelere seus ganhos.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Planos flexíveis com manutenção inclusa para entregadores e motoristas em Saquarema. Segurança total e suporte 24h para você rodar tranquilo.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row justify-center gap-6 items-center"
          >
            {/* CTA Principal - Amarelo */}
            <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-10 py-5 rounded-2xl font-black text-xl transition-all transform hover:scale-105 hover:-translate-y-1 shadow-[0_10px_30px_rgba(250,204,21,0.3)]">
              Quero Alugar <ArrowRight size={22} />
            </Link>
            
            {/* CTA Secundário - Vermelho sutil */}
            <a href="#planos" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent hover:bg-brand-red/10 text-white border-2 border-brand-red/50 hover:border-brand-red px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              Ver Tabela de Preços
            </a>
          </motion.div>
        </div>
      </section>

      {/* Seção de Features - Fundo Cinza Escuro */}
      <section className="py-24 bg-gray-darker">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-brand-red uppercase tracking-widest mb-3">Vantagens Exclusivas</h2>
            <p className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Tudo o que você precisa para rodar</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<ShieldCheck size={40} className="text-black-pure" />}
              title="Manutenção Completa" 
              desc="Esqueça gastos com óleo, freios, relação e pneus. Nossa equipe cuida de tudo para você não parar."
            />
            <FeatureCard 
              icon={<Zap size={40} className="text-black-pure" />}
              title="Aprovação Digital" 
              desc="Processo 100% online e rápido. Sem papelada excessiva e aprovação facilitada para a categoria."
            />
            <FeatureCard 
              icon={<Gauge size={40} className="text-black-pure" />}
              title="Seguro e Rastreamento" 
              desc="Rode protegido contra roubo e furto. Nossas motos contam com tecnologia de ponta em segurança."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// Componente FeatureCard atualizado para o tema dark/yellow
function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-gray-dark p-10 rounded-3xl border border-gray-mid shadow-lg hover:border-brand-gold/30 hover:shadow-[0_10px_40px_rgba(250,204,21,0.1)] transition-all duration-300 ease-out group"
    >
      <div className="bg-brand-gold w-20 h-20 rounded-2xl flex items-center justify-center mb-8 transform -rotate-6 group-hover:rotate-0 transition-transform shadow-[0_5px_15px_rgba(250,204,21,0.3)]">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{title}</h3>
      <p className="text-gray-400 leading-relaxed font-light">{desc}</p>
    </motion.div>
  );
}