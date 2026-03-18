export type FinalScreenType = 'whatsapp' | 'form';

export interface FormFields {
  name: boolean;
  whatsapp: boolean;
  email: boolean;
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
  professionalName: string;
  instagramHandle: string;
  whatsappNumber: string;
  beforeImage: string;
  afterImage: string;
  isActive: boolean;
  whatsappMessage: string;
  finalScreenType: FinalScreenType;
  formFields: FormFields;
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
  professionalName: string;
  instagramHandle: string;
  whatsappNumber: string;
  beforeImage: string;
  afterImage: string;
  whatsappMessage: string;
  finalScreenType: FinalScreenType;
  formFields: FormFields;
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
