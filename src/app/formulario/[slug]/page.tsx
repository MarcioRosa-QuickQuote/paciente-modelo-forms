import { notFound } from 'next/navigation';
import { getFormBySlug, rowToFormData, initializeDb, getClinicSettingsByUserId } from '@/db';
import MultiStepForm from '@/components/multi-step-form/multi-step-form';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await initializeDb();
  const { slug } = await params;
  const row = await getFormBySlug(slug);

  if (!row) {
    return { title: 'Formulário não encontrado' };
  }

  const form = rowToFormData(row);

  return {
    title: `${form.procedureName} - Paciente Modelo`,
    description: form.headline || `Seja paciente modelo de ${form.procedureName} com ${form.professionalName}`,
    openGraph: {
      title: `${form.procedureName} - Paciente Modelo`,
      description: form.headline || `Seja paciente modelo de ${form.procedureName} com ${form.professionalName}`,
      type: 'website',
    },
  };
}

export default async function FormularioPage({ params }: PageProps) {
  await initializeDb();
  const { slug } = await params;
  const row = await getFormBySlug(slug);

  if (!row) {
    notFound();
  }

  const formData = rowToFormData(row);

  // Load clinic settings for this form's owner
  let clinicLogo = '';
  let pixelId = '';
  let capiToken = '';
  if (formData.userId) {
    const settings = await getClinicSettingsByUserId(formData.userId);
    clinicLogo = settings?.clinic_logo || '';
    pixelId = settings?.pixel_id || '';
    capiToken = settings?.capi_token || '';
  }

  return <MultiStepForm formData={formData} clinicLogo={clinicLogo} pixelId={pixelId} capiToken={capiToken} />;
}
