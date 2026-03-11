'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import type { Producto, Variante, Topping, CarritoItem, Ingrediente } from '@/types';
import type { GrupoConVariantes } from '@/types/variantes';
import { formatearPrecio } from '@/lib/utils/formatearPrecio';

interface ConfiguradorProductoProps {
    producto: Producto;
    grupo_variantes: GrupoConVariantes | null;
    toppings_disponibles: Topping[];
    ingredientes_disponibles: Ingrediente[];
    onCerrar: () => void;
    onConfirmar: (item: CarritoItem) => void;
}

export function ConfiguradorProducto({
    producto,
    grupo_variantes,
    toppings_disponibles,
    ingredientes_disponibles,
    onCerrar,
    onConfirmar,
}: ConfiguradorProductoProps) {
    const [varianteElegida, setVarianteElegida] = useState<Variante | null>(null);
    const [toppingsElegidos, setToppingsElegidos] = useState<Topping[]>([]);
    const [cantidad, setCantidad] = useState(1);
    const [errorVariante, setErrorVariante] = useState(false);
    const [errorToppings, setErrorToppings] = useState(false);

    // Ingredientes removibles
    const [ingredientesActivos, setIngredientesActivos] = useState<string[]>([]);

    useEffect(() => {
        if (ingredientes_disponibles.length > 0) {
            setIngredientesActivos(ingredientes_disponibles.map(i => i.id));
        }
    }, [ingredientes_disponibles]);

    const ingredientesRemovidos = ingredientes_disponibles
        .filter(i => !ingredientesActivos.includes(i.id))
        .map(i => i.nombre);

    const todosActivos = ingredientesActivos.length === ingredientes_disponibles.length;

    const toggleIngrediente = (id: string) => {
        setIngredientesActivos(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const toggleTodo = () => {
        if (todosActivos) {
            setIngredientesActivos([]);
        } else {
            setIngredientesActivos(ingredientes_disponibles.map(i => i.id));
        }
    };

    const precioUnitario = useMemo(() => {
        let base = producto.precio ?? 0;

        if (producto.tiene_variantes && varianteElegida) {
            // Si la variante tiene precio definido > 0, usarlo.
            // Si no, mantener el precio base del producto.
            if (varianteElegida.precio && varianteElegida.precio > 0) {
                base = varianteElegida.precio;
            }
            // else: base ya es producto.precio, no cambiar
        }

        const toppingsExtra = Math.max(0, toppingsElegidos.length - producto.toppings_gratis);
        const costoToppings = toppingsExtra * (producto.precio_topping_extra || 0);

        return base + costoToppings;
    }, [producto, varianteElegida, toppingsElegidos]);

    const precioTotal = precioUnitario * cantidad;

    const toggleTopping = (topping: Topping) => {
        setToppingsElegidos((prev) => {
            const existe = prev.find((t) => t.id === topping.id);
            if (existe) return prev.filter((t) => t.id !== topping.id);
            return [...prev, topping];
        });
        setErrorToppings(false);
    };

    const handleConfirmar = () => {
        if (producto.tiene_variantes && !varianteElegida) {
            setErrorVariante(true);
            return;
        }

        if (producto.acepta_toppings && toppingsElegidos.length === 0) {
            setErrorToppings(true);
            return;
        }

        onConfirmar({
            producto,
            cantidad,
            variante_elegida: varianteElegida || null,
            toppings_elegidos: toppingsElegidos,
            ingredientes_removidos: ingredientesRemovidos,
            precio_final: precioUnitario,
        });
    };

    const variantes = grupo_variantes?.variantes
        ?.filter((v: Variante) => v.disponible)
        ?.sort((a: Variante, b: Variante) => a.orden - b.orden) ?? [];

    const esSabores = [
        'Crepa Dulce', 'Crepa Salada', 'Waffle', 'Marquesita'
    ].includes(producto.nombre);

    const esCombo =
        producto.tiene_variantes &&
        producto.tiene_ingredientes;

    const labelSaborTopping = esSabores ? 'sabor' : 'topping';
    const labelSaboresPlural = esSabores ? 'sabores' : 'toppings';

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label={`Configurar ${producto.nombre}`}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onCerrar} />

            <div className="relative bg-crema-50 w-full sm:w-[480px] sm:max-h-[90vh] max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up shadow-2xl flex flex-col">
                {/* Imagen */}
                <div className="relative h-52 sm:h-60 bg-cafe-100 flex-shrink-0">
                    <Image
                        src={producto.imagen_url}
                        alt={`Foto de ${producto.nombre}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 480px"
                        priority
                    />
                    <button
                        onClick={onCerrar}
                        className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
                        aria-label="Cerrar"
                    >
                        <svg className="w-5 h-5 text-cafe-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Contenido scrollable */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Nombre y descripción */}
                    <div>
                        <h2 className="text-xl font-bold text-cafe-900">{producto.nombre}</h2>
                        {producto.descripcion && (
                            <p className="text-cafe-600 text-sm mt-1 leading-relaxed">{producto.descripcion}</p>
                        )}
                    </div>

                    {/* ═══ SECCIÓN VARIANTES ═══ */}
                    {producto.tiene_variantes && variantes.length > 0 && (
                        <div className="space-y-2.5">
                            <div>
                                <h3 className="text-sm font-bold text-cafe-800 uppercase tracking-wide">
                                    {grupo_variantes?.nombre || 'Elige tu opción'}
                                </h3>
                                <p className="text-xs text-cafe-400">Obligatorio — elige una</p>
                            </div>

                            <div className="space-y-2">
                                {variantes.map((variante: Variante) => (
                                    <button
                                        key={variante.id}
                                        onClick={() => {
                                            setVarianteElegida(variante);
                                            setErrorVariante(false);
                                        }}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${varianteElegida?.id === variante.id
                                            ? 'border-cafe-600 bg-cafe-50 ring-2 ring-cafe-600/20'
                                            : 'border-gray-200 bg-white hover:border-cafe-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${varianteElegida?.id === variante.id
                                                ? 'border-cafe-600'
                                                : 'border-gray-300'
                                                }`}>
                                                {varianteElegida?.id === variante.id && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-cafe-600" />
                                                )}
                                            </div>
                                            <span className="font-medium text-sm text-cafe-800">
                                                {variante.nombre}
                                            </span>
                                        </div>
                                        {variante.precio && variante.precio > 0 && (
                                            <span className="font-bold text-sm text-cafe-700">
                                                {formatearPrecio(variante.precio)}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {errorVariante && (
                                <p className="text-red-500 text-xs font-medium animate-fade-in">
                                    ⚠️ Por favor elige una opción
                                </p>
                            )}
                        </div>
                    )}

                    {/* ═══ SECCIÓN TOPPINGS ═══ */}
                    {producto.acepta_toppings && toppings_disponibles.length > 0 && (
                        <div className="space-y-2.5">
                            <div>
                                <h3 className="text-sm font-bold text-cafe-800 uppercase tracking-wide">
                                    {esSabores ? 'Elige tus sabores' : 'Elige tus toppings'}
                                </h3>
                                <p className="text-xs text-cafe-400">
                                    {producto.toppings_gratis > 0
                                        ? `Incluye ${producto.toppings_gratis} ${producto.toppings_gratis === 1 ? labelSaborTopping : labelSaboresPlural} — extra +${formatearPrecio(producto.precio_topping_extra)} c/u`
                                        : `Cada ${labelSaborTopping} +${formatearPrecio(producto.precio_topping_extra)}`
                                    }
                                    <span className="text-red-400 ml-1">
                                        · Mínimo 1 requerido
                                    </span>
                                </p>
                            </div>

                            {toppingsElegidos.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-cafe-700 bg-cafe-50 border border-cafe-200 px-2.5 py-1 rounded-full">
                                        {toppingsElegidos.length}{' '}
                                        {toppingsElegidos.length === 1 ? labelSaborTopping : labelSaboresPlural}{' elegido'}
                                        {toppingsElegidos.length !== 1 ? 's' : ''}
                                    </span>

                                    {toppingsElegidos.length > producto.toppings_gratis && (
                                        <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                                            +{formatearPrecio(
                                                (toppingsElegidos.length - producto.toppings_gratis) * (producto.precio_topping_extra || 0)
                                            )} extra
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                {toppings_disponibles.map((topping) => {
                                    const seleccionado = toppingsElegidos.some((t) => t.id === topping.id);
                                    return (
                                        <button
                                            key={topping.id}
                                            onClick={() => toggleTopping(topping)}
                                            className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${seleccionado
                                                ? 'border-cafe-600 bg-cafe-50 ring-1 ring-cafe-600/20'
                                                : 'border-gray-200 bg-white hover:border-cafe-300'
                                                }`}
                                        >
                                            <div className={`w-4.5 h-4.5 rounded flex items-center justify-center flex-shrink-0 ${seleccionado
                                                ? 'bg-cafe-600'
                                                : 'border-2 border-gray-300'
                                                }`}
                                                style={{ width: '18px', height: '18px' }}
                                            >
                                                {seleccionado && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-cafe-800 truncate">
                                                {topping.nombre}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {errorToppings && (
                                <p className="text-red-500 text-xs font-medium animate-fade-in mt-1">
                                    ⚠️ Por favor elige al menos un {labelSaborTopping}
                                </p>
                            )}
                        </div>
                    )}
                    {/* ═══ SECCIÓN INGREDIENTES ═══ */}
                    {producto.tiene_ingredientes &&
                        ingredientes_disponibles.length > 0 && (
                            <div className="space-y-2.5">
                                {/* Header con botón Con todo */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-cafe-800 uppercase tracking-wide">
                                            {esCombo
                                                ? 'Personaliza tus papas'
                                                : 'Personaliza tus ingredientes'}
                                        </h3>
                                        <p className="text-xs text-cafe-400">
                                            {esCombo
                                                ? 'Desmarca lo que no quieres en tus papas'
                                                : 'Desmarca lo que no quieres'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleTodo}
                                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${todosActivos
                                            ? 'bg-cafe-700 text-white border-cafe-700'
                                            : 'bg-white text-cafe-600 border-cafe-300'
                                            }`}
                                    >
                                        {todosActivos ? '✓ Con todo' : 'Con todo'}
                                    </button>
                                </div>

                                {/* Lista de ingredientes */}
                                <div className="space-y-2">
                                    {ingredientes_disponibles.map((ingrediente) => {
                                        const activo = ingredientesActivos.includes(ingrediente.id);
                                        return (
                                            <button
                                                key={ingrediente.id}
                                                type="button"
                                                onClick={() => toggleIngrediente(ingrediente.id)}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${activo
                                                    ? 'border-cafe-200 bg-white'
                                                    : 'border-red-200 bg-red-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${activo
                                                        ? 'bg-cafe-600 border-2 border-cafe-600'
                                                        : 'bg-white border-2 border-red-300'
                                                        }`}>
                                                        {activo && (
                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className={`text-sm font-medium transition-colors ${activo
                                                        ? 'text-cafe-800'
                                                        : 'text-red-400 line-through'
                                                        }`}>
                                                        {ingrediente.nombre}
                                                    </span>
                                                </div>
                                                {!activo && (
                                                    <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">
                                                        Sin esto
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Resumen si hay removidos */}
                                {ingredientesRemovidos.length > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                                        <p className="text-xs text-amber-700 font-medium">
                                            ⚠️ Sin:{' '}
                                            {ingredientesRemovidos.join(', ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                </div>

                {/* Footer fijo — cantidad + botón agregar */}
                <div className="border-t border-cafe-200/50 bg-crema-50 p-5 flex-shrink-0 space-y-3">
                    {/* Selector de cantidad */}
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => setCantidad((prev) => Math.max(prev - 1, 1))}
                            className="w-10 h-10 rounded-full bg-cafe-100 text-cafe-700 flex items-center justify-center font-bold text-lg hover:bg-cafe-200 active:scale-90 transition-all"
                        >
                            −
                        </button>
                        <span className="text-cafe-800 font-semibold text-lg w-8 text-center">
                            {cantidad}
                        </span>
                        <button
                            onClick={() => setCantidad((prev) => Math.min(prev + 1, 20))}
                            className="w-10 h-10 rounded-full bg-cafe-100 text-cafe-700 flex items-center justify-center font-bold text-lg hover:bg-cafe-200 active:scale-90 transition-all"
                        >
                            +
                        </button>
                    </div>

                    {/* Botón agregar */}
                    <button
                        onClick={handleConfirmar}
                        className="w-full bg-cafe-700 hover:bg-cafe-800 text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-cafe-700/25 text-base"
                    >
                        Agregar al Carrito — {formatearPrecio(precioTotal)}
                    </button>
                </div>
            </div>
        </div>
    );
}
