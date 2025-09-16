import { motion } from 'framer-motion';
import { Benefit } from '@/types/benefits';
import Image from 'next/image';

interface BenefitMainCardProps {
  benefit: Benefit;
}

export default function BenefitMainCard({ benefit }: BenefitMainCardProps) {
  return (
    <motion.div
      id={`benefit-panel-${benefit.id}`}
      role="tabpanel"
      aria-labelledby={`benefit-label-${benefit.id}`}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.15,
        ease: 'easeOut'
      }}
      className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-6 sm:p-8 overflow-hidden h-full min-h-[500px] flex flex-col hover:border-blue-400/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300"
    >
      {/* Content Grid - 35/65 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 relative z-10 h-full">
        {/* Left Half - Content */}
        <div className="flex flex-col h-full">
          <h3 className="text-2xl font-semibold text-white mb-4">
            {benefit.title}
          </h3>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            {benefit.description}
          </p>
          
          <div className="flex-1 flex items-center">
            <ul className="space-y-3">
              {benefit.bullets.map((bullet, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                  <span className="text-sm">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Right Half - Mock UI */}
        <div className="h-full">
          {/* Moldura externa com radius, sombra e um padding mínimo */}
          <div
            className="
              relative w-full h-full rounded-xl border border-white/10
              bg-gradient-to-b from-white/5 to-white/[0.02]
              shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]
              p-2 pb-2
            "
          >
            {/* Área da mídia padronizada: mesma altura para todos os cards */}
            <div
              className="
                benefit-media relative w-full h-full rounded-lg overflow-hidden
                /* altura fluida e consistente entre cards */
              "
            >
              {/* Wrapper que força qualquer filho a preencher */}
              <div className="absolute inset-0 [&>*]:absolute [&>*]:inset-0 [&>*]:w-full [&>*]:h-full [&>*]:object-cover [&>*]:rounded-lg">
                {typeof benefit.media === "string" ? (
                  // Se vier apenas a string do src
                  <Image
                    src={benefit.media}
                    alt={benefit.title}
                    fill
                    className="object-cover rounded-lg"
                    priority={false}
                    quality={85}
                  />
                ) : (
                  // Se vier um ReactNode (Image, video, etc.)
                  benefit.media
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}