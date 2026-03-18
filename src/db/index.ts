import { neon } from '@neondatabase/serverless';

function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql;
}

export async function initializeDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      procedure_name TEXT NOT NULL,
      available_days TEXT NOT NULL,
      regular_price NUMERIC NOT NULL,
      model_price NUMERIC NOT NULL,
      fee_amount NUMERIC NOT NULL,
      professional_name TEXT NOT NULL,
      instagram_handle TEXT NOT NULL,
      whatsapp_number TEXT NOT NULL,
      before_image TEXT DEFAULT '',
      after_image TEXT DEFAULT '',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

export async function getAllForms(): Promise<RawFormRow[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM forms ORDER BY created_at DESC`;
  return rows as unknown as RawFormRow[];
}

export async function getFormById(id: string): Promise<RawFormRow | null> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM forms WHERE id = ${id}`;
  return (rows[0] as unknown as RawFormRow) || null;
}

export async function getFormBySlug(slug: string): Promise<RawFormRow | null> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM forms WHERE slug = ${slug} AND is_active = true`;
  return (rows[0] as unknown as RawFormRow) || null;
}

export async function createForm(form: CreateFormInput) {
  const sql = getDb();
  await sql`
    INSERT INTO forms (id, name, slug, procedure_name, available_days, regular_price, model_price, fee_amount, professional_name, instagram_handle, whatsapp_number, before_image, after_image, is_active)
    VALUES (${form.id}, ${form.name}, ${form.slug}, ${form.procedure_name}, ${form.available_days}, ${form.regular_price}, ${form.model_price}, ${form.fee_amount}, ${form.professional_name}, ${form.instagram_handle}, ${form.whatsapp_number}, ${form.before_image}, ${form.after_image}, ${form.is_active})
  `;
}

export async function updateForm(id: string, data: Partial<UpdateFormInput>) {
  const sql = getDb();

  const setClauses: string[] = [];
  const values: Record<string, unknown> = {};

  if (data.name !== undefined) { setClauses.push('name'); values.name = data.name; }
  if (data.slug !== undefined) { setClauses.push('slug'); values.slug = data.slug; }
  if (data.procedure_name !== undefined) { setClauses.push('procedure_name'); values.procedure_name = data.procedure_name; }
  if (data.available_days !== undefined) { setClauses.push('available_days'); values.available_days = data.available_days; }
  if (data.regular_price !== undefined) { setClauses.push('regular_price'); values.regular_price = data.regular_price; }
  if (data.model_price !== undefined) { setClauses.push('model_price'); values.model_price = data.model_price; }
  if (data.fee_amount !== undefined) { setClauses.push('fee_amount'); values.fee_amount = data.fee_amount; }
  if (data.professional_name !== undefined) { setClauses.push('professional_name'); values.professional_name = data.professional_name; }
  if (data.instagram_handle !== undefined) { setClauses.push('instagram_handle'); values.instagram_handle = data.instagram_handle; }
  if (data.whatsapp_number !== undefined) { setClauses.push('whatsapp_number'); values.whatsapp_number = data.whatsapp_number; }
  if (data.before_image !== undefined) { setClauses.push('before_image'); values.before_image = data.before_image; }
  if (data.after_image !== undefined) { setClauses.push('after_image'); values.after_image = data.after_image; }

  // Build update dynamically - use individual queries per field since neon tagged templates don't support dynamic column names easily
  // Simpler approach: update all provided fields
  await sql`
    UPDATE forms SET
      name = COALESCE(${values.name ?? null}, name),
      slug = COALESCE(${values.slug ?? null}, slug),
      procedure_name = COALESCE(${values.procedure_name ?? null}, procedure_name),
      available_days = COALESCE(${values.available_days ?? null}, available_days),
      regular_price = COALESCE(${values.regular_price ?? null}, regular_price),
      model_price = COALESCE(${values.model_price ?? null}, model_price),
      fee_amount = COALESCE(${values.fee_amount ?? null}, fee_amount),
      professional_name = COALESCE(${values.professional_name ?? null}, professional_name),
      instagram_handle = COALESCE(${values.instagram_handle ?? null}, instagram_handle),
      whatsapp_number = COALESCE(${values.whatsapp_number ?? null}, whatsapp_number),
      before_image = COALESCE(${values.before_image ?? null}, before_image),
      after_image = COALESCE(${values.after_image ?? null}, after_image),
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function deleteForm(id: string) {
  const sql = getDb();
  await sql`DELETE FROM forms WHERE id = ${id}`;
}

export interface RawFormRow {
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

type UpdateFormInput = Omit<CreateFormInput, 'id' | 'is_active'>;

export function rowToFormData(row: RawFormRow) {
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
