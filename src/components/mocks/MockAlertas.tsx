import Image from 'next/image';

export default function MockAlertas() {
  return (
    <div className="h-full w-full relative overflow-hidden rounded-xl">
      <Image
        src="/images/alertas.png"
        alt="Alertas Interface"
        fill
        className="object-cover rounded-xl"
        priority
      />
    </div>
  );
}
