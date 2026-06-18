'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminConfiguracionPage() {
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [exito, setExito] = useState(false);
    const [restaurando, setRestaurando] = useState(false);
    const [errorRestaurar, setErrorRestaurar] = useState('');

    const [form, setForm] = useState({
        id: '',
        nombre_negocio: '',
        telefono_whatsapp: '',
        logo_url: '',
        color_primario: '#4A2C2A',
        banco: '',
        beneficiario: '',
        clabe: '',
        concepto_transferencia: 'Pago de pedido',
    });

    const supabase = createClient();

    const cargarDatos = useCallback(async () => {
        setCargandoDatos(true);
        const { data } = await supabase.from('configuracion').select('*').limit(1).single();
        if (data) {
            setForm(data);
        }
        setCargandoDatos(false);
    }, [supabase]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    useEffect(() => {
        if (form.color_primario) {
            document.documentElement.style.setProperty(
                '--color-primario',
                form.color_primario
            );
        }
    }, [form.color_primario]);

    const handleGuardar = async () => {
        if (!form.nombre_negocio || !form.telefono_whatsapp) return;
        setGuardando(true);
        setExito(false);

        let result;
        if (form.id) {
            result = await supabase.from('configuracion').update(form).eq('id', form.id);
        } else {
            // Por si se vacía la BD y no hay setup inicial
            const { id, ...datosSinId } = form;
            result = await supabase.from('configuracion').insert(datosSinId).select().single();
            if (result.data) setForm(result.data);
        }

        if (!result.error) {
            setExito(true);
            document.documentElement.style.setProperty(
                '--color-primario',
                form.color_primario
            );
            setTimeout(() => setExito(false), 3000);
        }

        setGuardando(false);
    };

    const handleRestaurarDemo = async () => {
        const confirmado = window.confirm(
            'Esto borrará todos los productos, categorías, banners y toppings actuales y los reemplazará por el set de datos demo original. ¿Continuar?'
        );
        if (!confirmado) return;

        setRestaurando(true);
        setErrorRestaurar('');

        const { error } = await supabase.rpc('reset_demo_data');

        if (error) {
            setErrorRestaurar('No se pudo restaurar: ' + error.message);
            setRestaurando(false);
        } else {
            window.location.reload();
        }
    };

    if (cargandoDatos) {
        return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            <div>
                <h1 className="text-xl font-semibold text-[var(--color-texto-1)] tracking-tight">Configuración del Negocio</h1>
                <p className="text-[13px] text-[var(--color-texto-3)] mt-1">Ajustes generales de la cafetería</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-[var(--color-texto-2)] mb-2">Nombre del Negocio *</label>
                            <input type="text" value={form.nombre_negocio} onChange={(e) => setForm({ ...form, nombre_negocio: e.target.value })} className="w-full px-4 py-3 bg-[var(--color-base)] border border-[var(--color-borde)] rounded-xl text-[13px] text-[var(--color-texto-1)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all focus:bg-white transition-all shadow-sm" placeholder="Ej. El Buen Café" />
                            <p className="text-[var(--color-texto-3)] text-xs mt-2">Aparece en el menú y en el ticket.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[var(--color-texto-2)] mb-2">WhatsApp para Pedidos *</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-texto-3)]">📱</span>
                                <input type="text" value={form.telefono_whatsapp} onChange={(e) => setForm({ ...form, telefono_whatsapp: e.target.value.replace(/\D/g, '') })} className="w-full pl-11 pr-4 py-3 bg-[var(--color-base)] border border-[var(--color-borde)] rounded-xl text-[13px] text-[var(--color-texto-1)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all focus:bg-white transition-all shadow-sm" placeholder="521234567890" />
                            </div>
                            <p className="text-[var(--color-texto-3)] text-xs mt-2">Incluye código de país (+52 para México).</p>
                        </div>
                    </div>

                    <div className="border-t border-[var(--color-borde)] pt-6">
                        <label className="block text-sm font-semibold text-[var(--color-texto-1)] mb-1">
                            Color Principal de la Tienda
                        </label>
                        <p className="text-xs text-[var(--color-texto-3)] mb-3">
                            Define el color del header y botones de la app. Puedes usar el selector o pegar un código hex directamente (ej. #4A2C2A).
                        </p>

                        <div className="flex items-center gap-3">

                            {/* Selector visual de color */}
                            <div className="relative w-10 h-10 rounded-lg border-2 border-[var(--color-borde)] overflow-hidden shadow-sm flex-shrink-0 cursor-pointer">
                                <input
                                    type="color"
                                    value={form.color_primario}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setForm({ ...form, color_primario: val });
                                        document.documentElement.style.setProperty(
                                            '--color-primario', val
                                        );
                                    }}
                                    className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer border-0 p-0"
                                />
                            </div>

                            {/* Input de texto hexadecimal */}
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-3)] font-mono text-sm select-none">
                                    #
                                </span>
                                <input
                                    type="text"
                                    value={form.color_primario.replace('#', '')}
                                    onChange={(e) => {
                                        // Limpiar input: solo caracteres hex válidos
                                        const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                                        const hex = `#${raw}`;
                                        setForm({ ...form, color_primario: hex });
                                        // Aplicar solo si es un hex completo válido
                                        if (raw.length === 6) {
                                            document.documentElement.style.setProperty(
                                                '--color-primario', hex
                                            );
                                        }
                                    }}
                                    placeholder="4A2C2A"
                                    maxLength={6}
                                    className="w-full pl-7 pr-4 py-2.5 border border-[var(--color-borde)] bg-white rounded-lg font-mono text-sm text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)]/20 focus:border-[var(--color-texto-2)] transition-all"
                                />
                            </div>

                            {/* Preview del color actual */}
                            <div
                                className="w-10 h-10 rounded-lg flex-shrink-0 border border-[var(--color-borde)] shadow-sm"
                                style={{ backgroundColor: form.color_primario }}
                            />

                            {/* Botón restaurar */}
                            <button
                                onClick={() => {
                                    const colorDefault = '#4A2C2A';
                                    setForm({ ...form, color_primario: colorDefault });
                                    document.documentElement.style.setProperty(
                                        '--color-primario', colorDefault
                                    );
                                }}
                                className="text-xs text-[var(--color-texto-3)] hover:text-[var(--color-texto-1)] px-3 py-2.5 border border-[var(--color-borde)] bg-white rounded-lg hover:bg-[var(--color-base)] transition-all whitespace-nowrap"
                            >
                                Restaurar
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-[var(--color-borde)] pt-6">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-[var(--color-texto-1)]">
                                Datos para Transferencia
                            </h3>
                            <p className="text-xs text-[var(--color-texto-3)] mt-1">
                                Se mostrarán al cliente cuando elija pagar por transferencia en el checkout.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-texto-1)] mb-2">
                                    Banco
                                </label>
                                <input
                                    type="text"
                                    value={form.banco}
                                    onChange={(e) => setForm({ ...form, banco: e.target.value })}
                                    placeholder="Ej. BBVA, Banamex, HSBC..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-[var(--color-borde)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-espresso)]/20 focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-texto-1)] mb-2">
                                    Beneficiario
                                </label>
                                <input
                                    type="text"
                                    value={form.beneficiario}
                                    onChange={(e) => setForm({ ...form, beneficiario: e.target.value })}
                                    placeholder="Nombre completo del titular"
                                    className="w-full px-4 py-3 bg-gray-50 border border-[var(--color-borde)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-espresso)]/20 focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-texto-1)] mb-2">
                                    CLABE / Número de cuenta
                                </label>
                                <input
                                    type="text"
                                    value={form.clabe}
                                    onChange={(e) => setForm({ ...form, clabe: e.target.value.replace(/\D/g, '') })}
                                    placeholder="18 dígitos CLABE interbancaria"
                                    maxLength={18}
                                    className="w-full px-4 py-3 bg-gray-50 border border-[var(--color-borde)] rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-espresso)]/20 focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-texto-1)] mb-2">
                                    Concepto sugerido
                                </label>
                                <input
                                    type="text"
                                    value={form.concepto_transferencia}
                                    onChange={(e) => setForm({ ...form, concepto_transferencia: e.target.value })}
                                    placeholder="Ej. Pago de pedido"
                                    className="w-full px-4 py-3 bg-gray-50 border border-[var(--color-borde)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-espresso)]/20 focus:bg-white transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-4">
                    <button onClick={handleGuardar} disabled={guardando || !form.nombre_negocio || !form.telefono_whatsapp} className="bg-[var(--color-acento)] hover:bg-cafe-700 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]">
                        {guardando ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8">
                <h3 className="text-sm font-semibold text-amber-900">Zona de demostración</h3>
                <p className="text-xs text-amber-800 mt-1 mb-4">
                    Este panel es público para fines de portafolio. Si los datos quedaron desordenados por pruebas,
                    puedes restaurarlos al set demo original (productos, categorías, banners, toppings y configuración).
                </p>
                {errorRestaurar && (
                    <p className="text-xs text-red-600 mb-3">{errorRestaurar}</p>
                )}
                <button
                    onClick={handleRestaurarDemo}
                    disabled={restaurando}
                    className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                >
                    {restaurando ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        'Restaurar datos demo'
                    )}
                </button>
            </div>

            {exito && (
                <div className="fixed bottom-6 right-6 bg-[var(--color-matcha)] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in-up">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="font-medium">Configuración guardada exitosamente</span>
                </div>
            )}
        </div>
    );
}
