import TransparentHeader from "@/components/TransparentHeader";
import RevealWrapper from "@/components/RevealWrapper";

export default function Precos() {
  return (
    <div className="bg-transparent min-h-screen">
      <TransparentHeader currentPage="precos" />

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
          <RevealWrapper delay={100}>
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Preços
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Conteúdo em desenvolvimento...
              </p>
            </div>
          </RevealWrapper>
        </div>
      </div>
    </div>
  );
}

