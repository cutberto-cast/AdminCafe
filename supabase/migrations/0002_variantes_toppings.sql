-- ═══════════════════════════════════════════════════════
-- MIGRACIÓN: Sistema de Variantes y Toppings
-- Proyecto: CafeOrder (Nube Alta Cafe)
-- Fecha: 2026-02-25
-- ═══════════════════════════════════════════════════════
-- INSTRUCCIONES: Ejecutar este script completo en el
-- SQL Editor de Supabase (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────
-- 1. MODIFICAR TABLA PRODUCTOS — agregar columnas nuevas
-- ─────────────────────────────────────────────────────

ALTER TABLE productos ADD COLUMN IF NOT EXISTS
  tiene_variantes BOOLEAN DEFAULT false;

ALTER TABLE productos ADD COLUMN IF NOT EXISTS
  acepta_toppings BOOLEAN DEFAULT false;

ALTER TABLE productos ADD COLUMN IF NOT EXISTS
  precio_topping_extra NUMERIC(10,2) DEFAULT 0;

ALTER TABLE productos ADD COLUMN IF NOT EXISTS
  toppings_gratis INT DEFAULT 0;

-- precio existente pasa a ser nullable (precio base si no hay variantes)
ALTER TABLE productos ALTER COLUMN precio DROP NOT NULL;

-- ─────────────────────────────────────────────────────
-- 2. CREAR TABLA grupos_variantes
-- ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS grupos_variantes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────
-- 3. CREAR TABLA variantes
-- ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS variantes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  grupo_id UUID REFERENCES grupos_variantes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio NUMERIC(10,2) NOT NULL,
  disponible BOOLEAN DEFAULT true,
  orden INT DEFAULT 0
);

-- ─────────────────────────────────────────────────────
-- 4. CREAR TABLA toppings (catálogo global)
-- ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS toppings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────
-- 5. CREAR TABLA producto_toppings (relación N:N)
-- ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS producto_toppings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  topping_id UUID REFERENCES toppings(id) ON DELETE CASCADE,
  UNIQUE(producto_id, topping_id)
);

-- ─────────────────────────────────────────────────────
-- 6. HABILITAR RLS EN TODAS LAS TABLAS NUEVAS
-- ─────────────────────────────────────────────────────

-- grupos_variantes
ALTER TABLE grupos_variantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de grupos_variantes"
  ON grupos_variantes FOR SELECT
  USING (true);

CREATE POLICY "Admin puede gestionar grupos_variantes"
  ON grupos_variantes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- variantes
ALTER TABLE variantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de variantes"
  ON variantes FOR SELECT
  USING (true);

CREATE POLICY "Admin puede gestionar variantes"
  ON variantes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- toppings
ALTER TABLE toppings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de toppings"
  ON toppings FOR SELECT
  USING (true);

CREATE POLICY "Admin puede gestionar toppings"
  ON toppings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- producto_toppings
ALTER TABLE producto_toppings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de producto_toppings"
  ON producto_toppings FOR SELECT
  USING (true);

CREATE POLICY "Admin puede gestionar producto_toppings"
  ON producto_toppings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════
-- FIN DE LA MIGRACIÓN
-- ═══════════════════════════════════════════════════════
