export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  niche: string;
  color: string;
  hasPhotos: boolean;
  data: {
    procedureName: string;
    headline: string;
    supportText: string;
    professionalName: string;
    procedureDuration: string;
    theme: string;
  };
}

export const FORM_TEMPLATES: FormTemplate[] = [
  // ── ESTÉTICA ──────────────────────────────────────────────────
  {
    id: 'paciente-modelo',
    name: 'Paciente Modelo Estética',
    description: 'Captação de pacientes modelo para procedimentos estéticos com condição especial',
    icon: '✨',
    niche: 'Clínica de Estética',
    color: 'from-pink-500 to-purple-600',
    hasPhotos: true,
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
    id: 'botox-harmonizacao',
    name: 'Botox & Harmonização',
    description: 'Captação de pacientes para botox, preenchimento e harmonização orofacial',
    icon: '💆',
    niche: 'Clínica de Estética Facial',
    color: 'from-rose-400 to-pink-600',
    hasPhotos: true,
    data: {
      procedureName: 'Botox',
      headline: 'As rugas de expressão ainda te incomodam?',
      supportText: 'Elimine rugas em 30 minutos, com resultado natural que dura até 6 meses.',
      professionalName: 'Dra. Ana Costa',
      procedureDuration: '30min',
      theme: 'pink',
    },
  },
  {
    id: 'estetica-corporal',
    name: 'Estética Corporal',
    description: 'Criolipólise, massagem redutora, drenagem e redução de medidas',
    icon: '🏃',
    niche: 'Clínica de Estética Corporal',
    color: 'from-orange-400 to-rose-500',
    hasPhotos: true,
    data: {
      procedureName: 'Criolipólise',
      headline: 'A gordura localizada ainda resiste à dieta e exercício?',
      supportText: 'Elimine gordura localizada sem cirurgia, sem dor e sem tempo de recuperação.',
      professionalName: 'Dra. Carla Mendes',
      procedureDuration: '1hr',
      theme: 'orange',
    },
  },
  {
    id: 'capilar-micropigmentacao',
    name: 'Clínica Capilar',
    description: 'Micropigmentação capilar, tratamento de alopecia e calvície',
    icon: '💈',
    niche: 'Clínica Capilar',
    color: 'from-slate-500 to-zinc-700',
    hasPhotos: true,
    data: {
      procedureName: 'Micropigmentação Capilar',
      headline: 'A queda de cabelo está afetando sua autoestima?',
      supportText: 'Recupere a aparência de cabelo denso em 3 sessões, sem cirurgia e sem dor.',
      professionalName: 'Dr. Rafael Gomes',
      procedureDuration: '3hr',
      theme: 'dark',
    },
  },

  // ── ODONTOLOGIA ────────────────────────────────────────────────
  {
    id: 'clareamento-dental',
    name: 'Clareamento Dental',
    description: 'Captação para clareamento a laser ou caseiro supervisionado',
    icon: '🦷',
    niche: 'Clínica Odontológica',
    color: 'from-blue-400 to-cyan-500',
    hasPhotos: true,
    data: {
      procedureName: 'Clareamento Dental a Laser',
      headline: 'Quer um sorriso mais branco em apenas 1 hora?',
      supportText: 'Clarear até 8 tons em uma única sessão, de forma segura e indolor.',
      professionalName: 'Dr. Paulo Souza',
      procedureDuration: '1hr',
      theme: 'blue',
    },
  },
  {
    id: 'implante-dental',
    name: 'Implante Dental',
    description: 'Captação de pacientes para implante unitário ou protocolo completo',
    icon: '😁',
    niche: 'Clínica Odontológica',
    color: 'from-sky-500 to-blue-600',
    hasPhotos: true,
    data: {
      procedureName: 'Implante Dental',
      headline: 'A falta de dente está te impedindo de sorrir com confiança?',
      supportText: 'Implante com aspecto 100% natural. Mastigação e estética recuperadas em definitivo.',
      professionalName: 'Dra. Juliana Pires',
      procedureDuration: '2hr',
      theme: 'blue',
    },
  },
  {
    id: 'facetas-laminados',
    name: 'Facetas & Lentes',
    description: 'Lentes de contato dental e facetas de porcelana para sorriso perfeito',
    icon: '💎',
    niche: 'Clínica Odontológica',
    color: 'from-cyan-400 to-teal-500',
    hasPhotos: true,
    data: {
      procedureName: 'Facetas de Porcelana',
      headline: 'Quer transformar seu sorriso em menos de 2 semanas?',
      supportText: 'Laminados ultrafinos que parecem dentes naturais. Sem dor, sem desgaste excessivo.',
      professionalName: 'Dr. Felipe Alves',
      procedureDuration: '2hr',
      theme: 'blue',
    },
  },

  // ── SAÚDE & FITNESS ────────────────────────────────────────────
  {
    id: 'nutricao-emagrecimento',
    name: 'Nutrição & Emagrecimento',
    description: 'Captação de pacientes para acompanhamento nutricional e perda de peso',
    icon: '🥗',
    niche: 'Clínica de Nutrição',
    color: 'from-emerald-400 to-green-600',
    hasPhotos: false,
    data: {
      procedureName: 'Protocolo de Emagrecimento',
      headline: 'Você ainda não consegue emagrecer mesmo fazendo dieta?',
      supportText: 'Plano alimentar 100% personalizado para o seu perfil. Resultado visível em 30 dias.',
      professionalName: 'Dra. Luana Verde',
      procedureDuration: '1hr',
      theme: 'emerald',
    },
  },
  {
    id: 'personal-trainer',
    name: 'Personal Trainer',
    description: 'Captação de alunos para treino personalizado presencial ou online',
    icon: '💪',
    niche: 'Fitness & Personal',
    color: 'from-amber-400 to-orange-500',
    hasPhotos: false,
    data: {
      procedureName: 'Treino Personalizado',
      headline: 'Ainda sem resultado na academia mesmo treinando há meses?',
      supportText: 'Treino 100% personalizado para seu objetivo. Resultado visível em 30 dias ou seu dinheiro de volta.',
      professionalName: 'Fernando Silva',
      procedureDuration: '1hr',
      theme: 'gold',
    },
  },

  // ── ADVOCACIA ──────────────────────────────────────────────────
  {
    id: 'advocacia-trabalhista',
    name: 'Advocacia Trabalhista',
    description: 'Captação de clientes para ações de demissão, FGTS, verbas rescisórias',
    icon: '⚖️',
    niche: 'Advocacia Trabalhista',
    color: 'from-slate-600 to-gray-800',
    hasPhotos: false,
    data: {
      procedureName: 'Análise de Caso Trabalhista',
      headline: 'Você foi demitido sem receber tudo que tinha direito?',
      supportText: 'Descubra em minutos se você tem direito a indenização por verbas trabalhistas não pagas.',
      professionalName: 'Dr. Carlos Lima',
      procedureDuration: '45min',
      theme: 'dark',
    },
  },
  {
    id: 'advocacia-previdenciaria',
    name: 'Advocacia Previdenciária',
    description: 'Captação de clientes com INSS negado, aposentadoria e BPC',
    icon: '📋',
    niche: 'Advocacia Previdenciária',
    color: 'from-gray-600 to-slate-800',
    hasPhotos: false,
    data: {
      procedureName: 'Análise Previdenciária Gratuita',
      headline: 'Seu benefício do INSS foi negado ou cortado?',
      supportText: 'Mais de 40% dos pedidos negados pelo INSS têm direito a recurso. Descubra o seu caso.',
      professionalName: 'Dra. Sandra Rocha',
      procedureDuration: '45min',
      theme: 'dark',
    },
  },

  // ── PSICOLOGIA ────────────────────────────────────────────────
  {
    id: 'psicologia-terapia',
    name: 'Psicologia & Terapia',
    description: 'Captação de pacientes para psicoterapia individual online ou presencial',
    icon: '🧠',
    niche: 'Psicologia',
    color: 'from-violet-500 to-purple-700',
    hasPhotos: false,
    data: {
      procedureName: 'Sessão de Psicoterapia',
      headline: 'Ansiedade, estresse ou relacionamentos estão pesando demais?',
      supportText: 'Terapia online acessível, discreta e eficaz. Primeira sessão experimental disponível.',
      professionalName: 'Dra. Fernanda Melo',
      procedureDuration: '50min',
      theme: 'purple',
    },
  },

  // ── EM BRANCO ─────────────────────────────────────────────────
  {
    id: 'em-branco',
    name: 'Em Branco',
    description: 'Comece do zero e personalize tudo para o seu negócio',
    icon: '📝',
    niche: 'Personalizado',
    color: 'from-gray-400 to-gray-600',
    hasPhotos: true,
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
