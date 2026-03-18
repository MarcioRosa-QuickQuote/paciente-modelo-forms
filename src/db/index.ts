import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function initializeDb() {
  // Table is created via Supabase SQL Editor — no auto-migration needed
}

export async function getAllForms(): Promise<FormRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false });

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
  procedure_name: string;
  available_days: string;
  regular_price: number;
  model_price: number;
  fee_amount: number;
  professional_name: string;
  instagram_handle: string;
  whatsapp_number: string;
  before_image: string;
  after_image: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateFormInput {
  id: string;
  name: string;
  slug: string;
  procedure_name: string;
  available_days: string;
  regular_price: number;
  model_price: number;
  fee_amount: number;
  professional_name: string;
  instagram_handle: string;
  whatsapp_number: string;
  before_image: string;
  after_image: string;
  is_active: boolean;
}

// Responses
export async function saveResponse(formId: string, step: number, answer: 'sim' | 'nao') {
  const supabase = getSupabase();
  const { error } = await supabase.from('responses').insert({
    form_id: formId,
    step,
    answer,
  });
  if (error) throw error;
}

export async function getFormStats(formId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('responses')
    .select('step, answer')
    .eq('form_id', formId);

  if (error) throw error;

  const stats: Record<number, { sim: number; nao: number }> = {
    1: { sim: 0, nao: 0 },
    2: { sim: 0, nao: 0 },
    3: { sim: 0, nao: 0 },
    4: { sim: 0, nao: 0 },
    5: { sim: 0, nao: 0 },
  };

  for (const row of data || []) {
    if (stats[row.step]) {
      stats[row.step][row.answer as 'sim' | 'nao']++;
    }
  }

  return stats;
}

export function rowToFormData(row: FormRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    procedureName: row.procedure_name,
    availableDays: row.available_days,
    regularPrice: Number(row.regular_price),
    modelPrice: Number(row.model_price),
    feeAmount: Number(row.fee_amount),
    professionalName: row.professional_name,
    instagramHandle: row.instagram_handle,
    whatsappNumber: row.whatsapp_number,
    beforeImage: row.before_image,
    afterImage: row.after_image,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
