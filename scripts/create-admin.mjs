import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Anon + signUp funciona porque el proyecto demo tiene signUp habilitado.
// En un proyecto real usarías la service_role key desde un entorno de servidor.
const supabase = createClient(supabaseUrl, supabaseKey);

const email = process.env.ADMIN_EMAIL || 'admin@cafeorder.com';
const password = process.env.ADMIN_PASSWORD || 'admin12345';

async function crearAdmin() {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        console.error('Error creando admin:', error.message);
        process.exit(1);
    } else {
        console.log('Usuario admin creado exitosamente:', data.user?.email);
    }
}

crearAdmin();
