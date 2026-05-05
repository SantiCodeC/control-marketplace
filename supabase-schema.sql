-- ================================================
-- CONTROL MARKETPLACE — Esquema Supabase
-- Ejecutar en orden en el SQL Editor de Supabase
-- ================================================

-- ================================
-- 1. TABLA DE USUARIOS
-- ================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'asesor')) DEFAULT 'asesor',
  pin_hash TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================
-- 2. TABLA DE PROPIEDADES
-- ================================
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN ('venta', 'alquiler')) DEFAULT 'venta',
  description TEXT NOT NULL,
  captador_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('activa', 'cerrada')) DEFAULT 'activa',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================
-- 3. TABLA DE PUBLICACIONES
-- ================================
CREATE TABLE IF NOT EXISTS public.property_publications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  published_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, user_id)  -- Un asesor solo puede publicar una vez por propiedad
);

-- ================================
-- 4. ÍNDICES para performance
-- ================================
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_captador ON public.properties(captador_id);
CREATE INDEX IF NOT EXISTS idx_publications_property ON public.property_publications(property_id);
CREATE INDEX IF NOT EXISTS idx_publications_user ON public.property_publications(user_id);

-- ================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ================================

-- Activar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_publications ENABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Usamos anon key para autenticación propia (sin Supabase Auth)
-- Por eso las políticas permiten lectura/escritura al anon role de forma controlada

-- Políticas para users
CREATE POLICY "Allow anon to read users" ON public.users
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert users" ON public.users
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update users" ON public.users
  FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon to delete users" ON public.users
  FOR DELETE TO anon USING (true);

-- Políticas para properties
CREATE POLICY "Allow anon to read properties" ON public.properties
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert properties" ON public.properties
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update properties" ON public.properties
  FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon to delete properties" ON public.properties
  FOR DELETE TO anon USING (true);

-- Políticas para property_publications
CREATE POLICY "Allow anon to read publications" ON public.property_publications
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert publications" ON public.property_publications
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to delete publications" ON public.property_publications
  FOR DELETE TO anon USING (true);

-- ================================
-- 6. USUARIO ADMIN INICIAL
-- ================================
-- PIN por defecto: 1234
-- El hash corresponde a SHA-256 de "1234control_marketplace_salt"
-- CAMBIÁ EL PIN desde la app después de iniciar sesión

INSERT INTO public.users (username, full_name, role, pin_hash, active)
VALUES (
  'admin',
  'Administrador',
  'admin',
  '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0',
  true
)
ON CONFLICT (username) DO NOTHING;

-- ================================
-- 7. DATOS DE EJEMPLO (OPCIONAL)
-- ================================
-- Descomentá estas líneas si querés datos de prueba

/*
INSERT INTO public.users (username, full_name, role, pin_hash, active) VALUES
  ('juan_perez', 'Juan Pérez', 'asesor', '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0', true),
  ('maria_garcia', 'María García', 'asesor', '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0', true),
  ('carlos_lopez', 'Carlos López', 'asesor', '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0', true)
ON CONFLICT (username) DO NOTHING;
*/

-- ================================
-- FIN DEL ESQUEMA
-- ================================
