'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

const MAX_INTENTOS = 5;
const BLOQUEO_MS = 60_000;
const STORAGE_KEY = 'admin_login_intentos';

function leerEstadoIntentos(): { intentos: number; bloqueadoHasta: number } {
    if (typeof window === 'undefined') return { intentos: 0, bloqueadoHasta: 0 };
    try {
        const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return { intentos: guardado.intentos || 0, bloqueadoHasta: guardado.bloqueadoHasta || 0 };
    } catch {
        return { intentos: 0, bloqueadoHasta: 0 };
    }
}

function guardarEstadoIntentos(estado: { intentos: number; bloqueadoHasta: number }) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [verificando, setVerificando] = useState(true);
    const [segundosRestantes, setSegundosRestantes] = useState(0);
    const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const verificarSesion = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                window.location.href = '/admin';
            }
            setVerificando(false);
        };
        verificarSesion();
    }, [supabase]);

    const iniciarCuentaRegresiva = (bloqueadoHasta: number) => {
        if (intervaloRef.current) clearInterval(intervaloRef.current);
        const actualizar = () => {
            const restante = Math.ceil((bloqueadoHasta - Date.now()) / 1000);
            setSegundosRestantes(restante > 0 ? restante : 0);
            if (restante <= 0 && intervaloRef.current) {
                clearInterval(intervaloRef.current);
            }
        };
        actualizar();
        intervaloRef.current = setInterval(actualizar, 1000);
    };

    useEffect(() => {
        const { bloqueadoHasta } = leerEstadoIntentos();
        if (bloqueadoHasta > Date.now()) {
            iniciarCuentaRegresiva(bloqueadoHasta);
        }
        return () => {
            if (intervaloRef.current) clearInterval(intervaloRef.current);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const { intentos, bloqueadoHasta } = leerEstadoIntentos();
        if (bloqueadoHasta > Date.now()) {
            iniciarCuentaRegresiva(bloqueadoHasta);
            return;
        }

        setCargando(true);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: contrasena,
        });

        if (authError) {
            const nuevosIntentos = intentos + 1;
            if (nuevosIntentos >= MAX_INTENTOS) {
                const bloqueadoHastaNuevo = Date.now() + BLOQUEO_MS;
                guardarEstadoIntentos({ intentos: 0, bloqueadoHasta: bloqueadoHastaNuevo });
                iniciarCuentaRegresiva(bloqueadoHastaNuevo);
                setError(`Demasiados intentos fallidos. Espera ${BLOQUEO_MS / 1000} segundos.`);
            } else {
                guardarEstadoIntentos({ intentos: nuevosIntentos, bloqueadoHasta: 0 });
                setError(`Credenciales incorrectas. Verifica tu email y contraseña. (${MAX_INTENTOS - nuevosIntentos} intentos restantes)`);
            }
            setCargando(false);
        } else {
            guardarEstadoIntentos({ intentos: 0, bloqueadoHasta: 0 });
            window.location.href = '/admin';
        }
    };

    const bloqueado = segundosRestantes > 0;

    if (verificando) {
        return (
            <div className="min-h-screen bg-cafe-900 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-cafe-500/30 border-t-cafe-400 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cafe-800 via-cafe-900 to-cafe-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md animate-scale-in">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-cafe-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-cafe-500/30">
                        <svg className="w-10 h-10 text-cafe-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Nube Alta Cafe</h1>
                    <p className="text-cafe-300 text-sm mt-1">Panel de Administración</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Iniciar Sesión</h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-cafe-200 mb-1.5">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@cafeorder.com"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-cafe-400 focus:outline-none focus:ring-2 focus:ring-cafe-400 focus:border-transparent transition-all text-sm"
                                disabled={bloqueado}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="contrasena" className="block text-xs font-medium text-cafe-200 mb-1.5">Contraseña</label>
                            <input
                                type="password"
                                id="contrasena"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-cafe-400 focus:outline-none focus:ring-2 focus:ring-cafe-400 focus:border-transparent transition-all text-sm"
                                disabled={bloqueado}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 bg-red-500/20 border border-red-500/30 text-red-200 text-xs rounded-xl p-3">
                            {error}
                        </div>
                    )}

                    {bloqueado && (
                        <div className="mt-4 bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs rounded-xl p-3">
                            Cuenta bloqueada temporalmente por seguridad. Intenta de nuevo en {segundosRestantes}s.
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={cargando || bloqueado}
                        className="w-full mt-6 bg-cafe-500 hover:bg-cafe-400 disabled:bg-cafe-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-cafe-500/25 flex items-center justify-center gap-2"
                    >
                        {cargando ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : bloqueado ? (
                            `Bloqueado (${segundosRestantes}s)`
                        ) : (
                            'Acceder al Panel'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
