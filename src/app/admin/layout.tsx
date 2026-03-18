'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Logo"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <div className="hidden sm:block">
                <span className="font-bold text-gray-900 text-lg tracking-tight">Paciente Modelo</span>
                <span className="text-xs text-gray-400 block -mt-1">Painel de Gerenciamento</span>
              </div>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === '/admin'
                    ? 'bg-[#6B1C3A]/10 text-[#6B1C3A] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/forms/new"
                className="px-5 py-2.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl text-sm font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20 hover:shadow-xl hover:shadow-[#6B1C3A]/30 active:scale-95"
              >
                + Novo Formulário
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
