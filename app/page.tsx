'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { BannerHero } from '@/components/menu/BannerHero';
import { CategoriasNav } from '@/components/menu/CategoriasNav';
import { ProductoCard } from '@/components/menu/ProductoCard';
import { ProductoDetalle } from '@/components/menu/ProductoDetalle';
import { ConfiguradorProducto } from '@/components/menu/ConfiguradorProducto';
import { BarraNavegacion } from '@/components/menu/BarraNavegacion';
import { BarraBusqueda } from '@/components/menu/BarraBusqueda';
import { CarritoVista } from '@/components/carrito/CarritoVista';
import { CheckoutVista } from '@/components/carrito/CheckoutVista';
import { createClient } from '@/lib/supabase/client';
import { useCarrito } from '@/stores/carritoStore';
import type { Producto, Categoria, Banner, Topping, CarritoItem, MacroCategoria, Ingrediente } from '@/types';
import { MACRO_CATEGORIAS_CONFIG } from '@/types';
import type { GrupoConVariantes, ProductoConToppings, ProductoConIngredientes } from '@/types/variantes';

type Vista = 'home' | 'carrito' | 'checkout';

const ORDEN_CATEGORIAS = [
  'Bubble Tea',
  'Bebidas Frías',
  'Malteadas',
  'Sodas Italianas',
  'Bebidas',
  'Bebidas Calientes',
  'Alitas',
  'Salado',
  'Bar',
];

export default function HomePage() {
  const [vista, setVista] = useState<Vista>('home');
  const [macroActiva, setMacroActiva] = useState<MacroCategoria | null>(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const [productoConfigurador, setProductoConfigurador] = useState<Producto | null>(null);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerProductos, setBannerProductos] = useState<Record<string, string[]>>({});
  const [bannerFiltroActivo, setBannerFiltroActivo] = useState<string | null>(null);
  const [nombreNegocio, setNombreNegocio] = useState('Nube Alta Cafe');
  const [cargando, setCargando] = useState(true);

  // Datos de variantes y toppings
  const [gruposVariantes, setGruposVariantes] = useState<GrupoConVariantes[]>([]);
  const [productoToppings, setProductoToppings] = useState<ProductoConToppings[]>([]);
  const [productoIngredientes, setProductoIngredientes] = useState<ProductoConIngredientes[]>([]);

  const supabase = createClient();
  const agregarConfigurable = useCarrito((state) => state.agregarConfigurable);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    const [resCat, resProd, resBan, resConf, resBanProd, resGruposVar, resProdTopp, resProdIngr] = await Promise.all([
      supabase.from('categorias').select('*').order('orden'),
      supabase.from('productos').select('*').order('creado_en', { ascending: false }),
      supabase.from('banners').select('*').order('orden'),
      supabase.from('configuracion').select('*').limit(1).single(),
      supabase.from('banner_productos').select('*'),
      supabase.from('grupos_variantes').select('*, variantes (*)').order('creado_en'),
      supabase.from('producto_toppings').select('*, toppings (*)'),
      supabase.from('producto_ingredientes').select('*').order('orden'),
    ]);

    if (resCat.data) setCategorias(resCat.data);
    if (resProd.data) setProductos(resProd.data);
    if (resBan.data) setBanners(resBan.data);
    if (resConf.data) setNombreNegocio(resConf.data.nombre_negocio);
    if (resBanProd.data) {
      const bp: Record<string, string[]> = {};
      (resBanProd.data || []).forEach((row: any) => {
        if (!bp[row.banner_id]) bp[row.banner_id] = [];
        bp[row.banner_id]!.push(row.producto_id);
      });
      setBannerProductos(bp);
    }
    if (resGruposVar.data) setGruposVariantes(resGruposVar.data as GrupoConVariantes[]);
    if (resProdTopp.data) setProductoToppings(resProdTopp.data as ProductoConToppings[]);
    if (resProdIngr.data) {
      const mapa: Record<string, Ingrediente[]> = {};
      resProdIngr.data.forEach((row: Ingrediente) => {
        if (!mapa[row.producto_id]) mapa[row.producto_id] = [];
        mapa[row.producto_id]!.push(row);
      });
      const agrupados: ProductoConIngredientes[] = [];
      Object.entries(mapa).forEach(([producto_id, ingredientes]) => {
        agrupados.push({ producto_id, ingredientes });
      });
      setProductoIngredientes(agrupados);
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    const channel = supabase
      .channel('cambios-publicos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, () => {
        cargarDatos();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => {
        cargarDatos();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, () => {
        cargarDatos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cargarDatos, supabase]);

  // Helpers
  const getVariantesDeProducto = useCallback(
    (productoId: string): GrupoConVariantes | null => {
      return gruposVariantes.find((g) => g.producto_id === productoId) ?? null;
    },
    [gruposVariantes]
  );

  const getToppingsDeProducto = useCallback(
    (productoId: string): Topping[] => {
      return productoToppings
        .filter((pt) => pt.producto_id === productoId)
        .map((pt) => pt.toppings);
    },
    [productoToppings]
  );

  const getIngredientesDeProducto = useCallback(
    (productoId: string): Ingrediente[] => {
      return productoIngredientes
        .find(p => p.producto_id === productoId)
        ?.ingredientes ?? [];
    },
    [productoIngredientes]
  );

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      // Filtro por macro-categoría
      const categoriasEnMacro = categorias
        .filter(c => c.macro_categoria === macroActiva)
        .map(c => c.id);

      const coincideMacro =
        macroActiva === null ||
        categoriasEnMacro.includes(producto.categoria_id);

      const coincideBusqueda =
        terminoBusqueda === '' ||
        producto.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(terminoBusqueda.toLowerCase());

      const coincideBanner =
        bannerFiltroActivo === null ||
        (bannerProductos[bannerFiltroActivo] || []).includes(producto.id);

      return coincideMacro && coincideBusqueda && coincideBanner;
    });
  }, [macroActiva, terminoBusqueda, productos, bannerFiltroActivo, bannerProductos, categorias]);

  const productosEspecialidades = useMemo(() =>
    productos.filter(p =>
      p.esta_disponible &&
      (p.tiene_variantes || p.acepta_toppings)
    ),
    [productos]
  );


  const categoriasOrdenadas = useMemo(() =>
    [...categorias].sort((a, b) => {
      const ia = ORDEN_CATEGORIAS.indexOf(a.nombre);
      const ib = ORDEN_CATEGORIAS.indexOf(b.nombre);
      const posA = ia === -1 ? 999 : ia;
      const posB = ib === -1 ? 999 : ib;
      return posA - posB;
    }),
    [categorias]
  );

  const handleNavegar = (nuevaVista: Vista) => {
    setVista(nuevaVista);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAbrirConfigurador = (producto: Producto) => {
    setProductoConfigurador(producto);
  };

  const handleConfirmarConfiguracion = (item: CarritoItem) => {
    agregarConfigurable(item);
    setProductoConfigurador(null);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-cafe-300 border-t-cafe-600 rounded-full animate-spin" />
        <p className="text-cafe-400 text-sm">Cargando menú...</p>
      </div>
    );
  }

  const renderProductoCard = (producto: Producto) => (
    <ProductoCard
      key={producto.id}
      producto={producto}
      onVerDetalle={setProductoDetalle}
      grupo_variantes={getVariantesDeProducto(producto.id)}
      toppings_disponibles={getToppingsDeProducto(producto.id)}
      onAbrirConfigurador={handleAbrirConfigurador}
    />
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-lg mx-auto px-4">
        {/* HEADER SIEMPRE VISIBLE */}
        <header className={`flex flex-col gap-2 relative bg-[var(--color-primario)] px-4 pt-3 shadow-xl -mx-4 sm:mx-0 sm:rounded-b-3xl sm:rounded-none rounded-b-3xl mb-5 ${vista === 'home' ? 'pb-4' : 'pb-3'}`}>
          <div className="flex items-center justify-between z-10 relative w-full">
            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight tracking-wide" style={{ color: '#ffff', fontFamily: "'Georgia', 'Palatino Linotype', serif" }}>{nombreNegocio}</h1>
            <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 bg-white rounded-full shadow-sm overflow-hidden flex items-center justify-center">
              <Image
                src="/images/cafecito-header.png"
                alt="Nube Alta Cafe"
                fill
                className="object-contain p-1.5"
              />
            </div>
          </div>
          {vista === 'home' && (
            <div className="w-full z-10 relative">
              <BarraBusqueda onBuscar={setTerminoBusqueda} />
            </div>
          )}
        </header>

        {vista === 'home' && (
          <div className="space-y-5 animate-fade-in">

            <BannerHero
              banners={banners}
              onBannerClick={(bannerId: string) => {
                const vinculados = bannerProductos[bannerId];
                if (vinculados && vinculados.length > 0) {
                  setBannerFiltroActivo(bannerId);
                  setMacroActiva(null);
                  const categoriesSection = document.getElementById('categorias-section');
                  if (categoriesSection) categoriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            />

            <div id="categorias-section">
              <h2 className="text-lg font-bold text-cafe-900 mb-3">Categorías</h2>
            </div>

            <div
              className="sticky top-0 z-30 -mx-4 px-4 py-0.5 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300"
            >
              <CategoriasNav categorias={categorias} macroActiva={macroActiva} onSeleccionar={(macro) => {
                setMacroActiva(macro);
                setBannerFiltroActivo(null);
              }} />
            </div>

            <section>
              {bannerFiltroActivo && (
                <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl mb-4 border border-amber-200 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-800 text-sm font-semibold">Mostrando promoción</span>
                  </div>
                  <button onClick={() => setBannerFiltroActivo(null)} className="text-amber-700 hover:text-amber-900 font-medium text-sm px-3 py-1 bg-amber-100 rounded-lg">Quitar</button>
                </div>
              )}

              {(() => {
                const mostrarAgrupadoPorCategoria = macroActiva === null && bannerFiltroActivo === null && !terminoBusqueda;

                if (mostrarAgrupadoPorCategoria) {
                  return (
                    <>
                      {/* BLOQUE A — Especialidades */}
                      {productosEspecialidades.length > 0 && (
                        <section className="mb-8">
                          <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-cafe-900">
                              Especialidades
                            </h2>
                            <span className="text-xs text-cafe-400 bg-cafe-50 px-2 py-1 rounded-full font-medium">
                              Arma tu pedido
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {productosEspecialidades.map((producto) => (
                              <ProductoCard
                                key={producto.id}
                                producto={producto}
                                onVerDetalle={setProductoDetalle}
                                onAbrirConfigurador={handleAbrirConfigurador}
                                grupo_variantes={getVariantesDeProducto(producto.id)}
                                toppings_disponibles={getToppingsDeProducto(producto.id)}
                              />
                            ))}
                          </div>
                        </section>
                      )}

                      {/* BLOQUE B — Simples por afinidad */}
                      {categoriasOrdenadas.map((categoria) => {
                        const productosSimplesCat = productos.filter(p =>
                          p.categoria_id === categoria.id &&
                          p.esta_disponible &&
                          !p.tiene_variantes &&
                          !p.acepta_toppings
                        );
                        if (productosSimplesCat.length === 0) return null;

                        const mostrarVerMas = false;
                        const productosAMostrar = productosSimplesCat;

                        return (
                          <section key={categoria.id} className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <h2 className="text-lg font-bold text-cafe-900">
                                {categoria.nombre}
                              </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                              {productosAMostrar.map((producto) => (
                                <ProductoCard
                                  key={producto.id}
                                  producto={producto}
                                  onVerDetalle={setProductoDetalle}
                                  onAbrirConfigurador={handleAbrirConfigurador}
                                  grupo_variantes={null}
                                  toppings_disponibles={[]}
                                />
                              ))}
                            </div>
                          </section>
                        );
                      })}
                    </>
                  );
                }

                // Vista con macro activa, banner, o búsqueda
                const especialidadesFiltradas = macroActiva !== null
                  ? productosFiltrados.filter(p => p.esta_disponible && (p.tiene_variantes || p.acepta_toppings))
                  : [];
                const simplesFiltrados = macroActiva !== null
                  ? productosFiltrados.filter(p => p.esta_disponible && !p.tiene_variantes && !p.acepta_toppings)
                  : productosFiltrados;

                return (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-bold text-cafe-900">
                        {bannerFiltroActivo
                          ? 'Ofertas del banner'
                          : macroActiva
                            ? MACRO_CATEGORIAS_CONFIG.find(m => m.id === macroActiva)?.nombre ?? 'Productos'
                            : 'Todo el Menú'}
                      </h2>
                      <span className="text-xs text-cafe-400">{productosFiltrados.length} productos</span>
                    </div>

                    {productosFiltrados.length === 0 ? (
                      <div className="text-center py-12"><p className="text-cafe-400 text-sm">No se encontraron productos</p></div>
                    ) : (
                      <>
                        {/* Especialidades de la macro activa */}
                        {especialidadesFiltradas.length > 0 && (
                          <section className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-base font-bold text-cafe-900">Especialidades</h3>
                              <span className="text-xs text-cafe-400 bg-cafe-50 px-2 py-1 rounded-full font-medium">Arma tu pedido</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                              {especialidadesFiltradas.map(renderProductoCard)}
                            </div>
                          </section>
                        )}

                        {/* Simples en grid plano */}
                        {simplesFiltrados.length > 0 && (
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {simplesFiltrados.map(renderProductoCard)}
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })()}
            </section>

            {/* Footer del menú con link a privacidad */}
            <div className="text-center py-6 border-t border-gray-100 mt-4">
              <p className="text-xs text-gray-400 mb-2">
                © {new Date().getFullYear()} Cafecito · Tuxpanguillo, Veracruz
              </p>
              <a
                href="/privacidad"
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
              >
                Aviso de Privacidad
              </a>
            </div>
          </div>
        )}

        {vista === 'carrito' && (
          <CarritoVista onIrCheckout={() => handleNavegar('checkout')} onSeguirComprando={() => handleNavegar('home')} />
        )}

        {vista === 'checkout' && (
          <CheckoutVista onVolver={() => handleNavegar('carrito')} />
        )}
      </div>

      <BarraNavegacion vistaActual={vista} onNavegar={handleNavegar} />

      {productoDetalle && (
        <ProductoDetalle producto={productoDetalle} onCerrar={() => setProductoDetalle(null)} />
      )}

      {productoConfigurador && (
        <ConfiguradorProducto
          producto={productoConfigurador}
          grupo_variantes={getVariantesDeProducto(productoConfigurador.id)}
          toppings_disponibles={getToppingsDeProducto(productoConfigurador.id)}
          ingredientes_disponibles={getIngredientesDeProducto(productoConfigurador.id)}
          onCerrar={() => setProductoConfigurador(null)}
          onConfirmar={handleConfirmarConfiguracion}
        />
      )}
    </div>
  );
}
