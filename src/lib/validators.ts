import { z } from 'zod';

const workflowOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  target: z.enum(['next', 'step', 'celebration', 'rejected']).optional(),
  nextStepId: z.string().optional(),
});

const canvasElementSchema = z.object({
  id: z.string(),
  type: z.enum([
    'heading',
    'text',
    'image',
    'buttons',
    'spacer',
    'divider',
    'input-text',
    'input-phone',
    'input-email',
    'input-number',
    'input-date',
    'input-select',
    'checklist',
    'video',
    'highlight',
    'location',
    'location-map',
  ]),
  content: z.string().optional(),
  imageUrl: z.string().optional(),
  yesText: z.string().optional(),
  noText: z.string().optional(),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  options: z.string().optional(),
  videoUrl: z.string().optional(),
  color: z.string().optional(),
  title: z.string().optional(),
  address: z.string().optional(),
  mapsUrl: z.string().optional(),
  wazeUrl: z.string().optional(),
  details: z.string().optional(),
  showAddress: z.boolean().optional(),
});

const stepSchema = z.object({
  id: z.string(),
  type: z.enum(['foto', 'disponibilidade', 'preco', 'taxa', 'pergunta', 'livre']),
  label: z.string().optional(),
  icon: z.string().optional(),
  question: z.string().optional(),
  yesText: z.string().optional(),
  noText: z.string().optional(),
  hidden: z.boolean().optional(),
  workflowPosition: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
  workflowNextStepId: z.string().optional(),
  branchGenerated: z.boolean().optional(),
  branchSourceStepId: z.string().optional(),
  branchSourceOptionId: z.string().optional(),
  workflowOptions: z.array(workflowOptionSchema).optional(),
  elements: z.array(canvasElementSchema).optional(),
});

const customTextsSchema = z.object({
  availabilityQuestion: z.string().optional(),
  durationNote: z.string().optional(),
  pricingContext: z.string().optional(),
  pricingQuestion: z.string().optional(),
  pricingLabel: z.string().optional(),
  feeTextPrefix: z.string().optional(),
  feeBenefitText: z.string().optional(),
  feeDeductedLabel: z.string().optional(),
  feeSafeLabel: z.string().optional(),
  celebrationTitle: z.string().optional(),
  celebrationSubtitle: z.string().optional(),
  celebrationMessage: z.string().optional(),
}).default({});

const photoPairSchema = z.object({
  before: z.string(),
  after: z.string(),
});

const formFieldsSchema = z.object({
  name: z.boolean(),
  whatsapp: z.boolean(),
  email: z.boolean(),
}).default({ name: true, whatsapp: true, email: true });

const commonFormShape = {
  isDraft: z.boolean().default(false),
  availableDays: z.string().default(''),
  installmentCount: z.number().min(0).default(0),
  installmentAmount: z.number().min(0).default(0),
  procedureDuration: z.string().default(''),
  beforeImage: z.string().default(''),
  afterImage: z.string().default(''),
  photos: z.array(photoPairSchema).default([]),
  headline: z.string().default(''),
  supportText: z.string().default(''),
  isActive: z.boolean().default(true),
  whatsappMessage: z.string().default(''),
  finalScreenType: z.enum(['whatsapp', 'form']).default('whatsapp'),
  formFields: formFieldsSchema,
  theme: z.string().default('purple'),
  pixelId: z.string().default(''),
  capiToken: z.string().default(''),
  singlePhoto: z.boolean().default(false),
  showOnlyInstallment: z.boolean().default(false),
  customTexts: customTextsSchema,
  steps: z.array(stepSchema).default([]),
} as const;

export const formInputSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  procedureName: z.string().min(1, 'Nome do procedimento é obrigatório'),
  regularPrice: z.number().positive('Valor deve ser positivo'),
  modelPrice: z.number().positive('Valor deve ser positivo'),
  feeAmount: z.number().positive('Valor deve ser positivo'),
  professionalName: z.string().min(1, 'Nome da profissional é obrigatório'),
  instagramHandle: z.string().min(1, 'Instagram é obrigatório'),
  whatsappNumber: z.string().min(1, 'WhatsApp é obrigatório'),
  ...commonFormShape,
});

export const draftFormInputSchema = z.object({
  name: z.string().default(''),
  procedureName: z.string().default(''),
  regularPrice: z.number().min(0).default(0),
  modelPrice: z.number().min(0).default(0),
  feeAmount: z.number().min(0).default(0),
  professionalName: z.string().default(''),
  instagramHandle: z.string().default(''),
  whatsappNumber: z.string().default(''),
  ...commonFormShape,
});

export type FormInputSchema = z.infer<typeof formInputSchema>;
