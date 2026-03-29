import { createClient } from '@supabase/supabase-js';
import { FormStep } from '@/types/form';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function initializeDb() {
  // Table is created via Supabase SQL Editor — no auto-migration needed
}

export async function getAllForms(userId?: string): Promise<FormRow[]> {
  const supabase = getSupabase();
  let query = supabase.from('forms').select('*').order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as FormRow[];
}

export async function getFormById(id: string): Promise<FormRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as FormRow | null;
}

export async function getFormBySlug(slug: string): Promise<FormRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('is_draft', false)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as FormRow | null;
}

export async function createForm(form: CreateFormInput) {
  const supabase = getSupabase();
  const { error } = await supabase.from('forms').insert(form);
  if (error) throw error;
}

export async function updateForm(id: string, data: Record<string, unknown>) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('forms')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteForm(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from('forms').delete().eq('id', id);
  if (error) throw error;
}

export interface FormRow {
  id: string;
  name: string;
  slug: string;
  is_draft: boolean;
  procedure_name: string;
  available_days: string;
  regular_price: number;
  model_price: number;
  fee_amount: number;
  installment_count: number;
  installment_amount: number;
  procedure_duration: string;
  professional_name: string;
  instagram_handle: string;
  whatsapp_number: string;
  before_image: string;
  after_image: string;
  photos: { before: string; after: string }[];
  headline: string;
  support_text: string;
  is_active: boolean;
  whatsapp_message: string;
  final_screen_type: string;
  form_fields: { name: boolean; whatsapp: boolean; email: boolean };
  theme: string;
  pixel_id: string;
  capi_token: string;
  single_photo: boolean;
  show_only_installment: boolean;
  user_id: string;
  steps: FormStep[];
  custom_texts: Record<string, string>;
  created_at: string;
  updated_at: string;
}

interface CreateFormInput {
  id: string;
  name: string;
  slug: string;
  is_draft: boolean;
  procedure_name: string;
  available_days: string;
  regular_price: number;
  model_price: number;
  fee_amount: number;
  installment_count: number;
  installment_amount: number;
  procedure_duration: string;
  professional_name: string;
  instagram_handle: string;
  whatsapp_number: string;
  before_image: string;
  after_image: string;
  photos: { before: string; after: string }[];
  headline: string;
  support_text: string;
  is_active: boolean;
  whatsapp_message: string;
  final_screen_type: string;
  form_fields: { name: boolean; whatsapp: boolean; email: boolean };
  theme: string;
  pixel_id: string;
  capi_token: string;
  single_photo: boolean;
  show_only_installment: boolean;
  user_id: string;
  steps: FormStep[];
  custom_texts: Record<string, string>;
}

// Responses
export async function clearResponses(formId: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from('responses').delete().eq('form_id', formId);
  if (error) throw error;
}

export async function saveResponse(formId: string, step: number, answer: 'sim' | 'nao', stepId?: string) {
  const supabase = getSupabase();
  const payload = {
    form_id: formId,
    step,
    answer,
    ...(stepId ? { step_id: stepId } : {}),
  };

  const { error } = await supabase.from('responses').insert(payload);
  if (error && stepId) {
    const { error: legacyError } = await supabase.from('responses').insert({
      form_id: formId,
      step,
      answer,
    });
    if (legacyError) throw legacyError;
    return;
  }
  if (error) throw error;
}

export async function getAllStats() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('responses')
    .select('form_id, step, answer');

  if (error) throw error;

  const result: Record<string, Record<number, { sim: number; nao: number }>> = {};

  for (const row of data || []) {
    if (!result[row.form_id]) {
      result[row.form_id] = {};
    }
    if (!result[row.form_id][row.step]) {
      result[row.form_id][row.step] = { sim: 0, nao: 0 };
    }
    result[row.form_id][row.step][row.answer as 'sim' | 'nao']++;
  }

  return result;
}

export async function getFormStats(formId: string, from?: string, to?: string) {
  const supabase = getSupabase();
  function buildQuery(selectColumns: string) {
    let query = supabase
      .from('responses')
      .select(selectColumns)
      .eq('form_id', formId);

    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    return query;
  }

  let { data, error } = await buildQuery('step, step_id, answer');

  if (error && /step_id/i.test(error.message || '')) {
    ({ data, error } = await buildQuery('step, answer'));
  }

  if (error) throw error;

  const stats = {
    byPosition: {} as Record<string, { sim: number; nao: number }>,
    byStepId: {} as Record<string, { sim: number; nao: number }>,
  };

  for (const row of ((data || []) as unknown as Array<{ step: number; answer: 'sim' | 'nao'; step_id?: string | null }>)) {
    const positionKey = String(row.step);
    if (!stats.byPosition[positionKey]) {
      stats.byPosition[positionKey] = { sim: 0, nao: 0 };
    }
    stats.byPosition[positionKey][row.answer]++;

    if (row.step_id) {
      if (!stats.byStepId[row.step_id]) {
        stats.byStepId[row.step_id] = { sim: 0, nao: 0 };
      }
      stats.byStepId[row.step_id][row.answer]++;
    }
  }

  return stats;
}

// Leads
export async function saveLead(
  formId: string,
  name: string,
  whatsapp: string,
  email: string,
  utmSource?: string,
  utmMedium?: string,
  utmCampaign?: string,
) {
  const supabase = getSupabase();
  const { error } = await supabase.from('leads').insert({
    form_id: formId,
    name,
    whatsapp,
    email,
    ...(utmSource ? { utm_source: utmSource } : {}),
    ...(utmMedium ? { utm_medium: utmMedium } : {}),
    ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
  });
  if (error) throw error;
}

export async function getLeads(formId?: string, userId?: string) {
  const supabase = getSupabase();

  // If userId provided, filter only leads from forms owned by that user
  if (userId) {
    const { data: userForms } = await supabase
      .from('forms')
      .select('id')
      .eq('user_id', userId);
    const formIds = (userForms || []).map((f: { id: string }) => f.id);
    if (formIds.length === 0) return [];

    let query = supabase
      .from('leads')
      .select('*, forms(name)')
      .in('form_id', formId ? [formId] : formIds)
      .order('created_at', { ascending: false });

    if (formId) query = query.eq('form_id', formId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  let query = supabase
    .from('leads')
    .select('*, forms(name)')
    .order('created_at', { ascending: false });

  if (formId) {
    query = query.eq('form_id', formId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function deleteLead(id: number) {
  const supabase = getSupabase();
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw error;
}

// Clinic Settings
export async function getClinicSettings(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as { clinic_logo: string; pixel_id: string; capi_token: string } | null;
}

export async function upsertClinicSettings(userId: string, settings: { clinic_logo: string; pixel_id: string; capi_token: string }) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function getClinicSettingsByUserId(userId: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data as { clinic_logo: string; pixel_id: string; capi_token: string } | null;
}

export function rowToFormData(row: FormRow) {
  const defaultFields = { name: true, whatsapp: true, email: true };

  // Build photos array: use photos column if set, else fall back to before/after
  let photos: { before: string; after: string }[] = [];
  if (row.photos && Array.isArray(row.photos) && row.photos.length > 0) {
    photos = row.photos;
  } else if (row.before_image || row.after_image) {
    photos = [{ before: row.before_image || '', after: row.after_image || '' }];
  } else {
    photos = [{ before: '', after: '' }];
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    isDraft: row.is_draft ?? false,
    procedureName: row.procedure_name,
    availableDays: row.available_days,
    regularPrice: Number(row.regular_price),
    modelPrice: Number(row.model_price),
    feeAmount: Number(row.fee_amount),
    installmentCount: Number(row.installment_count) || 0,
    installmentAmount: Number(row.installment_amount) || 0,
    procedureDuration: row.procedure_duration || '',
    professionalName: row.professional_name,
    instagramHandle: row.instagram_handle,
    whatsappNumber: row.whatsapp_number,
    beforeImage: row.before_image || '',
    afterImage: row.after_image || '',
    photos,
    headline: row.headline || '',
    supportText: row.support_text || '',
    isActive: row.is_active,
    whatsappMessage: row.whatsapp_message || '',
    finalScreenType: (row.final_screen_type as 'whatsapp' | 'form') || 'whatsapp',
    formFields: row.form_fields || defaultFields,
    theme: row.theme || 'purple',
    pixelId: row.pixel_id || '',
    capiToken: row.capi_token || '',
    singlePhoto: row.single_photo ?? false,
    showOnlyInstallment: row.show_only_installment ?? false,
    userId: row.user_id || '',
    steps: Array.isArray(row.steps) ? (row.steps as FormStep[]) : [],
    customTexts: (row.custom_texts as Record<string, string>) || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
