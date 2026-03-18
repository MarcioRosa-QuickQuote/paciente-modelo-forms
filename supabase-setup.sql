-- Rode este SQL no Supabase: SQL Editor > New Query > colar e rodar

-- 1. Criar tabela de formulários
CREATE TABLE forms (
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
VALUES ('images', 'images', true);

-- 3. Permitir upload público no bucket
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images');

-- 4. Permitir leitura pública das imagens
CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');
