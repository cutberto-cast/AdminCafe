'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { formatearPrecio } from '@/lib/utils/formatearPrecio';
import type { Producto, Categoria, Topping, GrupoVariantes, Variante } from '@/types';

interface VarianteForm {
    tempId: string;
    nombre: string;
    precio: string;
}

export default function AdminProductosPage() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [todosLosToppings, setTodosLosToppings] = useState<Topping[]>([]);
    const [cargando, setCargando] = useState(true);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
    const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null);
    const [filtroCategoria, setFiltroCategoria] = useState<string>('');
    const [busqueda, setBusqueda] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [subiendoImagen, setSubiendoImagen] = useState(false);

    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        imagen_url: '',
        categoria_id: '',
        esta_disponible: true,
        tiene_variantes: false,
        acepta_toppings: false,
        precio_topping_extra: '0',
        toppings_gratis: '0',
        toppings_seleccionados: [] as string[],
        tiene_ingredientes: false,
    });

    // Estado para el constructor de variantes
    const [nombreGrupo, setNombreGrupo] = useState('');
    const [variantesForm, setVariantesForm] = useState<VarianteForm[]>([]);
    const [ingredientesForm, setIngredientesForm] = useState<{ tempId: string; nombre: string }[]>([]);

    const supabase = createClient();

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        const [resProd, resCat, resTopp] = await Promise.all([
            supabase.from('productos').select('*').order('creado_en', { ascending: false }),
            supabase.from('categorias').select('*').order('orden'),
            supabase.from('toppings').select('*').eq('activo', true).order('nombre'),
        ]);

        if (resProd.data) setProductos(resProd.data);
        if (resCat.data) setCategorias(resCat.data);
        if (resTopp.data) setTodosLosToppings(resTopp.data);
        setCargando(false);
    }, [supabase]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const productosFiltrados = productos.filter((p) => {
        const coincideCategoria = !filtroCategoria || p.categoria_id === filtroCategoria;
        const coincideBusqueda = !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
        return coincideCategoria && coincideBusqueda;
    });

    const abrirCrear = () => {
        setProductoEditando(null);
        setForm({
            nombre: '',
            descripcion: '',
            precio: '',
            imagen_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop',
            categoria_id: categorias[0]?.id ?? '',
            esta_disponible: true,
            tiene_variantes: false,
            acepta_toppings: false,
            precio_topping_extra: '0',
            toppings_gratis: '0',
            toppings_seleccionados: [],
            tiene_ingredientes: false,
        });
        setNombreGrupo('');
        setVariantesForm([]);
        setIngredientesForm([]);
        setModalAbierto(true);
    };

    const abrirEditar = async (producto: Producto) => {
        setProductoEditando(producto);
        setForm({
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio?.toString() ?? '',
            imagen_url: producto.imagen_url,
            categoria_id: producto.categoria_id,
            esta_disponible: producto.esta_disponible,
            tiene_variantes: producto.tiene_variantes,
            acepta_toppings: producto.acepta_toppings,
            precio_topping_extra: (producto.precio_topping_extra ?? 0).toString(),
            toppings_gratis: (producto.toppings_gratis ?? 0).toString(),
            toppings_seleccionados: [],
            tiene_ingredientes: producto.tiene_ingredientes ?? false,
        });
        setNombreGrupo('');
        setVariantesForm([]);
        setIngredientesForm([]);

        // Cargar variantes del producto
        if (producto.tiene_variantes) {
            const { data: grupos } = await supabase
                .from('grupos_variantes')
                .select('*')
                .eq('producto_id', producto.id)
                .limit(1);

            if (grupos && grupos.length > 0) {
                const grupo = grupos[0] as GrupoVariantes;
                setNombreGrupo(grupo.nombre);

                const { data: vars } = await supabase
                    .from('variantes')
                    .select('*')
                    .eq('grupo_id', grupo.id)
                    .order('orden');

                if (vars) {
                    setVariantesForm(
                        vars.map((v: Variante) => ({
                            tempId: v.id,
                            nombre: v.nombre,
                            precio: v.precio?.toString() ?? '',
                        }))
                    );
                }
            }
        }

        // Cargar toppings vinculados
        if (producto.acepta_toppings) {
            const { data: pt } = await supabase
                .from('producto_toppings')
                .select('topping_id')
                .eq('producto_id', producto.id);

            if (pt) {
                setForm((prev) => ({
                    ...prev,
                    toppings_seleccionados: pt.map((r: { topping_id: string }) => r.topping_id),
                }));
            }
        }

        // Cargar ingredientes del producto
        if (producto.tiene_ingredientes) {
            const { data } = await supabase
                .from('producto_ingredientes')
                .select('*')
                .eq('producto_id', producto.id)
                .order('orden');
            if (data) {
                setIngredientesForm(
                    data.map((i: { id: string; nombre: string }) => ({
                        tempId: i.id,
                        nombre: i.nombre
                    }))
                );
            }
        }

        setModalAbierto(true);
    };

    const handleSubirImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const archivo = e.target.files[0] as File;
        const extension = archivo.name.split('.').pop();
        const nombreArchivo = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${extension}`;

        setSubiendoImagen(true);

        try {
            const { error } = await supabase.storage
                .from('imagenes')
                .upload(`productos/${nombreArchivo}`, archivo, { cacheControl: '3600', upsert: false });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('imagenes')
                .getPublicUrl(`productos/${nombreArchivo}`);

            setForm((prev) => ({ ...prev, imagen_url: publicUrl }));
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            alert('Hubo un error al subir la imagen. Intenta nuevamente.');
        } finally {
            setSubiendoImagen(false);
        }
    };

    const agregarVariante = () => {
        setVariantesForm([
            ...variantesForm,
            { tempId: `temp-${Date.now()}`, nombre: '', precio: '' },
        ]);
    };

    const eliminarVariante = (tempId: string) => {
        setVariantesForm(variantesForm.filter((v) => v.tempId !== tempId));
    };

    const actualizarVariante = (tempId: string, campo: 'nombre' | 'precio', valor: string) => {
        setVariantesForm(
            variantesForm.map((v) =>
                v.tempId === tempId ? { ...v, [campo]: valor } : v
            )
        );
    };

    const handleGuardar = async () => {
        if (!form.nombre || !form.categoria_id) return;
        if (!form.tiene_variantes && !form.precio) return;
        if (form.tiene_variantes && variantesForm.length === 0) {
            alert('Agrega al menos una variante.');
            return;
        }
        if (form.tiene_variantes && !nombreGrupo.trim()) {
            alert('Define el nombre del grupo de variantes.');
            return;
        }

        setGuardando(true);

        const datos = {
            nombre: form.nombre,
            descripcion: form.descripcion,
            precio: form.tiene_variantes ? null : parseFloat(form.precio),
            imagen_url: form.imagen_url,
            categoria_id: form.categoria_id,
            esta_disponible: form.esta_disponible,
            tiene_variantes: form.tiene_variantes,
            acepta_toppings: form.acepta_toppings,
            precio_topping_extra: form.acepta_toppings ? parseFloat(form.precio_topping_extra) || 0 : 0,
            toppings_gratis: form.acepta_toppings ? parseInt(form.toppings_gratis) || 0 : 0,
            tiene_ingredientes: form.tiene_ingredientes,
        };

        let productoId = productoEditando?.id;

        try {
            if (productoEditando) {
                const { error } = await supabase.from('productos').update(datos).eq('id', productoEditando.id);
                if (error) throw error;
                setProductos(productos.map((p) => p.id === productoEditando.id ? { ...p, ...datos } as Producto : p));
            } else {
                const { data, error } = await supabase.from('productos').insert(datos).select().single();
                if (error) throw error;
                if (data) {
                    productoId = data.id;
                    setProductos([data, ...productos]);
                }
            }

            if (!productoId) throw new Error('No se obtuvo el ID del producto');

            // --- Guardar variantes ---
            if (form.tiene_variantes) {
                // Eliminar grupos anteriores (CASCADE elimina variantes hijas)
                await supabase.from('grupos_variantes').delete().eq('producto_id', productoId);

                // Insertar nuevo grupo
                const { data: grupo, error: grupoErr } = await supabase
                    .from('grupos_variantes')
                    .insert({ producto_id: productoId, nombre: nombreGrupo.trim() })
                    .select()
                    .single();

                if (grupoErr) throw grupoErr;

                if (grupo) {
                    // Insertar variantes
                    const variantesInsert = variantesForm
                        .filter((v) => v.nombre.trim())
                        .map((v, idx) => ({
                            grupo_id: grupo.id,
                            nombre: v.nombre.trim(),
                            precio: v.precio && Number(v.precio) > 0
                                ? Number(v.precio)
                                : null,
                            orden: idx,
                        }));

                    if (variantesInsert.length > 0) {
                        const { error: varErr } = await supabase.from('variantes').insert(variantesInsert);
                        if (varErr) throw varErr;
                    }
                }
            } else {
                // Limpiar variantes si ya no tiene
                await supabase.from('grupos_variantes').delete().eq('producto_id', productoId);
            }

            // --- Guardar toppings vinculados ---
            // Siempre limpiar primero
            await supabase.from('producto_toppings').delete().eq('producto_id', productoId);

            if (form.acepta_toppings && form.toppings_seleccionados.length > 0) {
                const toppingsInsert = form.toppings_seleccionados.map((tid) => ({
                    producto_id: productoId,
                    topping_id: tid,
                }));
                const { error: tErr } = await supabase.from('producto_toppings').insert(toppingsInsert);
                if (tErr) throw tErr;
            }

            // --- Guardar ingredientes ---
            if (form.tiene_ingredientes) {
                // Eliminar ingredientes anteriores
                await supabase
                    .from('producto_ingredientes')
                    .delete()
                    .eq('producto_id', productoId);

                // Insertar nuevos (filtrar nombres vacíos)
                const ingValidos = ingredientesForm
                    .filter(i => i.nombre.trim() !== '');

                if (ingValidos.length > 0) {
                    await supabase
                        .from('producto_ingredientes')
                        .insert(
                            ingValidos.map((ing, idx) => ({
                                producto_id: productoId,
                                nombre: ing.nombre.trim(),
                                orden: idx,
                            }))
                        );
                }
            } else {
                // Si se desactivó, limpiar ingredientes
                await supabase
                    .from('producto_ingredientes')
                    .delete()
                    .eq('producto_id', productoId);
            }
        } catch (err) {
            console.error('Error al guardar:', err);
            alert('Error al guardar el producto. Revisa la consola.');
        }

        setGuardando(false);
        setModalAbierto(false);
    };

    const handleEliminar = async (id: string) => {
        const { error } = await supabase.from('productos').delete().eq('id', id);
        if (!error) {
            setProductos(productos.filter((p) => p.id !== id));
        }
        setConfirmarEliminar(null);
    };

    const toggleDisponibilidad = async (producto: Producto) => {
        const nuevoEstado = !producto.esta_disponible;
        setProductos(productos.map((p) => p.id === producto.id ? { ...p, esta_disponible: nuevoEstado } : p));

        const { error } = await supabase.from('productos').update({ esta_disponible: nuevoEstado }).eq('id', producto.id);
        if (error) {
            setProductos(productos.map((p) => p.id === producto.id ? { ...p, esta_disponible: producto.esta_disponible } : p));
        }
    };

    const getNombreCategoria = (id: string): string => {
        return categorias.find((c) => c.id === id)?.nombre ?? 'Sin categoría';
    };

    const getTipoProducto = (producto: Producto): string => {
        const partes: string[] = [];
        if (producto.tiene_variantes) partes.push('Variable');
        if (producto.acepta_toppings) partes.push('Con toppings');
        if (producto.tiene_ingredientes) partes.push('Con ingredientes');
        if (partes.length === 0) return 'Simple';
        if (partes.length >= 2) return 'Configurable';
        return partes[0] ?? 'Simple';
    };

    if (cargando) {
        return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-[var(--color-texto-1)] tracking-tight">Productos</h1>
                    <p className="text-[13px] text-[var(--color-texto-3)]">{productos.length} productos en total</p>
                </div>
                <button onClick={abrirCrear} className="bg-[var(--color-acento)] hover:bg-[var(--color-acento-hover)] text-white font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                    Nuevo Producto
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Buscar productos..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 px-3 py-2 bg-white border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all" />
                <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="px-3 py-2 bg-white border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all">
                    <option value="">Todas las categorías</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
            </div>

            {/* ═══════ VISTA MÓVIL: LISTA COMPACTA ═══════ */}
            <div className="grid grid-cols-1 gap-2 sm:hidden">
                {productosFiltrados.map((producto) => (
                    <div key={producto.id}
                        className="bg-white border border-[var(--color-borde)]
                                rounded-xl p-2.5 flex items-center gap-3
                                shadow-sm transition-all
                                hover:border-[var(--color-espresso)]/30">

                        {/* Imagen 48x48 */}
                        <div className="relative w-12 h-12 rounded-lg
                                overflow-hidden bg-[var(--color-base)]
                                border border-[var(--color-borde)]
                                flex-shrink-0">
                            {producto.imagen_url ? (
                                <Image
                                    src={producto.imagen_url}
                                    alt={producto.nombre}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center
                                    justify-center">
                                    <svg className="w-5 h-5 text-[var(--color-texto-3)]"
                                        fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8
                                4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Info: Nombre → Categoría → Precio */}
                        <div className="flex-1 min-w-0 flex flex-col
                                justify-center">
                            <h3 className="font-semibold text-[13px]
                                text-[var(--color-texto-1)]
                                leading-tight truncate">
                                {producto.nombre}
                            </h3>
                            <span className="text-[11px] font-medium
                                    text-[var(--color-texto-2)]
                                    mt-0.5 truncate">
                                {getNombreCategoria(producto.categoria_id)}
                            </span>
                            <p className="font-bold text-[12px]
                                text-[var(--color-texto-1)] mt-0.5">
                                {producto.tiene_variantes
                                    ? <span className="text-[10px] font-normal
                                        text-[var(--color-texto-3)]
                                        mr-1">Desde</span>
                                    : ''}
                                {formatearPrecio(producto.precio ?? 0)}
                            </p>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-1 flex-shrink-0
                                pl-2 border-l
                                border-[var(--color-borde)]/50">
                            <button
                                onClick={() => toggleDisponibilidad(producto)}
                                className={`relative inline-flex h-5 w-9
                            items-center rounded-full transition-colors mr-1
                            ${producto.esta_disponible
                                        ? 'bg-[var(--color-matcha)]'
                                        : 'bg-red-400'}`}
                            >
                                <span
                                    className="inline-block h-3.5 w-3.5 rounded-full
                                bg-white shadow-sm transition-transform"
                                    style={{
                                        transform: producto.esta_disponible
                                            ? 'translateX(18px)'
                                            : 'translateX(4px)'
                                    }}
                                />
                            </button>

                            <button
                                onClick={() => abrirEditar(producto)}
                                className="p-1.5 text-[var(--color-texto-2)]
                                hover:text-[var(--color-espresso)]
                                hover:bg-[var(--color-base)]
                                rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round"
                                        strokeLinejoin="round" strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002
                                2h11a2 2 0 002-2v-5m-1.414-9.414a2 2
                                0 112.828 2.828L11.828 15H9v-2.828
                                l8.586-8.586z" />
                                </svg>
                            </button>

                            <button
                                onClick={() => setConfirmarEliminar(producto.id)}
                                className="p-1.5 text-red-400 hover:text-red-600
                                hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round"
                                        strokeLinejoin="round" strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138
                                21H7.862a2 2 0 01-1.995-1.858L5 7m5
                                4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1
                                1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}

                {productosFiltrados.length === 0 && (
                    <div className="text-center py-8 bg-white rounded-xl
                                border border-[var(--color-borde)]">
                        <p className="text-[var(--color-texto-3)] text-[13px]">
                            No se encontraron productos
                        </p>
                    </div>
                )}
            </div>

            {/* ═══════ VISTA DESKTOP: TABLA ═══════ */}
            <div className="hidden sm:block bg-white
                            border border-[var(--color-borde)]
                            rounded-xl shadow-[var(--shadow-card)]
                            overflow-hidden transition-shadow
                            hover:shadow-[var(--shadow-hover)]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-borde)]
                                text-[10px] font-bold tracking-wider
                                uppercase text-[var(--color-texto-3)]
                                bg-[var(--color-base)]/30">
                                <th className="text-left px-4 py-3">Producto</th>
                                <th className="text-left px-4 py-3">Categoría</th>
                                <th className="text-left px-4 py-3">Precio</th>
                                <th className="text-center px-4 py-3">Tipo</th>
                                <th className="text-center px-4 py-3">Estado</th>
                                <th className="text-right px-4 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-borde)]">
                            {productosFiltrados.map((producto) => (
                                <tr key={producto.id}
                                    className="hover:bg-[var(--color-base)]
                                    transition-colors duration-150 group">

                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-9 h-9 rounded-lg
                                            overflow-hidden bg-white
                                            border border-[var(--color-borde)]
                                            flex-shrink-0">
                                                {producto.imagen_url ? (
                                                    <Image
                                                        src={producto.imagen_url}
                                                        alt={producto.nombre}
                                                        fill
                                                        className="object-cover"
                                                        sizes="36px"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex
                                                items-center justify-center">
                                                        <svg className="w-4 h-4
                                                text-[var(--color-texto-3)]"
                                                            fill="none" viewBox="0 0 24 24"
                                                            stroke="currentColor">
                                                            <path strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={1.5}
                                                                d="M20 7l-8-4-8 4m16 0l-8
                                            4m8-4v10l-8 4m0-10L4 7m8
                                            4v10M4 7v10l8 4" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-semibold text-[13px]
                                        text-[var(--color-texto-1)]
                                        truncate max-w-[220px]"
                                                title={producto.nombre}>
                                                {producto.nombre}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-4 py-2">
                                        <span className="text-[12px]
                                        text-[var(--color-texto-2)]">
                                            {getNombreCategoria(producto.categoria_id)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2">
                                        <span className="font-semibold text-[13px]
                                        text-[var(--color-texto-1)]">
                                            {producto.tiene_variantes
                                                ? <span className="text-[10px]
                                                text-[var(--color-texto-3)]
                                                mr-1">Desde</span>
                                                : ''}
                                            {formatearPrecio(producto.precio ?? 0)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2 text-center">
                                        <span className="text-[10px]
                                        text-[var(--color-texto-2)]
                                        font-semibold uppercase
                                        tracking-wide
                                        bg-[var(--color-base)]
                                        px-2 py-1 rounded-md">
                                            {getTipoProducto(producto)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2 text-center">
                                        <button
                                            onClick={() => toggleDisponibilidad(producto)}
                                            className={`relative inline-flex h-5 w-9
                            items-center rounded-full transition-colors
                            ${producto.esta_disponible
                                                    ? 'bg-[var(--color-matcha)]'
                                                    : 'bg-red-400'}`}
                                        >
                                            <span
                                                className={`inline-block h-3.5 w-3.5
                                rounded-full bg-white shadow-sm
                                transition-transform
                                ${producto.esta_disponible
                                                        ? 'translate-x-5'
                                                        : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </td>

                                    <td className="px-4 py-2 text-right">
                                        <div className="flex items-center justify-end
                                        gap-0.5 opacity-70
                                        group-hover:opacity-100
                                        transition-opacity">
                                            <button
                                                onClick={() => abrirEditar(producto)}
                                                className="p-1.5 hover:bg-white rounded-lg
                                        transition-colors
                                        text-[var(--color-texto-2)]
                                        hover:text-[var(--color-espresso)]
                                        hover:shadow-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2
                                        0 002 2h11a2 2 0 002-2v-5
                                        m-1.414-9.414a2 2 0 112.828
                                        2.828L11.828 15H9v-2.828
                                        l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setConfirmarEliminar(producto.id)}
                                                className="p-1.5 hover:bg-red-50 rounded-lg
                                        transition-colors text-red-400
                                        hover:text-red-600 hover:shadow-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0
                                        0116.138 21H7.862a2 2 0
                                        01-1.995-1.858L5 7m5 4v6m4-6v6
                                        m1-10V4a1 1 0 00-1-1h-4a1 1 0
                                        00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ═══════ MODAL CREAR/EDITAR ═══════ */}
            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[var(--color-espresso-dark)]/40 backdrop-blur-sm" onClick={() => setModalAbierto(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[var(--shadow-modal)] border border-[var(--color-borde)] animate-scale-in">
                        <div className="sticky top-0 bg-white border-b border-[var(--color-borde)] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <h3 className="text-lg font-semibold text-[var(--color-texto-1)]">{productoEditando ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                            <button onClick={() => setModalAbierto(false)} className="text-[var(--color-texto-3)] hover:text-[var(--color-texto-1)] transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Vista previa de imagen */}
                            {form.imagen_url && (
                                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-[var(--color-base)] border border-[var(--color-borde)]">
                                    <Image src={form.imagen_url} alt="Preview" fill className="object-cover" sizes="480px" />
                                </div>
                            )}

                            {/* Nombre */}
                            <div><label className="block text-xs font-medium text-[var(--color-texto-2)] mb-1.5">Nombre *</label><input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all" /></div>

                            {/* Descripción */}
                            <div><label className="block text-xs font-medium text-[var(--color-texto-2)] mb-1.5">Descripción</label><textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all resize-none" /></div>

                            {/* Categoría */}
                            <div><label className="block text-xs font-medium text-[var(--color-texto-2)] mb-1.5">Categoría *</label>
                                <select value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })} className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all">
                                    <option value="" disabled>Seleccione categoría</option>
                                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>

                            {/* ══ SECCIÓN PRECIO ══ */}
                            <div className="bg-[var(--color-base)] rounded-xl p-4 space-y-3">
                                <label className="block text-xs font-semibold text-[var(--color-texto-1)]">Tipo de precio</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, tiene_variantes: false })}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${!form.tiene_variantes
                                            ? 'border-[var(--color-espresso)] bg-white ring-2 ring-[var(--color-espresso)]/30'
                                            : 'border-[var(--color-borde)] bg-white hover:border-cafe-300'
                                            }`}
                                    >
                                        <p className="text-sm font-semibold text-[var(--color-texto-1)]">Precio fijo</p>
                                        <p className="text-xs text-[var(--color-texto-3)] mt-0.5">Un solo precio para este producto</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForm({ ...form, tiene_variantes: true });
                                            if (variantesForm.length === 0) {
                                                agregarVariante();
                                            }
                                        }}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${form.tiene_variantes
                                            ? 'border-[var(--color-espresso)] bg-white ring-2 ring-[var(--color-espresso)]/30'
                                            : 'border-[var(--color-borde)] bg-white hover:border-cafe-300'
                                            }`}
                                    >
                                        <p className="text-sm font-semibold text-[var(--color-texto-1)]">Tiene variantes</p>
                                        <p className="text-xs text-[var(--color-texto-3)] mt-0.5">El precio depende de la opción elegida</p>
                                    </button>
                                </div>

                                {/* Campo de precio fijo */}
                                {!form.tiene_variantes && (
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--color-texto-2)] mb-1.5">Precio (MXN) *</label>
                                        <input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all" min="0" step="0.5" />
                                    </div>
                                )}

                                {/* Constructor de variantes */}
                                {form.tiene_variantes && (
                                    <div className="border border-[var(--color-borde)] rounded-xl p-4 space-y-3 bg-white">
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--color-texto-2)] mb-1.5">Nombre del grupo de variantes *</label>
                                            <input
                                                type="text"
                                                value={nombreGrupo}
                                                onChange={(e) => setNombreGrupo(e.target.value)}
                                                placeholder="Ej: Tamaño, Número de sabores"
                                                className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            {variantesForm.map((v) => (
                                                <div key={v.tempId} className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        value={v.nombre}
                                                        onChange={(e) => actualizarVariante(v.tempId, 'nombre', e.target.value)}
                                                        placeholder="Nombre (Ej: Grande)"
                                                        className="flex-1 px-3 py-2 border border-[var(--color-borde)] rounded-md text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all"
                                                    />
                                                    <div>
                                                        <input
                                                            type="number"
                                                            value={v.precio || ''}
                                                            onChange={(e) => actualizarVariante(v.tempId, 'precio', e.target.value)}
                                                            placeholder="Precio (opcional)"
                                                            className="w-28 px-3 py-2 border border-[var(--color-borde)] rounded-md text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all"
                                                            min="0"
                                                            step="0.5"
                                                        />
                                                        <p className="text-[10px] text-[var(--color-texto-3)] mt-0.5 leading-tight">Vacío = usa precio del producto</p>
                                                    </div>
                                                    <button
                                                        onClick={() => eliminarVariante(v.tempId)}
                                                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={agregarVariante}
                                            className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-[var(--color-texto-2)] hover:border-[var(--color-espresso)] hover:text-[var(--color-texto-1)] transition-colors flex items-center justify-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Agregar variante
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* ══ SECCIÓN TOPPINGS ══ */}
                            <div className="border border-[var(--color-borde)] rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700">¿Este producto acepta toppings?</span>
                                        <p className="text-xs text-[var(--color-texto-3)]">Extras opcionales que el cliente puede agregar</p>
                                    </div>
                                    <button
                                        onClick={() => setForm({ ...form, acepta_toppings: !form.acepta_toppings })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.acepta_toppings ? 'bg-[var(--color-matcha)]' : 'bg-[var(--color-borde)]'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${form.acepta_toppings ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                {form.acepta_toppings && (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-[var(--color-texto-2)] mb-1.5">Precio por topping extra</label>
                                                <input
                                                    type="number"
                                                    value={form.precio_topping_extra}
                                                    onChange={(e) => setForm({ ...form, precio_topping_extra: e.target.value })}
                                                    placeholder="Ej: 10"
                                                    className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all"
                                                    min="0"
                                                    step="0.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-[var(--color-texto-2)] mb-1.5">Toppings incluidos sin costo</label>
                                                <input
                                                    type="number"
                                                    value={form.toppings_gratis}
                                                    onChange={(e) => setForm({ ...form, toppings_gratis: e.target.value })}
                                                    placeholder="Ej: 1"
                                                    className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all"
                                                    min="0"
                                                />
                                                <p className="text-xs text-[var(--color-texto-3)] mt-1">
                                                    Ej: en crepas el primer sabor ya está en el precio, los adicionales cuestan extra
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-[var(--color-texto-1)] mb-1">Toppings disponibles para este producto</label>
                                            <p className="text-xs text-[var(--color-texto-3)] mb-2">
                                                Gestiona el catálogo completo en la sección Toppings
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-white border border-gray-100 rounded-lg p-3">
                                                {todosLosToppings.map((t) => (
                                                    <label key={t.id} className="flex items-center gap-2 text-sm p-1.5 hover:bg-[var(--color-base)] rounded cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={form.toppings_seleccionados.includes(t.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setForm({ ...form, toppings_seleccionados: [...form.toppings_seleccionados, t.id] });
                                                                } else {
                                                                    setForm({ ...form, toppings_seleccionados: form.toppings_seleccionados.filter((id) => id !== t.id) });
                                                                }
                                                            }}
                                                            className="rounded text-[var(--color-espresso)] focus:ring-[var(--color-espresso)] w-4 h-4"
                                                        />
                                                        <span className="truncate">{t.nombre}</span>
                                                    </label>
                                                ))}
                                                {todosLosToppings.length === 0 && (
                                                    <span className="text-xs text-[var(--color-texto-3)] p-2 col-span-2">
                                                        No hay toppings activos. Crea toppings en la sección Toppings primero.
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* ═══ SECCIÓN INGREDIENTES ═══ */}
                            <div className="border-t border-[var(--color-borde)] pt-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-[var(--color-texto-1)]">
                                            Ingredientes personalizables
                                        </h3>
                                        <p className="text-xs text-[var(--color-texto-3)] mt-0.5">
                                            Ingredientes que el cliente puede quitar. No incluyas ingredientes básicos (pan, carne...).
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForm(f => ({
                                                ...f,
                                                tiene_ingredientes: !f.tiene_ingredientes
                                            }));
                                        }}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${form.tiene_ingredientes
                                            ? 'bg-[var(--color-matcha)]'
                                            : 'bg-red-400'
                                            }`}
                                    >
                                        <span className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform"
                                            style={{
                                                transform: form.tiene_ingredientes
                                                    ? 'translateX(18px)'
                                                    : 'translateX(4px)'
                                            }} />
                                    </button>
                                </div>

                                {form.tiene_ingredientes && (
                                    <div className="space-y-2">
                                        {ingredientesForm.map((ing, idx) => (
                                            <div key={ing.tempId} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={ing.nombre}
                                                    onChange={(e) => {
                                                        const nuevo = [...ingredientesForm];
                                                        nuevo[idx]!.nombre = e.target.value;
                                                        setIngredientesForm(nuevo);
                                                    }}
                                                    placeholder="Ej: Salsa especial, Rajas..."
                                                    className="flex-1 px-3 py-2 border border-[var(--color-borde)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)]/20"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setIngredientesForm(
                                                        ingredientesForm.filter((_, i) => i !== idx)
                                                    )}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setIngredientesForm([
                                                ...ingredientesForm,
                                                { tempId: `temp-${Date.now()}`, nombre: '' }
                                            ])}
                                            className="w-full py-2 border-2 border-dashed border-[var(--color-borde)] rounded-lg text-sm text-[var(--color-texto-3)] hover:border-[var(--color-espresso)]/30 hover:text-[var(--color-texto-2)] transition-colors"
                                        >
                                            + Agregar ingrediente
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Imagen */}
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-texto-2)] mb-1.5">Imagen del producto</label>
                                <div>
                                    <label className="w-full cursor-pointer bg-[var(--color-base)] hover:bg-[var(--color-base)] border border-[var(--color-borde)] border border-[var(--color-borde)] rounded-xl px-4 py-2.5 text-sm text-center transition-colors flex items-center justify-center gap-2">
                                        {subiendoImagen ? (
                                            <div className="w-4 h-4 border-2 border-[var(--color-espresso)]/30 border-t-cafe-600 rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                <span className="text-[var(--color-texto-2)] font-medium">Subir imagen</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleSubirImagen} disabled={subiendoImagen} />
                                    </label>
                                </div>
                                <p className="text-xs text-[var(--color-texto-3)] mt-1.5">
                                    Proporción recomendada: 1:1 · Mínimo 600×600px · PNG o JPG
                                </p>
                            </div>

                            {/* Toggle de disponibilidad */}
                            <div className="flex items-center gap-3">
                                <button onClick={() => setForm({ ...form, esta_disponible: !form.esta_disponible })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.esta_disponible ? 'bg-[var(--color-matcha)]' : 'bg-[var(--color-borde)]'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${form.esta_disponible ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm text-[var(--color-texto-2)]">{form.esta_disponible ? 'Disponible' : 'No disponible'}</span>
                            </div>
                        </div>

                        {/* Footer del modal */}
                        <div className="border-t border-[var(--color-borde)] px-6 py-4 flex gap-3">
                            <button onClick={() => setModalAbierto(false)} className="flex-1 px-4 py-2.5 text-[var(--color-texto-2)] hover:bg-[var(--color-base)] border border-[var(--color-borde)] rounded-xl text-sm font-medium">Cancelar</button>
                            <button
                                onClick={handleGuardar}
                                disabled={!form.nombre || !form.categoria_id || (!form.tiene_variantes && !form.precio) || guardando}
                                className="flex-1 px-4 py-2.5 bg-[var(--color-acento)] hover:bg-[var(--color-acento-hover)] disabled:opacity-50 flex justify-center items-center text-white rounded-xl text-sm font-medium"
                            >
                                {guardando ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (productoEditando ? 'Guardar Cambios' : 'Crear Producto')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Eliminar */}
            {confirmarEliminar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[var(--color-espresso-dark)]/40 backdrop-blur-sm" onClick={() => setConfirmarEliminar(null)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in text-center">
                        <h3 className="text-lg font-semibold text-[var(--color-texto-1)] mb-2">¿Eliminar producto?</h3>
                        <p className="text-gray-500 text-sm mb-6">Esta acción no se puede deshacer.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmarEliminar(null)} className="flex-1 px-4 py-2.5 text-[var(--color-texto-2)] hover:bg-[var(--color-base)] border border-[var(--color-borde)] rounded-xl text-sm font-medium">Cancelar</button>
                            <button onClick={() => handleEliminar(confirmarEliminar)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
