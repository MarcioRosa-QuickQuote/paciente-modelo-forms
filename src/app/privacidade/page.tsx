import Link from 'next/link';
import Image from 'next/image';

export const metadata = { title: 'Política de Privacidade — Capta+' };

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/capta.png" alt="Capta+" width={28} height={28} className="rounded-md" />
            <span className="font-bold text-gray-900">Capta<span className="text-pink-500">+</span></span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: março de 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Quem somos</h2>
            <p>O <strong>Capta+</strong> é uma plataforma de funis de conversão interativos para captação de leads qualificados. Nosso site é <strong>captamais.dream2app.com.br</strong>. Dúvidas sobre privacidade podem ser enviadas para <strong>marciolarosa@gmail.com</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Dados que coletamos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dados de conta:</strong> nome, e-mail e foto de perfil, obtidos via login com Google ou cadastro manual.</li>
              <li><strong>Dados de uso:</strong> formulários criados, configurações, leads gerados pelos seus funis.</li>
              <li><strong>Dados de leads:</strong> respostas dos usuários finais aos formulários publicados (nome, interesse, disponibilidade de investimento).</li>
              <li><strong>Dados de pagamento:</strong> processados pelo Stripe. Não armazenamos dados de cartão de crédito.</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, páginas acessadas — coletados automaticamente para segurança e melhoria do serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Como usamos seus dados</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Criar e gerenciar sua conta</li>
              <li>Operar os formulários e entregar leads via WhatsApp</li>
              <li>Processar pagamentos e emitir cobranças</li>
              <li>Enviar comunicações sobre o serviço (sem spam)</li>
              <li>Melhorar a plataforma com base no comportamento de uso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Compartilhamento de dados</h2>
            <p>Não vendemos seus dados. Compartilhamos apenas com:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Supabase</strong> — banco de dados e autenticação</li>
              <li><strong>Stripe</strong> — processamento de pagamentos</li>
              <li><strong>Google</strong> — autenticação OAuth</li>
              <li><strong>Vercel</strong> — hospedagem da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cookies</h2>
            <p>Usamos cookies essenciais para manter sua sessão autenticada. Não utilizamos cookies de rastreamento de terceiros.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Seus direitos (LGPD)</h2>
            <p>De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Acessar os dados que temos sobre você</li>
              <li>Corrigir dados incompletos ou incorretos</li>
              <li>Solicitar a exclusão dos seus dados</li>
              <li>Revogar consentimento a qualquer momento</li>
            </ul>
            <p className="mt-2">Para exercer esses direitos, entre em contato: <strong>marciolarosa@gmail.com</strong></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Retenção de dados</h2>
            <p>Mantemos seus dados enquanto sua conta estiver ativa. Após cancelamento, os dados são excluídos em até 90 dias, salvo obrigação legal.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Alterações nesta política</h2>
            <p>Podemos atualizar esta política periodicamente. Notificaremos por e-mail em caso de mudanças significativas.</p>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 px-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Capta+. ·{' '}
        <Link href="/termos" className="hover:text-gray-600 transition-colors">Termos de Serviço</Link>
      </footer>
    </div>
  );
}
