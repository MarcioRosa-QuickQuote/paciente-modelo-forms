import { z } from 'zod';

export const formInputSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  procedureName: z.string().min(1, 'Nome do procedimento é obrigatório'),
  availableDays: z.string().default(''),
  regularPrice: z.number().positive('Valor deve ser positivo'),
  modelPrice: z.number().positive('Valor deve ser positivo'),
  feeAmount: z.number().positive('Valor deve ser positivo'),
  installmentCount: z.number().min(0).default(0),
  installmentAmount: z.number().min(0).default(0),
  procedureDuration: z.string().default(''),
  professionalName: z.string().min(1, 'Nome da profissional é obrigatório'),
  instagramHandle: z.string().min(1, 'Instagram é obrigatório'),
  whatsappNumber: z.string().min(1, 'WhatsApp é obrigatório'),
  beforeImage: z.string().default(''),
  afterImage: z.string().default(''),
  photos: z.array(z.object({ before: z.string(), after: z.string() })).default([]),
  headline: z.string().default(''),
  supportText: z.string().default(''),
  whatsappMessage: z.string().default(''),
  finalScreenType: z.enum(['whatsapp', 'form']).default('whatsapp'),
  formFields: z.object({
    name: z.boolean(),
    whatsapp: z.boolean(),
    email: z.boolean(),
  }).default({ name: true, whatsapp: true, email: true }),
  theme: z.string().default('purple'),
  steps: z.array(z.object({
    id: z.string(),
    type: z.enum(['foto', 'disponibilidade', 'preco', 'taxa', 'pergunta']),
    question: z.string().optional(),
    yesText: z.string().optional(),
    noText: z.string().optional(),
  })).default([]),
});

export type FormInputSchema = z.infer<typeof formInputSchema>;
