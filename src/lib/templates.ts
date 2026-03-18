export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  niche: string;
  color: string;
  data: {
    procedureName: string;
    headline: string;
    supportText: string;
    professionalName: string;
    procedureDuration: string;
    theme: string;
    yesButtonText?: string;
  };
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'paciente-modelo-estetica',
    name: 'Paciente Modelo',
    description: 'Captação de pacientes modelo para procedimentos estéticos',
    icon: '✨',
    niche: 'Clínica de Estética',
    color: 'from-pink-500 to-purple-600',
    data: {
      procedureName: 'Preenchimento Labial',
      headline: '',
      supportText: '',
      professionalName: 'Dra. Maria Silva',
      procedureDuration: '2hr',
      theme: 'rose',
    },
  },
  {
    id: 'estetica-facial',
    name: 'Estética Facial',
    description: 'Botox, harmonização, bioestimulador e mais',
    icon: '💆',
    niche: 'Clínica de Estética',
    color: 'from-rose-400 to-pink-600',
    data: {
      procedureName: 'Botox',
      headline: 'Suas rugas te incomodam?',
      supportText: 'Elimine rugas de expressão de forma natural, sem dor e sem cicatrizes.',
      professionalName: 'Dra. Ana Costa',
      procedureDuration: '1hr',
      theme: 'pink',
    },
  },
  {
    id: 'estetica-corporal',
    name: 'Estética Corporal',
    description: 'Redução de medidas, celulite, flacidez',
    icon: '🏃',
    niche: 'Clínica de Estética',
    color: 'from-orange-400 to-rose-500',
    data: {
      procedureName: 'Criolipólise',
      headline: 'A gordura localizada ainda te incomoda?',
      supportText: 'Elimine gordura localizada sem cirurgia, sem dor e sem tempo de recuperação.',
      professionalName: 'Dra. Carla Mendes',
      procedureDuration: '1h30min',
      theme: 'orange',
    },
  },
  {
    id: 'odontologia',
    name: 'Odontologia',
    description: 'Clareamento, lentes, alinhadores e ortodontia',
    icon: '🦷',
    niche: 'Clínica Odontológica',
    color: 'from-blue-400 to-cyan-500',
    data: {
      procedureName: 'Clareamento Dental',
      headline: 'Seu sorriso ainda não é o que você quer?',
      supportText: 'Clarear até 8 tons em uma única sessão, de forma segura e indolor.',
      professionalName: 'Dr. Paulo Souza',
      procedureDuration: '2hr',
      theme: 'blue',
    },
  },
  {
    id: 'advocacia',
    name: 'Consultoria Jurídica',
    description: 'Captação de clientes para escritórios de advocacia',
    icon: '⚖️',
    niche: 'Advocacia',
    color: 'from-slate-600 to-gray-800',
    data: {
      procedureName: 'Consultoria Trabalhista',
      headline: 'Seus direitos trabalhistas foram violados?',
      supportText: 'Descubra gratuitamente se você tem direito a receber indenização.',
      professionalName: 'Dr. Carlos Lima',
      procedureDuration: '1hr',
      theme: 'dark',
    },
  },
  {
    id: 'nutricao',
    name: 'Nutrição',
    description: 'Emagrecimento, reeducação alimentar e saúde',
    icon: '🥗',
    niche: 'Clínica de Nutrição',
    color: 'from-emerald-400 to-green-600',
    data: {
      procedureName: 'Protocolo de Emagrecimento',
      headline: 'O peso ainda está te prejudicando?',
      supportText: 'Emagreça de forma saudável com acompanhamento profissional personalizado.',
      professionalName: 'Dra. Luana Verde',
      procedureDuration: '1hr',
      theme: 'emerald',
    },
  },
  {
    id: 'personal',
    name: 'Personal Trainer',
    description: 'Captação de alunos para treinamento personalizado',
    icon: '💪',
    niche: 'Fitness & Personal',
    color: 'from-amber-400 to-orange-500',
    data: {
      procedureName: 'Treino Personalizado',
      headline: 'Ainda sem resultados na academia?',
      supportText: 'Alcance seus objetivos em metade do tempo com treino 100% personalizado.',
      professionalName: 'Fernando Silva',
      procedureDuration: '1hr',
      theme: 'gold',
    },
  },
  {
    id: 'em-branco',
    name: 'Em Branco',
    description: 'Comece do zero e personalize tudo',
    icon: '📝',
    niche: 'Personalizado',
    color: 'from-gray-400 to-gray-600',
    data: {
      procedureName: '',
      headline: '',
      supportText: '',
      professionalName: '',
      procedureDuration: '',
      theme: 'purple',
    },
  },
];

export function getTemplate(id: string): FormTemplate | undefined {
  return FORM_TEMPLATES.find(t => t.id === id);
}
