import Image from 'next/image';

export default function EciooLogo({ className = 'h-24 w-auto' }: { className?: string }) {
  return (
    <div className={`${className} relative z-50 flex items-center`}>
      <Image
        src='/logo.png'
        alt='ecioo logo'
        width={384}
        height={96}
        className='object-contain h-24 w-auto'
        priority
      />
    </div>
  );
}
