import { NextRequest, NextResponse } from 'next/server';
import { deleteForm, getFormById, initializeDb, rowToFormData, updateForm } from '@/db';
import { formInputSchema } from '@/lib/validators';
import { generateSlug } from '@/lib/utils';

function getErrorDetails(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const maybeError = error as Record<string, unknown>;
    const parts = [
      maybeError.message,
      maybeError.details,
      maybeError.hint,
      maybeError.code,
    ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    if (parts.length > 0) {
      return parts.join(' | ');
    }

    try {
      return JSON.stringify(error);
    } catch {
      return '[erro sem detalhes serializaveis]';
    }
  }

  return String(error);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await initializeDb();
    const { id } = await params;
    const row = await getFormById(id);

    if (!row) {
      return NextResponse.json({ error: 'Formulario nao encontrado' }, { status: 404 });
    }

    return NextResponse.json(rowToFormData(row));
  } catch (error) {
    console.error('Error fetching form:', error);
    const details = getErrorDetails(error);
    return NextResponse.json({ error: 'Erro ao buscar formulario', details }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await initializeDb();
    const { id } = await params;
    const existing = await getFormById(id);

    if (!existing) {
      return NextResponse.json({ error: 'Formulario nao encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = formInputSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
      updateData.slug = generateSlug(data.name);
    }
    if (data.isDraft !== undefined) {
      updateData.is_draft = data.isDraft;
      if (data.isDraft) {
        updateData.is_active = false;
      }
    }
    if (data.procedureName !== undefined) updateData.procedure_name = data.procedureName;
    if (data.availableDays !== undefined) updateData.available_days = data.availableDays;
    if (data.regularPrice !== undefined) updateData.regular_price = data.regularPrice;
    if (data.modelPrice !== undefined) updateData.model_price = data.modelPrice;
    if (data.feeAmount !== undefined) updateData.fee_amount = data.feeAmount;
    if (data.installmentCount !== undefined) updateData.installment_count = data.installmentCount;
    if (data.installmentAmount !== undefined) updateData.installment_amount = data.installmentAmount;
    if (data.procedureDuration !== undefined) updateData.procedure_duration = data.procedureDuration;
    if (data.professionalName !== undefined) updateData.professional_name = data.professionalName;
    if (data.instagramHandle !== undefined) updateData.instagram_handle = data.instagramHandle;
    if (data.whatsappNumber !== undefined) updateData.whatsapp_number = data.whatsappNumber;
    if (data.photos !== undefined) {
      updateData.photos = data.photos;
      if (data.photos.length > 0) {
        updateData.before_image = data.photos[0].before;
        updateData.after_image = data.photos[0].after;
      }
    }
    if (data.beforeImage !== undefined) updateData.before_image = data.beforeImage;
    if (data.afterImage !== undefined) updateData.after_image = data.afterImage;
    if (data.headline !== undefined) updateData.headline = data.headline;
    if (data.supportText !== undefined) updateData.support_text = data.supportText;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.whatsappMessage !== undefined) updateData.whatsapp_message = data.whatsappMessage;
    if (data.finalScreenType !== undefined) updateData.final_screen_type = data.finalScreenType;
    if (data.formFields !== undefined) updateData.form_fields = data.formFields;
    if (data.theme !== undefined) updateData.theme = data.theme;
    if (data.pixelId !== undefined) updateData.pixel_id = data.pixelId;
    if (data.capiToken !== undefined) updateData.capi_token = data.capiToken;
    if (data.singlePhoto !== undefined) updateData.single_photo = data.singlePhoto;
    if (data.showOnlyInstallment !== undefined) updateData.show_only_installment = data.showOnlyInstallment;
    if (data.steps !== undefined) updateData.steps = data.steps;
    if (data.customTexts !== undefined) updateData.custom_texts = data.customTexts;

    await updateForm(id, updateData);

    const updated = await getFormById(id);
    return NextResponse.json(rowToFormData(updated!));
  } catch (error) {
    console.error('Error updating form:', error);
    const details = getErrorDetails(error);
    return NextResponse.json({ error: 'Erro ao atualizar formulario', details }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await initializeDb();
    const { id } = await params;
    const existing = await getFormById(id);

    if (!existing) {
      return NextResponse.json({ error: 'Formulario nao encontrado' }, { status: 404 });
    }

    await deleteForm(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting form:', error);
    const details = getErrorDetails(error);
    return NextResponse.json({ error: 'Erro ao excluir formulario', details }, { status: 500 });
  }
}
