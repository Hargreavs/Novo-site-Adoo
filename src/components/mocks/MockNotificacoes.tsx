import Image from 'next/image';

export default function MockNotificacoes() {
  return (
    <div className="relative rounded-xl overflow-hidden h-full w-full">
      <Image
        src="/images/notificacao.png"
        alt="Sistema de Notificações Multi-canal"
        fill
        className="object-cover w-full h-full"
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}
