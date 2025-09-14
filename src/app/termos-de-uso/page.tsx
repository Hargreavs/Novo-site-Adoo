'use client';

import Link from 'next/link';
import TransparentHeader from '@/components/TransparentHeader';
import RevealWrapper from '@/components/RevealWrapper';

export default function TermosDeUsoPage() {
  return (
    <div className="bg-transparent min-h-screen">
      <TransparentHeader currentPage="termos-de-uso" />
      
      <main className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-16 sm:py-24 lg:py-32">
          <RevealWrapper delay={100}>
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 sm:text-5xl lg:text-6xl">
                Termos de Uso
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
                Conheça os termos e condições para utilização da plataforma Adoo
              </p>
            </div>
          </RevealWrapper>

          <div className="prose prose-lg prose-invert max-w-none">
            <RevealWrapper delay={200}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Introdução</h2>
                <div className="space-y-4 text-gray-300">
                  <p className="text-lg">Bem-vindo(a)! Obrigado por utilizar o aplicativo Adoo!</p>
                  <p>
                    Esta aplicação e seu conteúdo são controlados e operados pela empresa Share Consultoria em Tecnologia da Informação Ltda, nestes termos denominada somente <strong className="text-blue-400">Share Tecnologia</strong>. Todos os direitos reservados.
                  </p>
                  <p>
                    O presente termo de uso busca definir as regras a serem observadas para a utilização do <strong className="text-blue-400">ADOO</strong> ("Termo de Uso"), sem prejuízo da aplicação da legislação vigente.
                  </p>
                  <p>
                    Ao utilizar o ADOO, o usuário automaticamente concorda com este Termo de Uso, responsabilizando-se integralmente por todos e quaisquer atos praticados no ADOO ou em serviços a ele relacionados.
                  </p>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-6">
                    <p className="text-yellow-200">
                      <strong>Importante:</strong> Em eventual não concordância com qualquer dos termos e condições abaixo estabelecidos, o usuário não deverá utilizar o ADOO.
                    </p>
                  </div>
                  <p>
                    O usuário igualmente concorda com os termos descritos em nossa <Link href="/politica-de-privacidade" className="text-blue-400 hover:text-blue-300 underline">Política de Privacidade</Link>.
                  </p>
                  <p>
                    Caso o usuário queira realizar alguma sugestão ou tirar dúvidas que diga respeito ao Termo de Uso do ADOO, deverá entrar em contato pelo e-mail: <a href="mailto:contato@adoo.com.br" className="text-blue-400 hover:text-blue-300 underline">contato@adoo.com.br</a>.
                  </p>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={300}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">1. O que é o aplicativo Adoo?</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">1.1. Serviços</h3>
                    <p className="text-gray-300 mb-4">
                      É uma plataforma que centraliza os diários oficiais dos entes federativos de modo a permitir fácil acesso aos seus jornais, se assim houver. O ADOO dispõe das seguintes funcionalidades:
                    </p>
                    
                    <div className="grid gap-3">
                      <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-blue-400">Criação de Alertas:</strong>
                          <span className="text-gray-300"> o usuário poderá criar alerta para um ou vários diários oficiais disponíveis</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-blue-400">Busca de termos específicos:</strong>
                          <span className="text-gray-300"> o usuário poderá pesquisar termos por exatidão ou aproximação em um ou mais diários oficiais simultaneamente</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-blue-400">Download de diário(s):</strong>
                          <span className="text-gray-300"> o usuário poderá fazer o download do(s) diário(s) oficial(s) desejado(s) para o seu dispositivo móvel</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-blue-400">Envio manual ou automático:</strong>
                          <span className="text-gray-300"> de diário oficial para o e-mail</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-400 mb-2">⚠️ Limitações importantes</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• A plataforma não realiza busca de termos em imagens</li>
                      <li>• Documentos com codificação de texto não padrão podem não ser indexados</li>
                      <li>• É necessário acesso à internet para utilização do aplicativo</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">1.2. Suspensão</h3>
                    <p className="text-gray-300">
                      É garantido à empresa <strong className="text-white">SHARE TECNOLOGIA</strong> o direito de suspender ou cancelar, a qualquer momento, o acesso do usuário ao ADOO em caso de suspeita de fraude, obtenção de benefício ou vantagem de forma ilícita, ou pelo não cumprimento de quaisquer condições previstas nestes Termos de Uso, na Política de Privacidade ou na legislação aplicável.
                    </p>
                  </div>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={400}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">2. Como o usuário pode acessar o Adoo?</h2>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-blue-400 mb-4">2.1. Acesso</h3>
                  <p className="text-gray-300">
                    Para acessar o Adoo e utilizar suas funcionalidades, faz-se necessário que o usuário efetue o download da plataforma através das lojas de aplicativos. Para cadastrar-se no aplicativo, o usuário nos fornecerá informações pessoais, conforme descrito em nossa <Link href="/politica-de-privacidade" className="text-blue-400 hover:text-blue-300 underline">Política de Privacidade</Link>.
                  </p>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={500}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">3. Promoções</h2>
                <p className="text-gray-300">
                  O Adoo poderá, a qualquer tempo, disponibilizar publicidades ou apresentar ofertas promocionais. A participação do usuário em qualquer promoção ou oferta está sujeita às regras aplicáveis associadas à promoção que serão descritas no momento da oferta do serviço.
                </p>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={600}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">4. Os direitos da Share Tecnologia sobre o Adoo</h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    Todos os direitos relativos ao <strong className="text-blue-400">ADOO</strong> e suas funcionalidades são de propriedade exclusiva da <strong className="text-white">Share Tecnologia</strong>, incluindo os seus textos, imagens, layouts, software, códigos, bases de dados, gráficos, artigos, fotografias e demais conteúdos produzidos direta ou indiretamente pela SHARE TECNOLOGIA.
                  </p>
                  
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-red-400 mb-2">🚫 Proibições</h4>
                    <p className="text-gray-300 text-sm">
                      É proibido usar, copiar, reproduzir, modificar, traduzir, publicar, transmitir, distribuir, executar, fazer o upload, exibir, licenciar, vender ou explorar e fazer engenharia reversa do conteúdo do Adoo, para qualquer finalidade, sem a autorização prévia e expressa da SHARE TECNOLOGIA.
                    </p>
                  </div>
                  
                  <p>
                    Qualquer uso não autorizado do ADOO será considerado como violação dos direitos autorais e de propriedade intelectual da SHARE TECNOLOGIA.
                  </p>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={700}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">5. Do direito de propriedade intelectual</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">5.1. Propriedade intelectual</h3>
                    <p className="text-gray-300">
                      A qualidade dos serviços ofertados ao usuário é de suma importância. Os serviços disponibilizados são consequência de copioso trabalho e dedicação de nossos desenvolvedores.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">5.2. Não aquisição de Direitos</h3>
                    <p className="text-gray-300">
                      Nenhum usuário adquirirá direito de propriedade sobre os serviços e conteúdos do ADOO, exceto quando haja outorga expressa neste Termos de Uso.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">5.3. Planos empresariais</h3>
                    <p className="text-gray-300">
                      O Adoo se reserva ao direito de restringir, ampliar ou alterar quaisquer funcionalidades ou peculiaridades da plataforma, respeitando os limites pré-definidos das características de cada assinatura, mediante informativo através do e-mail e/ou notificação diretamente no aplicativo.
                    </p>
                  </div>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={800}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">6. Violação de direito autoral</h2>
                <p className="text-gray-300">
                  Qualquer observação dos usuários no que tange à infração do direito autoral do ADOO devem ser encaminhadas por meio do e-mail: <a href="mailto:contato@adoo.com.br" className="text-blue-400 hover:text-blue-300 underline">contato@adoo.com.br</a>.
                </p>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={900}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">7. Responsabilidades do usuário</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">7.1. Responsabilidade pelo Uso</h3>
                    <p className="text-gray-300">
                      O usuário é exclusivamente responsável pelo uso do ADOO e deverá se atentar às regras deste Termo de Uso, de igual modo à legislação aplicável ao ADOO.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">7.2. Manutenção</h3>
                    <p className="text-gray-300">
                      É de inteira responsabilidade do usuário manter o ambiente de seu dispositivo (computador, celular, tablet, entre outros) seguro, com o uso de ferramentas acessíveis, como antivírus, firewall, entre outras, de modo a auxiliar na prevenção de riscos.
                    </p>
                  </div>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={1000}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">8. Da responsabilidade da Share Tecnologia</h2>
                <div className="space-y-6">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">8.1. Não Responsabilização por Eventuais Danos</h3>
                    <p className="text-gray-300">
                      A empresa SHARE TECNOLOGIA, seu controlador, suas afiliadas, parceiras ou funcionários não serão, em hipótese alguma, responsabilizados por danos diretos ou indiretos que resultem de, ou que tenham relação com o acesso, uso ou a incapacidade de acessar ou utilizar o aplicativo ADOO.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">8.2. Não Responsabilização</h3>
                    <p className="text-gray-300">
                      Tendo em vista as características inerentes ao ambiente da internet, a SHARE TECNOLOGIA não se responsabiliza por interrupções ou suspensões de conexão, transmissões de computador incompletas ou que falhem, bem como por falha técnica de qualquer tipo.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">8.3. Links Externos</h3>
                    <p className="text-gray-300">
                      É possível que o Adoo possa conter links para sites e aplicativos de terceiros. Isso não implica que a SHARE TECNOLOGIA endossa, verifica, garante ou possui qualquer ligação com os proprietários desses sites ou aplicativos.
                    </p>
                  </div>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={1100}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">9. Das demais avenças</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">9.1. Alterações</h3>
                    <p className="text-gray-300">
                      Para ampliar a experiência do usuário, o ADOO estará sempre atualizado, ou passará por atualizações. O presente Termo de Uso eventualmente poderá ser alterado, a fim de corresponder às mudanças realizadas.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">9.2. Conflito entre Disposições</h3>
                    <p className="text-gray-300">
                      Em caso de conflito entre o termo antigo e o novo, este prevalecerá sobre aquele.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">9.3. Lei e Foro</h3>
                    <p className="text-gray-300">
                      O presente Termo de Uso são regidos pelas leis da República Federativa do Brasil. Quaisquer dúvidas e situações não previstas neste Termo de Uso serão primeiramente resolvidas pela SHARE TECNOLOGIA e, caso persistam, deverão ser solucionadas em juízo no Foro da Comarca de Fortaleza - CE.
                    </p>
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">9.4. Dúvidas e Sugestões</h3>
                    <p className="text-gray-300">
                      Caso o usuário tenha alguma dúvida, comentário ou sugestão, por favor, entre em contato com a SHARE TECNOLOGIA por meio do e-mail: <a href="mailto:contato@sharetecnologia.com.br" className="text-blue-400 hover:text-blue-300 underline">contato@sharetecnologia.com.br</a>
                    </p>
                  </div>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={1200}>
              <div className="text-center mt-16">
                <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-6 py-4 text-base font-semibold text-white transition-all duration-300 hover:border-blue-400/50 hover:bg-white/10 hover:text-blue-300 hover:scale-105">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Voltar ao início
                </Link>
              </div>
            </RevealWrapper>
          </div>
        </div>
      </main>
    </div>
  );
}


