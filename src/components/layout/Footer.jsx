import Logo from '../../assets/saqua-locamotos-logo.png';
import { MapPin, Mail, Phone } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black-pure border-t border-gray-mid text-gray-500 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        <div className="grid md:grid-cols-3 w-full gap-12 mb-12 text-center md:text-left items-center">
          
          {/* Coluna Logo */}
          <div className="flex flex-col items-center md:items-start gap-4">
             <img 
                src={Logo} 
                alt="Saqua Locamotos" 
                className="h-16 w-auto opacity-70 drop-shadow-[0_0_5px_rgba(250,204,21,0.2)]" 
              />
              <p className="text-sm font-light max-w-sm">A maior frota de locação de motos para trabalho da Região dos Lagos. Sua liberdade financeira começa aqui.</p>
          </div>

          {/* Coluna Contato - Usando Vermelho sutil */}
          <div className="flex flex-col items-center md:items-start gap-3 text-sm border-l border-r border-gray-mid px-8 py-4">
             <h4 className="font-bold text-gray-300 mb-2 uppercase tracking-wider text-xs">Atendimento</h4>
             <div className="flex items-center gap-2.5 hover:text-brand-red transition-colors cursor-pointer">
                <MapPin size={16} className="text-brand-red" /> 
                Bacaxá, Saquarema - RJ
             </div>
             <div className="flex items-center gap-2.5 hover:text-brand-gold transition-colors cursor-pointer">
                <Mail size={16} className="text-brand-gold" />
                contato@saqualocamotos.com
             </div>
             <div className="flex items-center gap-2.5 hover:text-brand-gold transition-colors cursor-pointer">
                <Phone size={16} className="text-brand-gold" />
                (22) 99999-8888 (WhatsApp)
             </div>
          </div>
          
          {/* Coluna Links */}
          <div className="flex flex-col items-center md:items-start gap-3 text-sm font-medium">
             <h4 className="font-bold text-gray-300 mb-2 uppercase tracking-wider text-xs">Legal</h4>
            <a href="#" className="hover:text-brand-gold transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-brand-gold transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-brand-gold transition-colors">Perguntas Frequentes</a>
          </div>
        </div>
        
        <div className="w-full border-t border-gray-mid/50 pt-8 text-center text-xs font-light text-gray-700">
          &copy; {currentYear} Saqua Locamotos LTDA. CNPJ: 00.000.000/0001-00. <br className="sm:hidden"/> Proibida reprodução total ou parcial.
        </div>
      </div>
    </footer>
  );
}