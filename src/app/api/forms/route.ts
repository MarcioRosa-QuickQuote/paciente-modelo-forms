import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAllForms, createForm, rowToFormData, initializeDb } from '@/db';
import { formInputSchema } from '@/lib/validators';
import { generateSlug } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

async function getUserIdFromRequest(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return '';
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await supabase.auth.getUser(token);
  return user?.id || '';
}

export async function GET(request: NextRequest) {
  try {
    await initializeDb();
    const userId = await getUserIdFromRequest(request);
    const rows = await getAllForms(userId || undefined);
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
    const userId = await getUserIdFromRequest(request);
    const body = await request.json();
    const parsed = formInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const id = uuidv4();
    const slug = generateSlug(data.name);
    const firstPhoto = data.photos?.[0] || { before: data.beforeImage || '', after: data.afterImage || '' };

    await createForm({
      id,
      name: data.name,
      slug,
      procedure_name: data.procedureName,
      available_days: data.availableDays,
      regular_price: data.regularPrice,
      model_price: data.modelPrice,
      fee_amount: data.feeAmount,
      installment_count: data.installmentCount || 0,
      installment_amount: data.installmentAmount || 0,
      procedure_duration: data.procedureDuration || '',
      professional_name: data.professionalName,
      instagram_handle: data.instagramHandle,
      whatsapp_number: data.whatsappNumber,
      before_image: firstPhoto.before,
      after_image: firstPhoto.after,
      photos: data.photos || [],
      headline: data.headline || '',
      support_text: data.supportText || '',
      is_active: true,
      whatsapp_message: data.whatsappMessage || '',
      final_screen_type: data.finalScreenType || 'whatsapp',
      form_fields: data.formFields || { name: true, whatsapp: true, email: true },
      theme: data.theme || 'purple',
      pixel_id: data.pixelId || '',
      capi_token: data.capiToken || '',
      single_photo: data.singlePhoto ?? false,
      show_only_installment: data.showOnlyInstallment ?? false,
      user_id: userId,
      steps: data.steps || [],
      custom_texts: data.customTexts || {},
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
