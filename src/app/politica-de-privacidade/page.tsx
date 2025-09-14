'use client';

import Link from 'next/link';
import TransparentHeader from '@/components/TransparentHeader';
import RevealWrapper from '@/components/RevealWrapper';

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="bg-transparent min-h-screen">
      <TransparentHeader currentPage="politica-de-privacidade" />
      
      <main className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-16 sm:py-24 lg:py-32">
          <RevealWrapper delay={100}>
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 sm:text-5xl lg:text-6xl" style={{ lineHeight: '1.2', paddingBottom: '2px' }}>
                Política de Privacidade
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
                Conheça como protegemos e utilizamos seus dados pessoais
              </p>
            </div>
          </RevealWrapper>

          <div className="prose prose-lg prose-invert max-w-none">
            <RevealWrapper delay={200}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">1. Lei Aplicável</h2>
                <p className="text-gray-300">
                  O presente termo de Política de Privacidade será regido pelas Leis da República Federativa do Brasil, em específico a <strong className="text-blue-400">Lei nº 12.965, de 23 de abril de 2014</strong> (Marco Civil da Internet) e a <strong className="text-blue-400">Lei nº 13.709, de 14 agosto de 2018</strong> (Lei Geral de Proteção de Dados - LGPD), não se excluindo as demais legislações e princípios que poderão ser aplicados subsidiariamente.
                </p>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={300}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">2. Aceite de Uso</h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    A <strong className="text-white">SHARE TECNOLOGIA LTDA</strong> tem total comprometimento com a segurança e a privacidade de seus Assinantes, primando, sempre, pela qualidade e garantia na eficiência dos produtos e serviços oferecidos.
                  </p>
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-400 mb-2">✅ Compromisso de Privacidade</h4>
                    <p className="text-gray-300 text-sm">
                      Todas as informações enviadas pelos usuários serão utilizadas com o único objetivo de serem inseridas e processadas para a finalização do serviço contratado. Em hipótese alguma, forneceremos dados pessoais de nossos usuários a terceiros.
                    </p>
                  </div>

                  <p>
                    No caso de alterarmos futuramente essa conduta, informaremos imediatamente o usuário, que terá a opção de aceite que será feita de maneira individual e espontânea, através de mensagem eletrônica enviada ao e-mail cadastrado.
                  </p>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={400}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">3. Monitoramento e Exclusão do Usuário</h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    Na hipótese de constatação de não-cumprimento das normas previstas na Política ou no Termo de Uso, ou ainda se houver violação às leis aplicáveis, a <strong className="text-white">SHARE TECNOLOGIA</strong>, a seu critério exclusivo, poderá suspender temporariamente ou definitivamente o acesso do usuário ao aplicativo <strong className="text-blue-400">ADOO</strong>.
                  </p>
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-400 mb-2">📞 Direito de Contestação</h4>
                    <p className="text-gray-300 text-sm">
                      Os usuários terão o direito de buscar entender os motivos da suspensão ou exclusão do aplicativo, e até contestá-los, através do e-mail: <a href="mailto:contato@adoo.com.br" className="text-blue-400 hover:text-blue-300 underline">contato@adoo.com.br</a>.
                    </p>
                  </div>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={500}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">4. Informações que serão coletadas do usuário</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">📝 Informações que o usuário fornece</h3>
                    
                    <div className="grid gap-4">
                      <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-blue-400">Dados de cadastro:</strong>
                          <span className="text-gray-300"> login, senha, nome completo, e-mail, número de telefone e CPF</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-blue-400">Dados de cartão de crédito:</strong>
                          <span className="text-gray-300"> em caso de plano pago, enviados de forma segura e criptografada à instituição financeira parceira</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">🔄 Informações geradas durante o uso</h3>
                    
                    <div className="grid gap-3">
                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-purple-400">Registros de acesso:</strong>
                          <span className="text-gray-300 text-sm"> endereço IP, data e hora (coleta obrigatória conforme Lei 12.965/2014)</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-purple-400">Dados de uso:</strong>
                          <span className="text-gray-300 text-sm"> navegação, páginas acessadas, buscas e interações</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-purple-400">Comunicações:</strong>
                          <span className="text-gray-300 text-sm"> metadados e conteúdo de mensagens com o aplicativo</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-purple-400">Cookies e tecnologias similares:</strong>
                          <span className="text-gray-300 text-sm"> para melhorar e personalizar a experiência</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-purple-400">Dados de pagamento:</strong>
                          <span className="text-gray-300 text-sm"> data, hora, valor e detalhes da transação para prevenção à fraude</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={600}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">5. Como serão utilizadas as informações coletadas</h2>
                <div className="space-y-6">
                  <p className="text-gray-300">
                    Valorizamos a privacidade do usuário. Todos os dados e informações são confidenciais e utilizados apenas para as finalidades aqui discriminadas e autorizadas pelo usuário, principalmente para que o utilizador goze plenamente do aplicativo <strong className="text-blue-400">ADOO</strong>.
                  </p>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">5.1 Usos autorizados</h3>
                    <div className="grid gap-3">
                      {[
                        "Permitir que o usuário utilize todas as funcionalidades do aplicativo ADOO",
                        "Enviar ao usuário mensagens de suporte/serviço, alertas, notificações e atualizações",
                        "Comunicar ao usuário produtos, serviços, promoções, notícias, atualizações e eventos",
                        "Examinar a movimentação dos usuários em nossas aplicações",
                        "Proceder com publicidade orientada conforme os interesses dos usuários",
                        "Personalizar o aplicativo ADOO adequando-o aos interesses dos usuários",
                        "Desenvolver novos serviços, produtos e funcionalidades",
                        "Detecção e prevenção de fraudes, spam e incidentes de segurança",
                        "Verificar ou autenticar as informações fornecidas pelo usuário",
                        "Efetivar disposições legais"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-300 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-400 mb-2">🗑️ Exclusão dos dados</h4>
                    <p className="text-gray-300 text-sm">
                      Os dados do usuário serão excluídos em sua totalidade quando solicitados via e-mail: <a href="mailto:contato@adoo.com.br" className="text-blue-400 hover:text-blue-300 underline">contato@adoo.com.br</a>, ou quando não forem mais necessários, salvo obrigação legal de retenção.
                    </p>
                  </div>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={700}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">6. Compartilhamento de informações com terceiros</h2>
                <p className="text-gray-300">
                  A <strong className="text-white">SHARE TECNOLOGIA</strong> fornecerá dados do usuário apenas mediante ordem judicial, obrigação legal ou autorização expressa do usuário, conforme o art. 7º, VII, da Lei 12.965/2014.
                </p>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={800}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">7. Direitos dos usuários sobre os seus dados</h2>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    O usuário possui direitos previstos na <strong className="text-blue-400">LGPD (Lei nº 13.709/2018)</strong>, incluindo:
                  </p>
                  
                  <div className="grid gap-3">
                    {[
                      { title: "Acesso", desc: "Receber cópia dos dados pessoais que a empresa possui" },
                      { title: "Retificação", desc: "Solicitar correção dos dados pessoais via e-mail" },
                      { title: "Exclusão", desc: "Solicitar exclusão total dos dados quando não mais necessários" },
                      { title: "Oposição", desc: "Contestar o tratamento de dados para diferentes finalidades" },
                      { title: "Portabilidade", desc: "Receber dados em formato estruturado e inalterável" },
                      { title: "Retirada de consentimento", desc: "Retirar consentimento a qualquer momento" },
                      { title: "Revisão de decisões automatizadas", desc: "Solicitar revisão de decisões baseadas em IA" }
                    ].map((right, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-purple-400">{right.title}:</strong>
                          <span className="text-gray-300 text-sm"> {right.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-6">
                    <p className="text-gray-300 text-sm">
                      <strong className="text-green-400">Tempo de resposta:</strong> Até 5 dias úteis para solicitações legítimas. Para exercer esses direitos, contate: <a href="mailto:contato@adoo.com.br" className="text-blue-400 hover:text-blue-300 underline">contato@adoo.com.br</a>
                    </p>
                  </div>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={900}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">8. Segurança das informações dos usuários</h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    Empregamos esforços razoáveis de mercado para garantir a segurança dos dados através do uso do aplicativo <strong className="text-blue-400">ADOO</strong>. Nossos servidores estão localizados em diferentes locais para garantir estabilidade e segurança.
                  </p>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-2">⚠️ Limitação de responsabilidade</h4>
                    <p className="text-gray-300 text-sm">
                      Apesar de todos os critérios e tecnologias utilizados, não é possível garantir segurança absoluta (100%) dos dados transmitidos e armazenados na internet.
                    </p>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-red-400 mb-2">🔒 Responsabilidades do usuário</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• Manter senha de acesso em local seguro</li>
                      <li>• Não compartilhar senha com terceiros</li>
                      <li>• Notificar imediatamente sobre uso não autorizado da conta</li>
                    </ul>
                  </div>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={1000}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">9. Alterações na política de privacidade</h2>
                <p className="text-gray-300">
                  A <strong className="text-white">SHARE TECNOLOGIA</strong> se reserva o direito de, a qualquer momento, modificar, alterar, acrescentar ou remover partes desta política, com comunicação aos clientes através de e-mails cadastrados.
                </p>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={1100}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">10. Foro privilegiado</h2>
                <p className="text-gray-300">
                  Fica eleito o <strong className="text-blue-400">Foro da Comarca de Fortaleza - CE</strong>, como competente para dirimir quaisquer questões oriundas deste documento.
                </p>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={1200}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">11. Dúvidas e sugestões</h2>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-gray-300">
                    Em caso de dúvidas ou sugestões sobre esta política de privacidade, ou qualquer outro aspecto, entre em contato através do e-mail: <a href="mailto:contato@adoo.com.br" className="text-blue-400 hover:text-blue-300 underline">contato@adoo.com.br</a>
                  </p>
                </div>
              </div>
            </RevealWrapper>

            <RevealWrapper delay={1300}>
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


