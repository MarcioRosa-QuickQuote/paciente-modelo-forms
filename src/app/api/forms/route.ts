import { NextRequest, NextResponse } from 'next/server';
import { getAllForms, createForm, rowToFormData, initializeDb } from '@/db';
import { formInputSchema } from '@/lib/validators';
import { generateSlug } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    await initializeDb();
    const rows = await getAllForms();
    const forms = rows.map(rowToFormData);
    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Erro ao buscar formulários', details: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDb();
    const body = await request.json();
    const parsed = formInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const id = uuidv4();
    const slug = generateSlug(data.name);

    await createForm({
      id,
      name: data.name,
      slug,
      procedure_name: data.procedureName,
      available_days: data.availableDays,
      regular_price: data.regularPrice,
      model_price: data.modelPrice,
      fee_amount: data.feeAmount,
      professional_name: data.professionalName,
      instagram_handle: data.instagramHandle,
      whatsapp_number: data.whatsappNumber,
      before_image: data.beforeImage,
      after_image: data.afterImage,
      is_active: true,
    });

    return NextResponse.json({ id, slug }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating form:', error);
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'Já existe um formulário com esse nome' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro ao criar formulário' }, { status: 500 });
  }
}
