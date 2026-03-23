export type FinalScreenType = 'whatsapp' | 'form';

export type FormStepType = 'foto' | 'disponibilidade' | 'preco' | 'taxa' | 'pergunta';

export interface FormStep {
  id: string;
  type: FormStepType;
  question?: string;   // only for 'pergunta' type
  yesText?: string;    // only for 'pergunta' type
  noText?: string;     // only for 'pergunta' type
}

export interface CustomTexts {
  // Tela 2 - Disponibilidade
  availabilityQuestion?: string;
  durationNote?: string;
  // Tela 3 - Preço
  pricingContext?: string;
  pricingQuestion?: string;
  pricingLabel?: string;
  // Tela 4 - Taxa
  feeTextPrefix?: string;
  feeBenefitText?: string;
  feeDeductedLabel?: string;
  feeSafeLabel?: string;
  // Celebração
  celebrationTitle?: string;
  celebrationSubtitle?: string;
  celebrationMessage?: string;
}

export interface FormFields {
  name: boolean;
  whatsapp: boolean;
  email: boolean;
}

export interface PhotoPair {
  before: string;
  after: string;
}

export interface FormData {
  id: string;
  name: string;
  slug: string;
  procedureName: string;
  availableDays: string;
  regularPrice: number;
  modelPrice: number;
  feeAmount: number;
  installmentCount: number;
  installmentAmount: number;
  procedureDuration: string;
  professionalName: string;
  instagramHandle: string;
  whatsappNumber: string;
  beforeImage: string;
  afterImage: string;
  photos: PhotoPair[];
  singlePhoto: boolean;
  showOnlyInstallment: boolean;
  headline: string;
  supportText: string;
  isActive: boolean;
  whatsappMessage: string;
  finalScreenType: FinalScreenType;
  formFields: FormFields;
  theme: string;
  userId: string;
  steps: FormStep[];
  customTexts: CustomTexts;
  createdAt: string;
  updatedAt: string;
}

export interface FormInput {
  name: string;
  procedureName: string;
  availableDays: string;
  regularPrice: number;
  modelPrice: number;
  feeAmount: number;
  installmentCount: number;
  installmentAmount: number;
  procedureDuration: string;
  professionalName: string;
  instagramHandle: string;
  whatsappNumber: string;
  beforeImage: string;
  afterImage: string;
  photos: PhotoPair[];
  singlePhoto: boolean;
  showOnlyInstallment: boolean;
  headline: string;
  supportText: string;
  whatsappMessage: string;
  finalScreenType: FinalScreenType;
  formFields: FormFields;
  theme: string;
  steps: FormStep[];
  customTexts: CustomTexts;
}

export interface Lead {
  id: number;
  formId: string;
  formName: string;
  name: string;
  whatsapp: string;
  email: string;
  createdAt: string;
}

export interface ClinicSettings {
  clinicLogo: string;
  pixelId: string;
}
