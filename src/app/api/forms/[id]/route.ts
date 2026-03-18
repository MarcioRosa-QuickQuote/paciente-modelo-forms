import { NextRequest, NextResponse } from 'next/server';
import { getFormById, updateForm, deleteForm, rowToFormData, initializeDb } from '@/db';
import { formInputSchema } from '@/lib/validators';
import { generateSlug } from '@/lib/utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDb();
    const { id } = await params;
    const row = await getFormById(id);
    if (!row) {
      return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });
    }
    return NextResponse.json(rowToFormData(row));
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json({ error: 'Erro ao buscar formulário' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDb();
    const { id } = await params;
    const existing = await getFormById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });
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
    if (data.procedureName !== undefined) updateData.procedure_name = data.procedureName;
    if (data.availableDays !== undefined) updateData.available_days = data.availableDays;
    if (data.regularPrice !== undefined) updateData.regular_price = data.regularPrice;
    if (data.modelPrice !== undefined) updateData.model_price = data.modelPrice;
    if (data.feeAmount !== undefined) updateData.fee_amount = data.feeAmount;
    if (data.professionalName !== undefined) updateData.professional_name = data.professionalName;
    if (data.instagramHandle !== undefined) updateData.instagram_handle = data.instagramHandle;
    if (data.whatsappNumber !== undefined) updateData.whatsapp_number = data.whatsappNumber;
    if (data.beforeImage !== undefined) updateData.before_image = data.beforeImage;
    if (data.afterImage !== undefined) updateData.after_image = data.afterImage;
    if (data.whatsappMessage !== undefined) updateData.whatsapp_message = data.whatsappMessage;
    if (data.finalScreenType !== undefined) updateData.final_screen_type = data.finalScreenType;
    if (data.formFields !== undefined) updateData.form_fields = data.formFields;
    if (data.theme !== undefined) updateData.theme = data.theme;

    await updateForm(id, updateData);

    const updated = await getFormById(id);
    return NextResponse.json(rowToFormData(updated!));
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json({ error: 'Erro ao atualizar formulário' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDb();
    const { id } = await params;
    const existing = await getFormById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });
    }

    await deleteForm(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ error: 'Erro ao excluir formulário' }, { status: 500 });
  }
}
