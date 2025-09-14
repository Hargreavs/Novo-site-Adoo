import TransparentHeader from "@/components/TransparentHeader";
import RevealWrapper from "@/components/RevealWrapper";
import { CodeBracketIcon, DocumentTextIcon, CloudIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function API() {
  const apiFeatures = [
    {
      icon: CodeBracketIcon,
      title: 'RESTful API',
      description: 'Interface REST completa para integração com seus sistemas existentes.'
    },
    {
      icon: DocumentTextIcon,
      title: 'Documentação Completa',
      description: 'Documentação detalhada com exemplos práticos e SDKs para múltiplas linguagens.'
    },
    {
      icon: CloudIcon,
      title: 'Webhooks',
      description: 'Receba notificações em tempo real sobre publicações e atualizações.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Autenticação Segura',
      description: 'API Keys e OAuth2 para máxima segurança nas suas integrações.'
    }
  ];

  return (
    <div className="bg-transparent min-h-screen">
      <TransparentHeader currentPage="api" />

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
          <RevealWrapper delay={100}>
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                API de <span className="text-blue-400">Integração</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Integre nossos serviços de diários oficiais diretamente em seus sistemas com nossa API robusta e bem documentada.
              </p>
            </div>
          </RevealWrapper>
        </div>

        {/* Features Section */}
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <RevealWrapper delay={100}>
              <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-blue-400">Recursos da API</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Tudo que você precisa para integrar
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                  Nossa API oferece todos os recursos necessários para integrar os serviços de diários oficiais em seus sistemas.
                </p>
              </div>
            </RevealWrapper>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                {apiFeatures.map((feature, index) => (
                  <RevealWrapper key={feature.title} delay={200 + (index * 100)}>
                    <div className="flex flex-col">
                      <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                        <feature.icon className="h-5 w-5 flex-none text-blue-400" aria-hidden="true" />
                        {feature.title}
                      </dt>
                      <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                        <p className="flex-auto">{feature.description}</p>
                      </dd>
                    </div>
                  </RevealWrapper>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* API Documentation Preview */}
        <RevealWrapper delay={100}>
          <div className="bg-gray-900/50 backdrop-blur-sm ring-1 ring-white/20 rounded-2xl p-8 mx-auto max-w-4xl">
            <h3 className="text-xl font-semibold text-white mb-4">Exemplo de Uso</h3>
            <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300">
{`// Buscar diários oficiais
GET /api/v1/diarios?data=2024-01-15&orgao=prefeitura

// Publicar novo diário
POST /api/v1/diarios
{
  "titulo": "Diário Oficial - 15/01/2024",
  "conteudo": "...",
  "orgao": "prefeitura"
}

// Webhook para notificações
POST /webhook/diarios-publicados
{
  "evento": "diario_publicado",
  "diario_id": "12345",
  "timestamp": "2024-01-15T10:30:00Z"
}`}
              </pre>
            </div>
          </div>
        </RevealWrapper>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <RevealWrapper delay={200}>
            <div className="flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Ver Documentação
              </a>
              <a href="#" className="text-sm font-semibold leading-6 text-white hover:text-blue-400">
                Obter API Key <span aria-hidden="true">→</span>
              </a>
            </div>
          </RevealWrapper>
        </div>
      </div>
    </div>
  );
}