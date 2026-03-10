'use client';

import { useState, useEffect, useRef } from 'react';
import { useCarrito } from '@/stores/carritoStore';
import { formatearPrecio } from '@/lib/utils/formatearPrecio';
import { esquemaDatosPedido } from '@/lib/validations/pedido';
import { createClient } from '@/lib/supabase/client';
import type { DatosPedido, CarritoItem } from '@/types';

interface CheckoutVistaProps {
    onVolver: () => void;
}

interface ConfigNegocio {
    telefono_whatsapp: string;
    nombre_negocio: string;
    banco: string;
    beneficiario: string;
    clabe: string;
    concepto_transferencia: string;
}

export function CheckoutVista({ onVolver }: CheckoutVistaProps) {
    const items = useCarrito((state) => state.items);
    const totalPrecio = useCarrito((state) => state.totalPrecio);
    const limpiar = useCarrito((state) => state.limpiar);

    const [datos, setDatos] = useState<DatosPedido>({
        nombre_cliente: '',
        direccion: '',
        forma_pago: 'efectivo',
        notas: '',
    });

    const [errores, setErrores] = useState<Record<string, string>>({});
    const [pedidoEnviado, setPedidoEnviado] = useState(false);
    const [config, setConfig] = useState<ConfigNegocio>({
        telefono_whatsapp: '',
        nombre_negocio: 'Nube Alta Cafe',
        banco: '',
        beneficiario: '',
        clabe: '',
        concepto_transferencia: 'Pago de pedido',
    });
    const [copiado, setCopiado] = useState<string | null>(null);
    const [itemsCliente, setItemsCliente] = useState<CarritoItem[]>([]);

    const datosBancariosRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        setItemsCliente(items);
    }, [items]);

    useEffect(() => {
        supabase
            .from('configuracion')
            .select('telefono_whatsapp, nombre_negocio, banco, beneficiario, clabe, concepto_transferencia')
            .limit(1)
            .single()
            .then(({ data }) => {
                if (data) setConfig(data);
            });
    }, [supabase]);

    const copiarAlPortapapeles = async (texto: string, campo: string) => {
        try {
            await navigator.clipboard.writeText(texto);
            setCopiado(campo);
            setTimeout(() => setCopiado(null), 2000);
        } catch {
            const el = document.createElement('textarea');
            el.value = texto;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopiado(campo);
            setTimeout(() => setCopiado(null), 2000);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setDatos((prev) => ({ ...prev, [name]: value }));
        if (errores[name]) {
            setErrores((prev) => {
                const nuevo = { ...prev };
                delete nuevo[name];
                return nuevo;
            });
        }
    };

    const generarMensajePedido = (
        itemsParam: CarritoItem[],
        datosParam: DatosPedido,
        totalParam: number,
        esTransferencia: boolean
    ) => {
        let mensaje = `*NUEVO PEDIDO — ${config.nombre_negocio}*\n\n`;
        mensaje += `*Cliente:* ${datosParam.nombre_cliente}\n`;
        if (datosParam.direccion) {
            mensaje += `*Dirección:* ${datosParam.direccion}\n`;
        }
        if (datosParam.notas) {
            mensaje += `*Notas:* ${datosParam.notas}\n`;
        }
        mensaje += `*Forma de pago:* ${esTransferencia ? '💳 Transferencia' : '💵 Efectivo'}\n\n`;

        mensaje += `*🛒 DETALLE DEL PEDIDO:*\n`;
        itemsParam.forEach((item) => {
            const partes: string[] = [];

            if (item.variante_elegida) partes.push(item.variante_elegida.nombre);

            if (item.toppings_elegidos && item.toppings_elegidos.length > 0) {
                partes.push(item.toppings_elegidos.map((t) => t.nombre).join(', '));
            }

            // Ingredientes: "Con todo" o lista de removidos
            const tieneIngredientes = item.producto.tiene_ingredientes === true;

            if (tieneIngredientes) {
                if (item.ingredientes_removidos && item.ingredientes_removidos.length > 0) {
                    partes.push(`Sin: ${item.ingredientes_removidos.join(', ')}`);
                } else {
                    partes.push('Con todo');
                }
            }

            const detalle = partes.length > 0 ? ` — ${partes.join(' · ')}` : '';

            mensaje += `• ${item.cantidad}x ${item.producto.nombre}${detalle} — ${formatearPrecio(item.precio_final * item.cantidad)}\n`;
        });

        mensaje += `\n*TOTAL: ${formatearPrecio(totalParam)}*`;

        if (esTransferencia) {
            mensaje += `\n\n💳 *Pago por transferencia*`;
            mensaje += `\nAdjunto mi comprobante de pago.`;
        }

        return mensaje;
    };

    const handleEnviar = (e: React.FormEvent) => {
        e.preventDefault();

        const resultado = esquemaDatosPedido.safeParse(datos);
        if (!resultado.success) {
            const nuevosErrores: Record<string, string> = {};
            resultado.error.issues.forEach((err) => {
                const campo = err.path[0];
                if (campo) nuevosErrores[String(campo)] = err.message;
            });
            setErrores(nuevosErrores);
            return;
        }

        if (itemsCliente.length === 0) {
            setErrores({ general: 'Tu carrito está vacío.' });
            return;
        }

        if (!config.telefono_whatsapp) {
            setErrores({ general: 'El negocio aún no configuró su WhatsApp.' });
            return;
        }

        const esTransferencia = datos.forma_pago === 'transferencia';
        const mensaje = generarMensajePedido(
            itemsCliente, datos, totalPrecio(), esTransferencia
        );
        const url = `https://api.whatsapp.com/send/?phone=${config.telefono_whatsapp}&text=${encodeURIComponent(mensaje)}&type=phone_number&app_absent=0`;
        window.open(url, '_blank');
        setPedidoEnviado(true);
    };

    const handleTransferenciaClick = () => {
        setDatos((prev) => ({ ...prev, forma_pago: 'transferencia' }));
        setTimeout(() => {
            datosBancariosRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    };

    // ── Íconos reutilizables ──────────────────────────────
    const CopyIcon = () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    );

    const CheckIcon = () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    );

    // ── Pantalla post-pedido ──────────────────────────────
    if (pedidoEnviado) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-green-100">
                    <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">¡Pedido preparado!</h3>
                <p className="text-gray-500 text-sm mb-8 max-w-xs leading-relaxed">
                    {datos.forma_pago === 'transferencia'
                        ? 'Tu orden fue generada. Recuerda enviar tu comprobante en el chat de WhatsApp para confirmarla.'
                        : 'Tu orden fue generada. El negocio te contactará por WhatsApp en breve.'
                    }
                </p>
                <button
                    onClick={() => { limpiar(); window.location.href = '/'; }}
                    className="w-full max-w-xs bg-gray-900 hover:bg-gray-800 text-white font-medium py-3.5 rounded-2xl transition-all active:scale-95 shadow-sm"
                >
                    Volver al menú principal
                </button>
            </div>
        );
    }

    const hayDatosBancarios = config.banco || config.beneficiario || config.clabe;

    return (
        <div className="animate-fade-in pb-8 overflow-x-hidden">
            {/* Meta viewport para prevenir zoom en móviles */}
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            </head>

            {/* Encabezado */}
            <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white/80 backdrop-blur-md py-3 z-10 -mx-4 px-4 border-b border-gray-100">
                <button
                    onClick={onVolver}
                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                    aria-label="Volver al carrito"
                >
                    <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Finalizar compra</h2>
            </div>

            {/* Resumen del pedido */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 mb-5 shadow-sm border border-gray-100/80">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                    Resumen de tu orden
                </h3>
                <div className="space-y-3">
                    {itemsCliente.map((item, idx) => (
                        <div key={`checkout-${idx}`} className="flex justify-between text-sm group">
                            <div className="flex-1 min-w-0 pr-4">
                                <span className="text-gray-800 font-medium">
                                    <span className="text-gray-400 mr-2">{item.cantidad}x</span>
                                    {item.producto.nombre}
                                </span>
                                {(item.variante_elegida || (item.toppings_elegidos && item.toppings_elegidos.length > 0)) && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {item.variante_elegida && (
                                            <span className="inline-flex text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                                                {item.variante_elegida.nombre}
                                            </span>
                                        )}
                                        {item.toppings_elegidos?.map((t, i) => (
                                            <span key={i} className="inline-flex text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                                                {t.nombre}
                                            </span>
                                        ))}
                                        {item.ingredientes_removidos && item.ingredientes_removidos.length > 0 && (
                                            <span className="inline-flex text-[11px] px-2 py-0.5 rounded-md bg-red-50 text-red-400">
                                                Sin: {item.ingredientes_removidos.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <span className="text-gray-900 font-medium flex-shrink-0 mt-0.5">
                                {formatearPrecio(item.precio_final * item.cantidad)}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-end">
                    <span className="font-medium text-gray-500">Total a pagar</span>
                    <span className="font-bold text-gray-900 text-xl tracking-tight">
                        {formatearPrecio(totalPrecio())}
                    </span>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleEnviar} className="space-y-6">
                <div className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-gray-100/80 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                        Datos de entrega
                    </h3>

                    <div>
                        <label htmlFor="nombre_cliente" className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">
                            Nombre completo
                        </label>
                        <input
                            type="text"
                            id="nombre_cliente"
                            name="nombre_cliente"
                            value={datos.nombre_cliente}
                            onChange={handleChange}
                            placeholder="Ej: María García"
                            style={{ fontSize: '16px' }}
                            className={`w-full px-4 py-3 bg-gray-50/50 rounded-xl border text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 transition-all focus:bg-white ${errores.nombre_cliente ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-gray-300 focus:ring-gray-100'}`}
                        />
                        {errores.nombre_cliente && <p className="text-red-500 text-[11px] mt-1.5 ml-1 font-medium">{errores.nombre_cliente}</p>}
                    </div>

                    <div>
                        <label htmlFor="direccion" className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">
                            Dirección exacta
                        </label>
                        <input
                            type="text"
                            id="direccion"
                            name="direccion"
                            value={datos.direccion}
                            onChange={handleChange}
                            placeholder="Calle, número, colonia..."
                            style={{ fontSize: '16px' }}
                            className={`w-full px-4 py-3 bg-gray-50/50 rounded-xl border text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 transition-all focus:bg-white ${errores.direccion ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-gray-300 focus:ring-gray-100'}`}
                        />
                        {errores.direccion && <p className="text-red-500 text-[11px] mt-1.5 ml-1 font-medium">{errores.direccion}</p>}
                    </div>

                    <div>
                        <label htmlFor="notas" className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">
                            Indicaciones adicionales <span className="text-gray-400 font-normal">(Opcional)</span>
                        </label>
                        <textarea
                            id="notas"
                            name="notas"
                            rows={2}
                            value={datos.notas || ''}
                            onChange={handleChange}
                            placeholder="Ej: Tocar el timbre, fachada azul..."
                            style={{ fontSize: '16px' }}
                            className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:border-gray-300 focus:ring-gray-100 transition-all focus:bg-white resize-none"
                        />
                    </div>
                </div>

                {/* Forma de pago */}
                <div className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-gray-100/80">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                        Método de pago
                    </h3>

                    <div className="bg-gray-100/80 p-1.5 rounded-2xl flex gap-1 relative border border-gray-200/50">
                        <button
                            type="button"
                            onClick={() => setDatos((prev) => ({ ...prev, forma_pago: 'efectivo' }))}
                            className={`relative flex-1 py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 z-10 ${datos.forma_pago === 'efectivo'
                                ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Efectivo
                        </button>
                        <button
                            type="button"
                            onClick={handleTransferenciaClick}
                            className={`relative flex-1 py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 z-10 ${datos.forma_pago === 'transferencia'
                                ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Transferencia
                        </button>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-3 text-center">
                        {datos.forma_pago === 'efectivo'
                            ? 'Pagarás en efectivo al momento de recibir tu orden.'
                            : 'Te proporcionaremos los datos bancarios a continuación.'}
                    </p>
                </div>

                {/* ── TARJETAS DE DATOS BANCARIOS ────────────────────── */}
                {datos.forma_pago === 'transferencia' && hayDatosBancarios && (
                    <div ref={datosBancariosRef} className="space-y-3 animate-fade-in">

                        {/* Fila CLABE - Diseño destacado */}
                        {config.clabe && (
                            <button
                                type="button"
                                onClick={() => copiarAlPortapapeles(config.clabe, 'clabe')}
                                className="w-full flex items-center justify-between bg-white rounded-2xl p-4 border-2 border-gray-900 hover:border-gray-700 transition-all active:scale-[0.98] group shadow-sm"
                            >
                                <div className="text-left flex-1 min-w-0 pr-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                                        CLABE / Número de Cuenta
                                    </p>
                                    <p className="text-lg font-bold text-gray-900 font-mono tracking-tight truncate">
                                        {config.clabe}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-1.5">
                                    <div className={`p-1.5 rounded-lg transition-colors ${copiado === 'clabe' ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-700'}`}>
                                        {copiado === 'clabe' ? <CheckIcon /> : <CopyIcon />}
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 min-w-[50px]">
                                        {copiado === 'clabe' ? 'Copiado' : 'Copiar'}
                                    </span>
                                </div>
                            </button>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                            {config.banco && (
                                <button
                                    type="button"
                                    onClick={() => copiarAlPortapapeles(config.banco, 'banco')}
                                    className="w-full flex items-center justify-between bg-white rounded-xl p-3.5 border border-gray-200 hover:border-gray-300 transition-all active:scale-[0.98] group shadow-sm"
                                >
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Institución</p>
                                        <p className="text-sm font-medium text-gray-900">{config.banco}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`p-1.5 rounded-lg transition-colors ${copiado === 'banco' ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-700'}`}>
                                            {copiado === 'banco' ? <CheckIcon /> : <CopyIcon />}
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 min-w-[50px]">
                                            {copiado === 'banco' ? 'Copiado' : 'Copiar'}
                                        </span>
                                    </div>
                                </button>
                            )}

                            {config.beneficiario && (
                                <button
                                    type="button"
                                    onClick={() => copiarAlPortapapeles(config.beneficiario, 'beneficiario')}
                                    className="w-full flex items-center justify-between bg-white rounded-xl p-3.5 border border-gray-200 hover:border-gray-300 transition-all active:scale-[0.98] group shadow-sm"
                                >
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Beneficiario</p>
                                        <p className="text-sm font-medium text-gray-900">{config.beneficiario}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`p-1.5 rounded-lg transition-colors ${copiado === 'beneficiario' ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-700'}`}>
                                            {copiado === 'beneficiario' ? <CheckIcon /> : <CopyIcon />}
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 min-w-[50px]">
                                            {copiado === 'beneficiario' ? 'Copiado' : 'Copiar'}
                                        </span>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Aviso si eligió transferencia pero no hay datos */}
                {datos.forma_pago === 'transferencia' && !hayDatosBancarios && (
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                        <p className="text-xs text-gray-500 text-center">
                            Aún no hay datos bancarios registrados. Por favor, solicítalos directamente en el chat.
                        </p>
                    </div>
                )}

                {errores.general && (
                    <p className="text-red-500 text-xs text-center bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
                        {errores.general}
                    </p>
                )}

                {/* Botón de envío final */}
                <div className="pt-4">
                    {datos.forma_pago === 'transferencia' && (
                        <p className="text-[11px] text-gray-500 text-center mb-3">
                            Se abrirá WhatsApp para que envíes tu orden <strong className="text-gray-800">y tu comprobante de pago</strong>.
                        </p>
                    )}
                    <button
                        type="submit"
                        className="w-full relative overflow-hidden group bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium py-3.5 rounded-2xl transition-all duration-300 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2.5 text-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span>Completar pedido</span>
                    </button>
                </div>
            </form>
        </div>
    );
}