// Tipos del dominio Nube Alta Cafe

export type MacroCategoria = 'dulces' | 'bebidas' | 'salados' | 'combos';

export interface MacroCategoriaConfig {
    id: MacroCategoria;
    nombre: string;
    icono: string;
}

export const MACRO_CATEGORIAS_CONFIG: MacroCategoriaConfig[] = [
    { id: 'dulces', nombre: 'Dulces', icono: '🍰' },
    { id: 'bebidas', nombre: 'Bebidas', icono: '🥤' },
    { id: 'salados', nombre: 'Salados', icono: '🍔' },
    { id: 'combos', nombre: 'Combos', icono: '🎁' },
];

export interface Categoria {
    id: string;
    nombre: string;
    icono?: string | null;
    orden: number;
    creado_en: string;
    macro_categoria: MacroCategoria;
}

export interface Producto {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number | null;
    imagen_url: string;
    categoria_id: string;
    esta_disponible: boolean;
    creado_en: string;
    actualizado_en: string;
    tiene_variantes: boolean;
    acepta_toppings: boolean;
    precio_topping_extra: number;
    toppings_gratis: number;
    tiene_ingredientes: boolean;
}

export interface GrupoVariantes {
    id: string;
    producto_id: string;
    nombre: string;
}

export interface Variante {
    id: string;
    grupo_id: string;
    nombre: string;
    precio: number;
    disponible: boolean;
    orden: number;
}

export interface Topping {
    id: string;
    nombre: string;
    activo: boolean;
}

export interface Ingrediente {
    id: string;
    producto_id: string;
    nombre: string;
    orden: number;
}

export interface Banner {
    id: string;
    titulo: string;
    descripcion: string;
    imagen_url: string;
    imagen_fondo_completo_url?: string | null;
    fondo_seleccionado?: 'fondo1' | 'fondo2' | null;
    activo: boolean;
    orden: number;
    creado_en: string;
}

export interface Promocion {
    id: string;
    titulo: string;
    descripcion: string;
    imagen_url: string;
    activo: boolean;
    fecha_inicio: string;
    fecha_fin: string;
}

export interface Configuracion {
    id: string;
    nombre_negocio: string;
    telefono_whatsapp: string;
    logo_url: string;
    color_primario: string;
}

export interface CarritoItem {
    producto: Producto;
    cantidad: number;
    variante_elegida?: Variante | null;
    toppings_elegidos?: Topping[];
    ingredientes_removidos?: string[];
    precio_final: number;
}

export interface DatosPedido {
    nombre_cliente: string;
    direccion: string;
    forma_pago: 'efectivo' | 'transferencia';
    notas?: string;
}
