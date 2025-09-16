import Image from 'next/image';

export default function MockBuscaDeTermos() {
  return (
    <div className="relative rounded-xl overflow-hidden h-full w-full">
      <Image
        src="/images/radarIA.png"
        alt="Radar IA - Busca Inteligente"
        fill
        className="object-cover w-full h-full"
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}
