'use client';

import Image from 'next/image';
import type { Producto, Topping } from '@/types';
import type { GrupoConVariantes } from '@/types/variantes';
import { formatearPrecio } from '@/lib/utils/formatearPrecio';
import { useCarrito } from '@/stores/carritoStore';

interface ProductoCardProps {
    producto: Producto;
    onVerDetalle: (producto: Producto) => void;
    grupo_variantes?: GrupoConVariantes | null;
    toppings_disponibles?: Topping[];
    onAbrirConfigurador: (producto: Producto) => void;
}

export function ProductoCard({
    producto,
    onVerDetalle,
    onAbrirConfigurador,
}: ProductoCardProps) {
    const agregarSimple = useCarrito((state) => state.agregarSimple);

    const esConfigurable = producto.tiene_variantes || producto.acepta_toppings || producto.tiene_ingredientes;

    const handleBotonAgregar = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!producto.esta_disponible) return;
        if (esConfigurable) {
            onAbrirConfigurador(producto);
        } else {
            agregarSimple(producto);
        }
    };

    const handleCardClick = () => {
        if (esConfigurable) {
            onAbrirConfigurador(producto);
        } else {
            onVerDetalle(producto);
        }
    };

    return (
        <article
            onClick={handleCardClick}
            className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer animate-scale-in ${!producto.esta_disponible ? 'opacity-60' : ''
                }`}
            role="button"
            tabIndex={0}
            aria-label={`Ver detalle de ${producto.nombre}`}
        >
            {/* Imagen del producto */}
            <div className="relative aspect-square overflow-hidden bg-cafe-100">
                <Image
                    src={producto.imagen_url}
                    alt={`Foto de ${producto.nombre}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading="lazy"
                />

                {/* Badge de no disponible */}
                {!producto.esta_disponible && (
                    <div className="absolute inset-0 bg-cafe-900/40 flex items-center justify-center">
                        <span className="bg-white/90 text-cafe-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                            Agotado
                        </span>
                    </div>
                )}

                {/* Botón agregar al carrito */}
                {producto.esta_disponible && (
                    <button
                        onClick={handleBotonAgregar}
                        className="absolute bottom-2 right-2 bg-[var(--color-primario)] text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:bg-cafe-800 active:scale-90 transition-all z-10"
                        aria-label={`Agregar ${producto.nombre} al carrito`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Info del producto */}
            <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-cafe-800 text-sm sm:text-base leading-tight line-clamp-1">
                    {producto.nombre}
                </h3>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-cafe-600 font-bold text-base sm:text-lg">
                        {producto.tiene_variantes && !producto.precio
                            ? 'Ver opciones'
                            : producto.tiene_variantes && producto.precio
                                ? `Desde ${formatearPrecio(producto.precio)}`
                                : formatearPrecio(producto.precio ?? 0)}
                    </span>
                </div>
                {esConfigurable && (
                    <span className="inline-block mt-1 text-xs text-cafe-500 bg-cafe-50 px-2 py-0.5 rounded-full">
                        Personalizable
                    </span>
                )}
            </div>
        </article>
    );
}
