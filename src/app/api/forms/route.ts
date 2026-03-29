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
    const isDraftRequest = body?.isDraft === true;

    if (isDraftRequest) {
      const id = uuidv4();
      const draftName = typeof body.name === 'string' && body.name.trim().length > 0 ? body.name.trim() : 'Novo rascunho';
      const draftSlug = `${generateSlug(draftName || 'rascunho')}-${id.slice(0, 8)}`;
      const draftPhotos = Array.isArray(body.photos) ? body.photos : [];
      const firstPhoto = draftPhotos[0] || { before: body.beforeImage || '', after: body.afterImage || '' };

      await createForm({
        id,
        name: draftName,
        slug: draftSlug,
        is_draft: true,
        procedure_name: body.procedureName || '',
        available_days: body.availableDays || '',
        regular_price: typeof body.regularPrice === 'number' ? body.regularPrice : 0,
        model_price: typeof body.modelPrice === 'number' ? body.modelPrice : 0,
        fee_amount: typeof body.feeAmount === 'number' ? body.feeAmount : 0,
        installment_count: typeof body.installmentCount === 'number' ? body.installmentCount : 0,
        installment_amount: typeof body.installmentAmount === 'number' ? body.installmentAmount : 0,
        procedure_duration: body.procedureDuration || '',
        professional_name: body.professionalName || '',
        instagram_handle: body.instagramHandle || '',
        whatsapp_number: body.whatsappNumber || '',
        before_image: firstPhoto.before || '',
        after_image: firstPhoto.after || '',
        photos: draftPhotos,
        headline: body.headline || '',
        support_text: body.supportText || '',
        is_active: false,
        whatsapp_message: body.whatsappMessage || '',
        final_screen_type: body.finalScreenType || 'whatsapp',
        form_fields: body.formFields || { name: true, whatsapp: true, email: true },
        theme: body.theme || 'purple',
        pixel_id: body.pixelId || '',
        capi_token: body.capiToken || '',
        single_photo: body.singlePhoto ?? false,
        show_only_installment: body.showOnlyInstallment ?? false,
        user_id: userId,
        steps: body.steps || [],
        custom_texts: body.customTexts || {},
      });

      return NextResponse.json({ id, slug: draftSlug, isDraft: true }, { status: 201 });
    }

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
      is_draft: false,
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
      is_active: data.isActive ?? true,
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
