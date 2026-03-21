'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SubscribeSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push('/admin'), 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Image src="/capta.png" alt="Logo" width={80} height={32} className="object-contain mx-auto mb-6" />
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Assinatura confirmada!</h1>
        <p className="text-gray-500 mb-6">Bem-vindo ao painel. Você será redirecionado em instantes...</p>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
