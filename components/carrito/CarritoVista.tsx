'use client';

import Image from 'next/image';
import { useCarrito } from '@/stores/carritoStore';
import { formatearPrecio } from '@/lib/utils/formatearPrecio';
import { useEffect, useState } from 'react';
import type { CarritoItem } from '@/types';

interface CarritoVistaProps {
    onIrCheckout: () => void;
    onSeguirComprando: () => void;
}

export function CarritoVista({ onIrCheckout, onSeguirComprando }: CarritoVistaProps) {
    const items = useCarrito((state) => state.items);
    const actualizarCantidadPorKey = useCarrito((state) => state.actualizarCantidadPorKey);
    const eliminarPorKey = useCarrito((state) => state.eliminarPorKey);
    const totalPrecio = useCarrito((state) => state.totalPrecio);
    const limpiar = useCarrito((state) => state.limpiar);
    const getKey = useCarrito((state) => state.getKey);

    // Hydration safe
    const [itemsCliente, setItemsCliente] = useState<CarritoItem[]>([]);
    const [montado, setMontado] = useState(false);

    useEffect(() => {
        setMontado(true);
        setItemsCliente(items);
    }, [items]);

    if (!montado) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-cafe-300 border-t-cafe-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (itemsCliente.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-cafe-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-cafe-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-cafe-800 mb-2">Tu carrito está vacío</h3>
                <p className="text-cafe-500 text-sm mb-6 max-w-xs">
                    Explora nuestro menú y agrega tus productos favoritos
                </p>
                <button
                    onClick={onSeguirComprando}
                    className="bg-cafe-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-cafe-800 active:scale-95 transition-all"
                >
                    Explorar Menú
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-cafe-900">
                    Mi Carrito
                    <span className="text-cafe-400 text-sm font-normal ml-2">
                        ({itemsCliente.length} {itemsCliente.length === 1 ? 'producto' : 'productos'})
                    </span>
                </h2>
                <button
                    onClick={limpiar}
                    className="text-red-400 hover:text-red-500 text-sm font-medium transition-colors"
                >
                    Vaciar
                </button>
            </div>

            {/* Lista de items */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                {itemsCliente.map((item) => {
                    const key = getKey(item);
                    return (
                        <div
                            key={key}
                            className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm animate-scale-in"
                        >
                            {/* Imagen */}
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-cafe-100">
                                <Image
                                    src={item.producto.imagen_url}
                                    alt={item.producto.nombre}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-cafe-800 text-sm leading-tight truncate">
                                    {item.producto.nombre}
                                </h4>

                                {/* Variante elegida */}
                                {item.variante_elegida && (
                                    <span className="text-xs text-gray-500">
                                        · {item.variante_elegida.nombre}
                                    </span>
                                )}

                                {/* Toppings elegidos */}
                                {item.toppings_elegidos && item.toppings_elegidos.length > 0 && (
                                    <p className="text-xs text-gray-500 truncate">
                                        · {item.toppings_elegidos.map((t) => t.nombre).join(', ')}
                                    </p>
                                )}

                                {/* Ingredientes removidos */}
                                {item.ingredientes_removidos && item.ingredientes_removidos.length > 0 && (
                                    <p className="text-xs text-red-400 truncate">
                                        Sin: {item.ingredientes_removidos.join(', ')}
                                    </p>
                                )}

                                {/* Precio unitario */}
                                <span className="text-xs text-cafe-400">
                                    {formatearPrecio(item.precio_final)} c/u
                                </span>

                                <p className="text-cafe-500 font-bold text-base mt-0.5">
                                    {formatearPrecio(item.precio_final * item.cantidad)}
                                </p>
                            </div>

                            {/* Controles */}
                            <div className="flex flex-col items-end gap-2">
                                <button
                                    onClick={() => eliminarPorKey(key)}
                                    className="text-cafe-300 hover:text-red-400 transition-colors p-1"
                                    aria-label={`Eliminar ${item.producto.nombre}`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                <div className="flex items-center gap-2 bg-cafe-50 rounded-full px-1.5 py-0.5">
                                    <button
                                        onClick={() => actualizarCantidadPorKey(key, item.cantidad - 1)}
                                        className="w-7 h-7 rounded-full bg-white text-cafe-600 flex items-center justify-center text-sm font-bold hover:bg-cafe-100 active:scale-90 transition-all shadow-sm"
                                        aria-label="Reducir cantidad"
                                    >
                                        −
                                    </button>
                                    <span className="text-cafe-800 font-semibold text-sm w-5 text-center">
                                        {item.cantidad}
                                    </span>
                                    <button
                                        onClick={() => actualizarCantidadPorKey(key, item.cantidad + 1)}
                                        className="w-7 h-7 rounded-full bg-white text-cafe-600 flex items-center justify-center text-sm font-bold hover:bg-cafe-100 active:scale-90 transition-all shadow-sm"
                                        aria-label="Aumentar cantidad"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Resumen y CTA */}
            <div className="border-t border-cafe-100 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-cafe-500 text-sm">Subtotal</span>
                    <span className="text-cafe-700 font-bold text-lg">{formatearPrecio(totalPrecio())}</span>
                </div>
                <button
                    onClick={onIrCheckout}
                    className="w-full bg-cafe-700 hover:bg-cafe-800 text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-cafe-700/25 flex items-center justify-center gap-2 text-base"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Ir a pagar
                </button>
                <button
                    onClick={onSeguirComprando}
                    className="w-full text-cafe-500 hover:text-cafe-700 font-medium py-2 text-sm transition-colors"
                >
                    ← Seguir comprando
                </button>
            </div>
        </div>
    );
}
