'use client';

import { useState, Suspense } from 'react';
import FormEditor from '@/components/form-editor';
import TemplateSelector from '@/components/template-selector';
import { getTemplate } from '@/lib/templates';

function NewFormContent() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  if (!selectedTemplateId) {
    return <TemplateSelector onSelect={setSelectedTemplateId} />;
  }

  const template = getTemplate(selectedTemplateId);
  return (
    <FormEditor
      mode="create"
      templateId={selectedTemplateId}
      templateData={template?.data}
    />
  );
}

export default function NewFormPage() {
  return (
    <Suspense>
      <NewFormContent />
    </Suspense>
  );
}
