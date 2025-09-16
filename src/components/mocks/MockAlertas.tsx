import Image from 'next/image';

export default function MockAlertas() {
  return (
    <div className="relative rounded-xl overflow-hidden h-full w-full">
      <Image
        src="/images/alertas.png"
        alt="Sistema de Alertas Inteligentes"
        fill
        className="object-cover w-full h-full"
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}
