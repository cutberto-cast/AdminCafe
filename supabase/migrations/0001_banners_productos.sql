-- Ejecuta esto en el SQL Editor de tu Dashboard de Supabase

-- 1. Agregar nuevas columnas a la tabla banners
ALTER TABLE banners ADD COLUMN IF NOT EXISTS imagen_fondo_completo_url TEXT;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS fondo_seleccionado TEXT DEFAULT 'fondo1';

-- 2. Crear tabla banner_productos
CREATE TABLE IF NOT EXISTS banner_productos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    banner_id UUID REFERENCES banners(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    UNIQUE(banner_id, producto_id)
);

-- 3. Habilitar RLS y políticas
ALTER TABLE banner_productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de banner_productos" ON banner_productos FOR SELECT USING (true);
CREATE POLICY "Admin gestión banner_productos" ON banner_productos FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
