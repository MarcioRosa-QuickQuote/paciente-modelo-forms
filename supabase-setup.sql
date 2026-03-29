-- ============================================================
-- FORMULÁRIO DE CONVERSÃO - Setup completo do banco de dados
-- Rode este SQL no Supabase: SQL Editor > New Query > colar e rodar
-- ============================================================

-- 1. Criar tabela de formulários
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

-- 2. Criar bucket de imagens (Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT DO NOTHING;

-- 3. Permitir upload público no bucket
CREATE POLICY IF NOT EXISTS "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images');

-- 4. Permitir leitura pública das imagens
CREATE POLICY IF NOT EXISTS "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- 5. Permitir delete no bucket (para trocar imagens)
CREATE POLICY IF NOT EXISTS "Allow public deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'images');

-- 6. Criar tabela de respostas (tracking)
CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  step INTEGER NOT NULL,
  answer TEXT NOT NULL CHECK (answer IN ('sim', 'nao')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE responses ADD COLUMN IF NOT EXISTS step_id TEXT;

-- 7. Criar tabela de leads
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  name TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  email TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Adicionar novas colunas na tabela forms
ALTER TABLE forms ADD COLUMN IF NOT EXISTS whatsapp_message TEXT DEFAULT '';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS final_screen_type TEXT DEFAULT 'whatsapp';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS form_fields JSONB DEFAULT '{"name": true, "whatsapp": true, "email": true}';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'purple';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS headline TEXT DEFAULT '';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS support_text TEXT DEFAULT '';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS installment_count INTEGER DEFAULT 0;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS installment_amount NUMERIC DEFAULT 0;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS procedure_duration TEXT DEFAULT '';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT '';

-- 9. Criar tabela de configurações por usuário
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  clinic_logo TEXT DEFAULT '',
  pixel_id TEXT DEFAULT '',
  capi_token TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Se a tabela já existe, adicione a coluna:
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS capi_token TEXT DEFAULT '';

-- 10. Adicionar coluna de etapas configuráveis
ALTER TABLE forms ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]';

-- 11. Adicionar coluna de textos customizados
ALTER TABLE forms ADD COLUMN IF NOT EXISTS custom_texts JSONB DEFAULT '{}';

-- 12. Adicionar suporte a foto única centralizada
ALTER TABLE forms ADD COLUMN IF NOT EXISTS single_photo BOOLEAN DEFAULT false;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS show_only_installment BOOLEAN DEFAULT false;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;
