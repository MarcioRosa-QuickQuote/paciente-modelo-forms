'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FormEditor from '@/components/form-editor';
import TemplateSelector from '@/components/template-selector';
import { getTemplate } from '@/lib/templates';

export default function NewFormPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templateId);

  if (!selectedTemplateId) {
    return <TemplateSelector onSelect={setSelectedTemplateId} />;
  }

  const template = getTemplate(selectedTemplateId);
  return (
    <FormEditor
      mode="create"
      templateData={template?.data}
    />
  );
}
