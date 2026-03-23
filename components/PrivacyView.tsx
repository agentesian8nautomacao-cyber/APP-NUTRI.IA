import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const BRAND = 'Nutri.ai';
const OPERATOR_LEGAL = 'PHBsoluções';
const OPERATOR_LOCATION = 'Aracaju, Sergipe, Brasil';

/** E-mail oficial para LGPD / privacidade (alinhado à política publicada do app). */
const PRIVACY_CONTACT_EMAIL = 'phbsolucoes@gmail.com';

const LAST_UPDATED = '22/03/2026';

interface PrivacyViewProps {
  onBack: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#1A4D2E]/5">
    <h3 className="font-serif text-xl text-[#1A4D2E] mb-3">{title}</h3>
    <div className="text-sm text-[#1A1A1A]/85 leading-relaxed space-y-3">{children}</div>
  </section>
);

const PrivacyView: React.FC<PrivacyViewProps> = ({ onBack }) => {
  return (
    <div className="p-6 pb-12 min-h-screen bg-[#F5F1E8] animate-in slide-in-from-right duration-500">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="p-3 bg-white rounded-full shadow-sm text-[#1A4D2E] hover:opacity-90 transition-opacity"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-[#1A4D2E]/10 flex items-center justify-center text-[#1A4D2E] shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A4D2E] truncate">
              Privacidade e dados
            </h1>
            <p className="text-xs text-[#4F6F52] mt-0.5">Última atualização: {LAST_UPDATED}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-[#4F6F52] mb-6 leading-relaxed">
        Aqui explicamos como o <strong className="text-[#1A4D2E]">{OPERATOR_LABEL}</strong> utiliza e protege os
        seus dados pessoais quando você usa o aplicativo. Em caso de dúvidas, use o e-mail indicado na secção
        «Seus direitos».
      </p>

      <div className="space-y-4">
        <Section title="1. Quem é responsável">
          <p>
            O responsável pelo tratamento dos dados pessoais coletados por meio do <strong>{BRAND}</strong> é a{' '}
            <strong>{OPERATOR_LEGAL}</strong>, com sede em {OPERATOR_LOCATION}, na medida em que define as
            finalidades e os meios do tratamento.
          </p>
        </Section>

        <Section title="2. Quais dados podemos tratar">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Conta:</strong> e-mail, nome (se informado), dados de autenticação e metadados de cadastro
              (por exemplo, cupom ou código de convite associado ao registro, plano e status de assinatura quando
              aplicável).
            </li>
            <li>
              <strong>Perfil e plano alimentar:</strong> informações de saúde e estilo de vida que você informar no
              questionário ou perfil — como idade, peso, altura, objetivos, restrições, histórico médico declarado,
              rotina, preferências alimentares e frequência de refeições.
            </li>
            <li>
              <strong>Uso do app:</strong> registros que você criar, como diário alimentar, bem-estar, desafios,
              conteúdo da biblioteca e interações com assistentes.
            </li>
            <li>
              <strong>Imagens:</strong> fotos de alimentos ou pratos que você enviar para análise, quando usar
              recursos que dependem de imagem.
            </li>
            <li>
              <strong>Dados técnicos:</strong> identificadores de sessão, tipo de dispositivo e informações
              necessárias à segurança e ao funcionamento do serviço (incluindo dados tratados por provedores de
              infraestrutura, como endereço IP em logs).
            </li>
          </ul>
        </Section>

        <Section title="3. Para que usamos os dados">
          <ul className="list-disc pl-5 space-y-2">
            <li>Criar e manter sua conta e autenticação.</li>
            <li>Gerar, exibir e armazenar planos alimentares e conteúdos personalizados.</li>
            <li>Permitir funcionalidades de chat, voz ou análise assistida por IA que você acionar.</li>
            <li>Melhorar estabilidade, segurança e experiência do produto.</li>
            <li>Cumprir obrigações legais e responder a solicitações legítimas.</li>
          </ul>
        </Section>

        <Section title="4. Bases legais (LGPD)">
          <p>
            Dependendo da atividade, o tratamento pode se apoiar na execução do contrato ou dos procedimentos
            preliminares relacionados ao serviço que você solicitou, no legítimo interesse (por exemplo,
            segurança e prevenção a fraudes, quando aplicável) ou no consentimento, quando exigido para uma
            finalidade específica.
          </p>
        </Section>

        <Section title="5. Compartilhamento com terceiros">
          <p>
            Utilizamos prestadores de serviços essenciais à operação do app. Eles tratam dados conforme instruções
            e políticas próprias:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>Supabase</strong> — autenticação e armazenamento de dados em banco (perfil, planos e dados
              associados à conta), conforme configuração do projeto.
            </li>
            <li>
              <strong>Google (API Gemini)</strong> — processamento de texto e, quando aplicável, de imagem ou
              áudio, somente quando você utiliza recursos que disparam chamadas à IA.
            </li>
            <li>
              <strong>Hospedagem do site/aplicativo</strong> (por exemplo, Vercel) — entrega do front-end e ativos
              estáticos.
            </li>
            <li>
              <strong>Cakto ou outro provedor de pagamentos</strong> — quando você adquire ou renova um plano, dados
              necessários à transação (como identificação da compra e e-mail) podem ser tratados pelo provedor,
              conforme a política de privacidade dele.
            </li>
            <li>
              <strong>Resend ou serviço equivalente</strong> — envio de e-mails transacionais (por exemplo,
              confirmações relacionadas à conta ou ao serviço), quando essa integração estiver ativa.
            </li>
          </ul>
          <p className="mt-2 text-xs text-[#4F6F52]">
            Políticas dos provedores:{' '}
            <a href="https://supabase.com/privacy" className="text-[#1A4D2E] underline underline-offset-2" target="_blank" rel="noopener noreferrer">
              Supabase
            </a>
            {' · '}
            <a href="https://policies.google.com/privacy" className="text-[#1A4D2E] underline underline-offset-2" target="_blank" rel="noopener noreferrer">
              Google
            </a>
          </p>
          <p className="mt-3">
            Não vendemos seus dados pessoais. Qualquer novo parceiro relevante para tratamento de dados deve ser
            refletido em atualizações desta política.
          </p>
        </Section>

        <Section title="6. Armazenamento e retenção">
          <p>
            Os dados são mantidos enquanto sua conta estiver ativa e pelo tempo necessário para cumprir
            obrigações legais, resolver disputas e fazer valer acordos. Você pode solicitar exclusão da conta e
            dos dados, sujeito a prazos legais de guarda quando houver.
          </p>
        </Section>

        <Section title="7. Segurança">
          <p>
            Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados (como conexão cifrada e
            controles de acesso no backend). Nenhum sistema é totalmente isento de risco; em caso de incidente
            relevante, buscaremos agir conforme a lei aplicável.
          </p>
        </Section>

        <Section title="8. Seus direitos">
          <p>
            Nos termos da LGPD, você pode solicitar confirmação de tratamento, acesso, correção, anonimização,
            bloqueio ou eliminação de dados desnecessários, portabilidade (quando aplicável), informação sobre
            compartilhamentos e revogação de consentimento, quando a base for essa.
          </p>
          <p>
            Para exercer seus direitos ou tirar dúvidas sobre privacidade, escreva para:{' '}
            <a
              href={`mailto:${PRIVACY_CONTACT_EMAIL}?subject=${encodeURIComponent('Política de Privacidade - Nutri.ai')}`}
              className="text-[#1A4D2E] font-semibold underline underline-offset-2 break-all"
            >
              {PRIVACY_CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section title="9. Menores de idade">
          <p>
            O serviço não se destina a menores de 18 anos sem o consentimento e a supervisão de responsáveis
            legais, quando exigido pela lei. Se você for responsável e acreditar que um menor enviou dados sem
            autorização adequada, entre em contato pelo e-mail acima.
          </p>
        </Section>

        <Section title="10. Inteligência artificial e saúde">
          <p>
            Respostas e sugestões geradas por IA são automáticas e podem conter imprecisões. Elas{' '}
            <strong>não substituem</strong> acompanhamento de nutricionista, médico ou outros profissionais de
            saúde. O conteúdo que você envia aos modelos de linguagem é processado pelo provedor de IA de acordo
            com os termos desse provedor.
          </p>
        </Section>

        <Section title="11. Alterações">
          <p>
            Podemos atualizar esta política para refletir mudanças no app ou na legislação. A data no topo desta
            página indica a última revisão relevante. O uso continuado do serviço após alterações pode significar
            que você tomou ciência das mudanças, conforme aplicável.
          </p>
        </Section>
      </div>
    </div>
  );
};

export default PrivacyView;
