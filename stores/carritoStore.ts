'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CarritoItem, Producto } from '@/types';

const generarKey = (item: CarritoItem): string => {
    const varKey = item.variante_elegida?.id || 'sin-variante';
    const topKey = [...(item.toppings_elegidos || [])]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((t) => t.id)
        .join(',');
    const ingKey = [...(item.ingredientes_removidos || [])]
        .sort()
        .join(',');
    return [
        item.producto.id,
        varKey,
        topKey || 'sin-toppings',
        ingKey || 'sin-removidos',
    ].join('|');
};

interface CarritoStore {
    items: CarritoItem[];
    agregarSimple: (producto: Producto) => void;
    agregarConfigurable: (item: CarritoItem) => void;
    eliminarPorKey: (key: string) => void;
    actualizarCantidadPorKey: (key: string, cantidad: number) => void;
    limpiar: () => void;
    totalItems: () => number;
    totalPrecio: () => number;
    getKey: (item: CarritoItem) => string;
}

export const useCarrito = create<CarritoStore>()(
    persist(
        (set, get) => ({
            items: [],

            agregarSimple: (producto: Producto) => {
                const nuevoItem: CarritoItem = {
                    producto,
                    cantidad: 1,
                    precio_final: producto.precio ?? 0,
                };
                const key = generarKey(nuevoItem);

                set((state) => {
                    const idx = state.items.findIndex(
                        (item) => generarKey(item) === key
                    );
                    if (idx >= 0) {
                        const items = [...state.items];
                        items[idx] = { ...items[idx]!, cantidad: items[idx]!.cantidad + 1 };
                        return { items };
                    }
                    return { items: [...state.items, nuevoItem] };
                });
            },

            agregarConfigurable: (item: CarritoItem) => {
                const key = generarKey(item);

                set((state) => {
                    const idx = state.items.findIndex(
                        (existing) => generarKey(existing) === key
                    );
                    if (idx >= 0) {
                        const items = [...state.items];
                        items[idx] = {
                            ...items[idx]!,
                            cantidad: items[idx]!.cantidad + item.cantidad,
                        };
                        return { items };
                    }
                    return { items: [...state.items, item] };
                });
            },

            eliminarPorKey: (key: string) => {
                set((state) => ({
                    items: state.items.filter((item) => generarKey(item) !== key),
                }));
            },

            actualizarCantidadPorKey: (key: string, cantidad: number) => {
                if (cantidad <= 0) {
                    get().eliminarPorKey(key);
                    return;
                }
                set((state) => ({
                    items: state.items.map((item) =>
                        generarKey(item) === key ? { ...item, cantidad } : item
                    ),
                }));
            },

            limpiar: () => set({ items: [] }),

            totalItems: () => {
                return get().items.reduce((acc, item) => acc + item.cantidad, 0);
            },

            totalPrecio: () => {
                return get().items.reduce(
                    (acc, item) => acc + item.precio_final * item.cantidad,
                    0
                );
            },

            getKey: (item: CarritoItem) => generarKey(item),
        }),
        { name: 'nube-alta-cafe-carrito' }
    )
);
