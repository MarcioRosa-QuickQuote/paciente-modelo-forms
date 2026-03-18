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
}
