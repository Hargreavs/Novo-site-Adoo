import Image from 'next/image';

export default function MockCentral() {
  return (
    <div className="relative rounded-xl overflow-hidden h-full w-full">
      <Image
        src="/images/central.png"
        alt="Central de Diários Oficiais"
        fill
        className="object-cover w-full h-full"
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}
