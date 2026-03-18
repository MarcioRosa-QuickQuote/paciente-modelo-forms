import { notFound } from 'next/navigation';
import { getFormBySlug, rowToFormData, initializeDb } from '@/db';
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
    title: `Paciente Modelo - ${form.procedureName}`,
    description: `Seja paciente modelo de ${form.procedureName} com ${form.professionalName}`,
    openGraph: {
      title: `Paciente Modelo - ${form.procedureName}`,
      description: `Seja paciente modelo de ${form.procedureName} com ${form.professionalName}`,
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

  return <MultiStepForm formData={formData} />;
}
