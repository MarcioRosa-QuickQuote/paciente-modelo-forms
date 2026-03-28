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

  const workflowStarter = selectedTemplateId === 'workflow-builder';
  const resolvedTemplateId = workflowStarter ? 'em-branco' : selectedTemplateId;
  const template = getTemplate(resolvedTemplateId);

  return (
    <FormEditor
      mode="create"
      templateId={resolvedTemplateId}
      templateData={template?.data}
      initialEditorMode={workflowStarter ? 'workflow' : 'step'}
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
