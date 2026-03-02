import React from 'react';

export const metadata = {
    title: 'Aviso de Privacidad | Cafecito',
    description: 'Aviso de Privacidad y Términos de Servicio de Cafecito.',
};

export default function PrivacidadPage() {
    const fechaActual = '1 de marzo de 2026';
    const anioActual = new Date().getFullYear();

    const secciones = [
        {
            titulo: 'Identidad del Responsable',
            contenido: (
                <p>
                    <strong>Nombre del negocio:</strong> Cafecito
                    <br />
                    <strong>Ubicación:</strong> Tuxpanguillo, Ixtaczoquitlan, Veracruz, México
                    <br />
                    <strong>Contacto:</strong> vía WhatsApp (el número configurado en el negocio)
                    <br />
                    <strong>Fecha de última actualización:</strong> {fechaActual}
                </p>
            ),
        },
        {
            titulo: 'Datos Personales que Recopilamos',
            contenido: (
                <>
                    <ul className="list-disc pl-5 space-y-1 mb-2">
                        <li>Nombre completo</li>
                        <li>Dirección de entrega</li>
                        <li>Notas del pedido (opcional)</li>
                    </ul>
                    <p>
                        Aclarar que NO recopilamos: correo electrónico, teléfono propio, contraseñas, datos de tarjeta,
                        datos biométricos ni información sensible.
                    </p>
                </>
            ),
        },
        {
            titulo: 'Finalidad del Tratamiento',
            contenido: (
                <>
                    <p className="mb-2">Los datos se usan ÚNICAMENTE para:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Procesar y entregar el pedido realizado</li>
                        <li>Comunicación del pedido vía WhatsApp</li>
                        <li>No se usan para publicidad, perfilamiento ni se venden a terceros</li>
                    </ul>
                </>
            ),
        },
        {
            titulo: 'Transferencia de Datos',
            contenido: (
                <p>
                    Los datos son enviados a WhatsApp (Meta Platforms) al momento de enviar el pedido. El usuario inicia
                    voluntariamente esta transmisión al tocar el botón. Supabase (infraestructura) puede tener acceso técnico a
                    los datos bajo sus propias políticas de privacidad.
                </p>
            ),
        },
        {
            titulo: 'Almacenamiento y Retención',
            contenido: (
                <p>
                    El carrito se guarda en localStorage del dispositivo del usuario y se limpia al finalizar el pedido. No
                    almacenamos historial de pedidos en nuestros servidores de forma identificable.
                </p>
            ),
        },
        {
            titulo: 'Imágenes de Productos',
            contenido: (
                <>
                    <p className="mb-2">Las fotografías e imágenes de los productos mostradas en este menú son de carácter ilustrativo. Pueden ser:</p>
                    <ul className="list-disc pl-5 space-y-1 mb-2">
                        <li>Fotografías reales del producto</li>
                        <li>Imágenes editadas digitalmente</li>
                        <li>Imágenes generadas o asistidas con inteligencia artificial</li>
                    </ul>
                    <p>
                        La apariencia real del producto puede diferir de las imágenes mostradas. Cafecito no garantiza que el
                        producto final sea idéntico a la imagen presentada. Esto es una práctica estándar en la industria restaurantera
                        conforme a la LFPC.
                    </p>
                </>
            ),
        },
        {
            titulo: 'Precios y Disponibilidad',
            contenido: (
                <p>
                    Los precios mostrados son en pesos mexicanos (MXN) e incluyen impuestos aplicables. Cafecito se reserva
                    el derecho de modificar precios y disponibilidad sin previo aviso. El pedido se confirma únicamente cuando
                    el negocio lo acepta vía WhatsApp.
                </p>
            ),
        },
        {
            titulo: 'Derechos ARCO',
            contenido: (
                <p>
                    Conforme a la LFPDPPP, el usuario tiene derecho a: Acceso, Rectificación, Cancelación y Oposición (ARCO)
                    de sus datos personales. Para ejercerlos contactar al negocio vía WhatsApp.
                </p>
            ),
        },
        {
            titulo: 'Cookies y Almacenamiento Local',
            contenido: (
                <p>
                    Esta aplicación usa localStorage del navegador únicamente para mantener el carrito de compras durante la
                    sesión. No usamos cookies de rastreo, publicidad ni análisis de comportamiento de terceros.
                </p>
            ),
        },
        {
            titulo: 'Cambios a este Aviso',
            contenido: (
                <p>
                    Cafecito se reserva el derecho de actualizar este aviso de privacidad. La fecha de última actualización
                    aparece al inicio del documento.
                </p>
            ),
        },
        {
            titulo: 'Legislación Aplicable',
            contenido: (
                <p>
                    Este aviso se rige por las leyes de los Estados Unidos Mexicanos, en particular la LFPDPPP, la LFPC y el
                    Código de Comercio. Para cualquier controversia serán competentes los tribunales de Córdoba, Veracruz, México.
                </p>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-white pb-10">
            {/* Header simple con botón volver */}
            <div className="bg-[#4A2C2A] px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <a
                        href="/"
                        className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                        <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </a>
                    <h1 className="text-white font-semibold text-lg">Aviso de Privacidad</h1>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
                {/* Fecha actualización */}
                <p className="text-xs text-gray-400">Última actualización: {fechaActual}</p>

                {/* Intro */}
                <p className="text-gray-600 text-sm leading-relaxed">
                    En Cafecito valoramos su privacidad. Este aviso detalla cómo manejamos la información que comparte
                    con nosotros al usar nuestro menú digital.
                </p>

                {/* Secciones */}
                {secciones.map((seccion, index) => (
                    <section key={seccion.titulo}>
                        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#4A2C2A]/10 text-[#4A2C2A] text-xs flex items-center justify-center font-bold flex-shrink-0">
                                {index + 1}
                            </span>
                            {seccion.titulo}
                        </h2>
                        <div className="text-sm text-gray-600 leading-relaxed space-y-2 pl-8">
                            {seccion.contenido}
                        </div>
                    </section>
                ))}

                {/* Footer de la página */}
                <div className="border-t border-gray-100 pt-6 text-center">
                    <p className="text-xs text-gray-400">
                        © {anioActual} Cafecito — Tuxpanguillo, Ixtaczoquitlan, Veracruz
                    </p>
                    <a href="/" className="inline-block mt-3 text-sm font-medium text-[#4A2C2A] hover:underline">
                        ← Volver al menú
                    </a>
                </div>
            </div>
        </div>
    );
}
