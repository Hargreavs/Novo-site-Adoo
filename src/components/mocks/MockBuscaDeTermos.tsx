import Image from 'next/image';

export default function MockBuscaDeTermos() {
  return (
    <div className="h-full w-full relative overflow-hidden rounded-xl">
      <Image
        src="/images/radarIA.png"
        alt="Radar IA Interface"
        fill
        className="object-cover rounded-xl"
        priority
      />
    </div>
  );
}
