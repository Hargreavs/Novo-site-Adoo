'use client';

import EciooLogo from './EciooLogo';

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden">
      {/* Gradiente superior para separar do conteúdo */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
      
      {/* Container principal com blur/vidro fosco */}
      <div className="relative bg-white/5 backdrop-blur-sm border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          
          {/* Grid responsivo: 3 colunas desktop, 1 coluna mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Coluna 1: Informações da empresa */}
            <div className="text-center md:text-left">
              <div className="mb-4 flex justify-center md:justify-start">
                <EciooLogo className="h-8 w-24" />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Acompanhe Diários Oficiais com inteligência artificial. 
                Radar IA, alertas personalizados e central unificada.
              </p>
              
            </div>

            {/* Coluna 2: Links institucionais */}
            <div className="text-center md:text-left">
              <h4 className="text-base font-semibold text-white mb-4">Institucional</h4>
              <nav className="space-y-3">
                <a 
                  href="/politica-de-privacidade" 
                  className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Política de Privacidade
                </a>
                <a 
                  href="/termos-de-uso" 
                  className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Termos de Uso
                </a>
              </nav>
            </div>

            {/* Coluna 3: Redes sociais */}
            <div className="text-center md:text-left">
              <h4 className="text-base font-semibold text-white mb-4">Redes Sociais</h4>
              <div className="flex justify-center md:justify-start space-x-4">
                {/* Instagram */}
                <a 
                  href="https://instagram.com/adoo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_20px_rgba(168,85,247,0.2)]"
                  aria-label="Instagram"
                >
                  <svg className="h-5 w-5 text-gray-300 group-hover:text-purple-400 transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10z"/>
                    <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 2.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z"/>
                    <circle cx="17.5" cy="6.5" r="1.25"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a 
                  href="https://facebook.com/adoo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-400/50 hover:bg-white/10 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_20px_rgba(59,130,246,0.2)]"
                  aria-label="Facebook"
                >
                  <svg className="h-5 w-5 text-gray-300 group-hover:text-blue-400 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Linha separadora */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm text-center md:text-left">
                © 2020 Adoo. Todos os direitos reservados.
              </p>
              <div className="mt-4 md:mt-0 flex items-center space-x-1 text-gray-400 text-sm">
                <span>Feito com</span>
                <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>no Brasil</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
