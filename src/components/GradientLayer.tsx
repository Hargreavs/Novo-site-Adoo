import { GradientLayerProps } from '@/types/benefits';

export default function GradientLayer({ from, via, to, variant = 'radial' }: GradientLayerProps) {
  const gradientStyle = variant === 'radial' 
    ? {
        background: `radial-gradient(120% 120% at 20% 10%, ${from}18 0%, transparent 60%), radial-gradient(120% 120% at 80% 90%, ${to}12 0%, transparent 60%)`
      }
    : {
        background: `linear-gradient(180deg, ${from}06, ${via ? `${via}04` : 'transparent'}, ${to}02)`
      };

  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-25"
      style={gradientStyle}
    />
  );
}
