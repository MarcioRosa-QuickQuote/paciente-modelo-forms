import Link from 'next/link';
import Image from 'next/image';

export const metadata = { title: 'Termos de Serviço — Capta+' };

export default function TermosPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Serviço</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: março de 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceitação dos termos</h2>
            <p>Ao criar uma conta ou utilizar o <strong>Capta+</strong>, você concorda com estes Termos de Serviço. Se não concordar, não utilize a plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. O serviço</h2>
            <p>O Capta+ oferece uma plataforma para criação de funis de conversão interativos, com captação de leads qualificados via formulários personalizados. O serviço é prestado no modelo SaaS (Software como Serviço), mediante assinatura mensal.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Período de teste</h2>
            <p>Novos usuários têm acesso gratuito por <strong>7 dias</strong>, sem necessidade de cartão de crédito. Após esse período, é necessária a contratação de um plano para continuar utilizando.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Planos e pagamentos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Os planos são cobrados mensalmente via cartão de crédito pelo Stripe.</li>
              <li>O valor é debitado automaticamente a cada período de renovação.</li>
              <li>Não há reembolso proporcional por cancelamento no meio do ciclo.</li>
              <li>Preços podem ser alterados com aviso prévio de 30 dias por e-mail.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cancelamento</h2>
            <p>Você pode cancelar sua assinatura a qualquer momento pelo painel ou por e-mail. O acesso permanece ativo até o fim do período já pago. Após o cancelamento, os dados ficam disponíveis por 30 dias para exportação.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Uso aceitável</h2>
            <p>É proibido usar o Capta+ para:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Coletar dados de forma enganosa ou sem consentimento dos leads</li>
              <li>Enviar spam ou comunicações não autorizadas</li>
              <li>Violar leis de proteção de dados (LGPD, GDPR)</li>
              <li>Fazer engenharia reversa ou cópia da plataforma</li>
              <li>Revender o serviço sem autorização</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Seus dados e conteúdo</h2>
            <p>Você é proprietário dos dados dos seus leads e do conteúdo dos seus formulários. O Capta+ não utiliza esses dados para fins comerciais próprios. Ao usar a plataforma, você nos autoriza a armazenar e processar esses dados para prestar o serviço contratado.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Disponibilidade</h2>
            <p>Buscamos manter o serviço disponível 24/7, mas não garantimos disponibilidade ininterrupta. Manutenções programadas serão avisadas com antecedência. Não nos responsabilizamos por perdas decorrentes de instabilidades.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitação de responsabilidade</h2>
            <p>O Capta+ não se responsabiliza por resultados de vendas, conversão de leads ou desempenho comercial do usuário. A plataforma é uma ferramenta — os resultados dependem do uso e do contexto de cada negócio.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Alterações nos termos</h2>
            <p>Podemos atualizar estes termos. Mudanças significativas serão comunicadas por e-mail com 15 dias de antecedência. O uso continuado após a vigência das mudanças implica aceitação.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contato</h2>
            <p>Dúvidas sobre estes termos: <strong>marciolarosa@gmail.com</strong></p>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 px-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Capta+. ·{' '}
        <Link href="/privacidade" className="hover:text-gray-600 transition-colors">Política de Privacidade</Link>
      </footer>
    </div>
  );
}
