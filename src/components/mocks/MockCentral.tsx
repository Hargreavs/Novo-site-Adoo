import Image from 'next/image';

export default function MockCentral() {
  return (
    <div className="h-full w-full relative overflow-hidden rounded-xl">
      <Image
        src="/images/central.png"
        alt="Central Interface"
        fill
        className="object-cover rounded-xl"
        priority
      />
    </div>
  );
}
