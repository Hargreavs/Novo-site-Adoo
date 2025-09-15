import Image from 'next/image';

export default function MockNotificacoes() {
  return (
    <div className="h-full w-full relative overflow-hidden rounded-xl">
      <Image
        src="/images/notificacao.png"
        alt="Notificações Interface"
        fill
        className="object-cover rounded-xl"
        priority
      />
    </div>
  );
}
