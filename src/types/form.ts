export type FinalScreenType = 'whatsapp' | 'form';

export type FormStepType = 'foto' | 'disponibilidade' | 'preco' | 'taxa' | 'pergunta' | 'livre';
export type WorkflowOptionTarget = 'next' | 'step' | 'celebration' | 'rejected';

export type CanvasElementType =
  | 'heading' | 'text' | 'image' | 'buttons' | 'spacer' | 'divider'
  | 'input-text' | 'input-phone' | 'input-email' | 'input-number' | 'input-date' | 'input-select'
  | 'checklist' | 'video' | 'highlight' | 'location' | 'location-map';

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  content?: string;
  imageUrl?: string;
  yesText?: string;
  noText?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  options?: string;
  videoUrl?: string;
  color?: string;
  title?: string;
  address?: string;
  mapsUrl?: string;
  wazeUrl?: string;
  details?: string;
  showAddress?: boolean;
}

export interface WorkflowPosition {
  x: number;
  y: number;
}

export interface WorkflowOption {
  id: string;
  label: string;
  description?: string;
  target?: WorkflowOptionTarget;
  nextStepId?: string;
}

export interface FormStep {
  id: string;
  type: FormStepType;
  label?: string;    // nome personalizado (usado em telas 'livre')
  icon?: string;
  question?: string;
  yesText?: string;
  noText?: string;
  elements?: CanvasElement[];
  hidden?: boolean; // se true, a tela não aparece no formulário gerado
  workflowPosition?: WorkflowPosition;
  workflowOptions?: WorkflowOption[];
}

export interface CustomTexts {
  availabilityQuestion?: string;
  durationNote?: string;
  pricingContext?: string;
  pricingQuestion?: string;
  pricingLabel?: string;
  feeTextPrefix?: string;
  feeBenefitText?: string;
  feeDeductedLabel?: string;
  feeSafeLabel?: string;
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
  isDraft: boolean;
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
  pixelId: string;
  capiToken: string;
  userId: string;
  steps: FormStep[];
  customTexts: CustomTexts;
  createdAt: string;
  updatedAt: string;
}

export interface FormInput {
  name: string;
  slug?: string;
  isDraft?: boolean;
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
  pixelId: string;
  capiToken: string;
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
