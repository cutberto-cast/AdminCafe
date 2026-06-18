-- Restaura el menú demo a un snapshot conocido. Pensado para un panel
-- admin público de portafolio: cualquiera puede editar/borrar datos,
-- y este botón regresa todo al estado de referencia.
CREATE OR REPLACE FUNCTION "public"."reset_demo_data"() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM "public"."productos" WHERE true;
    DELETE FROM "public"."banners" WHERE true;
    DELETE FROM "public"."categorias" WHERE true;
    DELETE FROM "public"."toppings" WHERE true;

    INSERT INTO "public"."categorias" ("id", "nombre", "icono", "orden", "creado_en", "macro_categoria", "cafeteria_id") VALUES
        ('354e6756-97c5-4e9d-b03b-f33215d818f9', 'Crepas Dulces', '🫓', 1, '2026-02-26 03:53:13.493537+00', 'dulces', '00000000-0000-0000-0000-000000000001'),
        ('a9c033be-9e13-417c-9130-c7db112c67f2', 'Crepas Saladas', '🫓', 2, '2026-02-26 03:53:13.493537+00', 'salados', '00000000-0000-0000-0000-000000000001'),
        ('825220e5-218f-4aa6-9d1d-ad88bf37e44c', 'Wafles', '🧇', 3, '2026-02-26 03:53:13.493537+00', 'dulces', '00000000-0000-0000-0000-000000000001'),
        ('5c7859e9-113b-485e-b5db-a64db683b422', 'Marquesitas', '🌯', 4, '2026-02-26 03:53:13.493537+00', 'dulces', '00000000-0000-0000-0000-000000000001'),
        ('5a68590d-ab57-47bd-94f6-da3bd2c82c76', 'Fresas con Crema', '🍧', 5, '2026-02-26 03:53:13.493537+00', 'dulces', '00000000-0000-0000-0000-000000000001'),
        ('f532d2e3-2dc0-4c39-b974-bcd5f0653854', 'Bar', '🥃', 6, '2026-02-26 03:53:13.493537+00', 'bebidas', '00000000-0000-0000-0000-000000000001'),
        ('a58287e8-d523-4cb1-b161-1d566be3fcdf', 'Salado', '🍔', 7, '2026-02-26 03:53:13.493537+00', 'salados', '00000000-0000-0000-0000-000000000001'),
        ('6d7e70b9-b699-414b-814a-3555b39eba5c', 'Bebidas', '🧋', 8, '2026-02-26 03:53:13.493537+00', 'bebidas', '00000000-0000-0000-0000-000000000001'),
        ('da869684-83be-4a23-a41a-23f3bfd15363', 'Bebidas Calientes', '☕️', 9, '2026-02-26 03:53:13.493537+00', 'bebidas', '00000000-0000-0000-0000-000000000001'),
        ('3878aaa0-31c2-46c1-a444-c429592571a2', 'Bubble Tea', '🧋', 10, '2026-02-26 03:53:13.493537+00', 'dulces', '00000000-0000-0000-0000-000000000001'),
        ('d8f1db4c-3438-4621-9066-8e9d9141c9de', 'Malteadas', '🥛', 12, '2026-02-26 03:53:13.493537+00', 'dulces', '00000000-0000-0000-0000-000000000001'),
        ('0ba5fe1d-a8af-43dd-971f-8a3c75dd64bb', 'Sodas Italianas', '🥤', 13, '2026-02-26 03:53:13.493537+00', 'dulces', '00000000-0000-0000-0000-000000000001'),
        ('413a33d6-f6f3-4be1-ae70-3cb112c646d5', 'Alitas', '🍗', 14, '2026-02-26 03:53:13.493537+00', 'salados', '00000000-0000-0000-0000-000000000001'),
        ('d5356b64-d36e-4502-bfdb-337ff847327a', 'Combos', '🍱', 15, '2026-02-26 19:20:43.819491+00', 'combos', '00000000-0000-0000-0000-000000000001'),
        ('46854cb7-552e-426f-9147-2f9273691749', 'Frappés ', '🥤', 11, '2026-02-26 03:53:13.493537+00', 'bebidas', '00000000-0000-0000-0000-000000000001');

    INSERT INTO "public"."productos" ("id", "nombre", "descripcion", "precio", "imagen_url", "categoria_id", "esta_disponible", "creado_en", "actualizado_en", "tiene_variantes", "acepta_toppings", "precio_topping_extra", "toppings_gratis", "tiene_ingredientes", "cafeteria_id") VALUES
        ('837a0093-db7e-4452-9ce5-58c80561dbd3', 'Hamburguesa de Pollo', 'Hamburguesa de pechuga de pollo', 45.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/o1gv6kjh39e_1772384147418.jpeg', 'a58287e8-d523-4cb1-b161-1d566be3fcdf', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('a03ec2de-d879-4b13-b8f0-9bb53db4d3b3', 'Sex On The Beach', 'Cóctel frutal', 45.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/yzkcdecbdyq_1772337516357.jpeg', 'f532d2e3-2dc0-4c39-b974-bcd5f0653854', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('8d46388b-bc46-4e35-abe6-181762225e59', 'Cappuccino', 'Espresso con espuma de leche', 35.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/h4u3h1h0ii6_1772381848358.jpeg', 'da869684-83be-4a23-a41a-23f3bfd15363', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('2aa417ff-b6a0-49d2-bf86-98893135a14c', 'Margarita', 'Cóctel clásico', 50.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/3y9sgdqzdrn_1772339513285.jpeg', 'f532d2e3-2dc0-4c39-b974-bcd5f0653854', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('86653429-8cf8-4ab1-ab2d-b1a4e1009d82', 'Frappé Zarzamora', 'Frappuccino zarzamora', 50.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/elqmdnabo3j_1772401463762.jpeg', '46854cb7-552e-426f-9147-2f9273691749', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('e55aa5cd-bed1-4b84-a6b9-cbe4388ebc46', 'Piña Colada', 'Tropical y cremosa', 80.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/uspvmgvoknr_1772337950400.jpeg', 'f532d2e3-2dc0-4c39-b974-bcd5f0653854', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('7b9857f7-cbfb-48d3-87cf-c0e6a3755df6', 'Bubble Tea Taro', 'Bubble tea sabor taro', 60.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/x3wrds68scn_1772386105215.jpeg', '3878aaa0-31c2-46c1-a444-c429592571a2', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('223feefb-6dd3-452a-91cc-d75ca1b6436c', 'Bubble Tea Oreo', 'Bubble tea sabor oreo', 60.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/7juf0lla516_1772387246655.jpeg', '3878aaa0-31c2-46c1-a444-c429592571a2', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('dc783a4e-2689-4021-aebf-d5fbdf825703', 'Crepa Dulce', 'Arma tu crepa con tus sabores favoritos', 50.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/q0ec8c4eca_1772336512716.jpeg', '354e6756-97c5-4e9d-b03b-f33215d818f9', true, '2026-02-26 03:53:13.493537+00', now(), false, true, 10.00, 2, false, '00000000-0000-0000-0000-000000000001'),
        ('c190f273-0365-49e9-9da8-c70641ac4e3c', 'Iced Latte Coffee Mazapán', 'Café latte frío con mazapán', 50.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/2zi0h8if3ft_1772383179264.jpeg', '6d7e70b9-b699-414b-814a-3555b39eba5c', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('dd0dee99-5b29-47ab-baf4-fb7d79f589e6', 'Crepa Salada', 'Arma tu crepa salada con tus ingredientes favoritos', 50.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/j2z9rw05tnd_1772382841352.jpeg', 'a9c033be-9e13-417c-9130-c7db112c67f2', true, '2026-02-26 03:53:13.493537+00', now(), false, true, 10.00, 2, false, '00000000-0000-0000-0000-000000000001'),
        ('f5249fd1-c1c3-4c13-b160-712c7bb470bc', 'Hamburguesa Arrachera', 'Hamburguesa con carne arrachera', 60.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/zfjbenpnqeh_1772384216332.jpeg', 'a58287e8-d523-4cb1-b161-1d566be3fcdf', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('1083a1b1-4f8c-420d-9fb8-e463106c4c93', 'Espresso', 'Espresso puro concentrado', 22.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/n2c9ir1y7y_1772382429827.jpeg', 'da869684-83be-4a23-a41a-23f3bfd15363', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('3bb5df0b-522b-489a-86ec-85e0912707e5', 'Americano', 'Espresso con agua caliente', 22.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/82ku7jwu7rg_1772086633035.jpg', 'da869684-83be-4a23-a41a-23f3bfd15363', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('7c942d2a-4a41-4524-999b-6b0a5d4369d6', 'Hamburguesa + Papas', 'Hamburguesa acompañada de papas', 80.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/6z4lxokzrc7_1772383372382.jpeg', 'a58287e8-d523-4cb1-b161-1d566be3fcdf', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('75c12a74-efa3-4c74-b3c9-45ea024b7d38', 'Latte', 'Espresso con leche vaporizada', 40.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/ljhhwespfc_1772381189260.jpeg', 'da869684-83be-4a23-a41a-23f3bfd15363', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('13b682fe-c853-44ee-9394-d8d185d2b42d', 'Fresas con Crema', 'Fresas frescas con crema, personaliza con toppings', 50.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/yslqq1jjrs8_1772408739538.jpeg', '5a68590d-ab57-47bd-94f6-da3bd2c82c76', true, '2026-02-26 03:53:13.493537+00', now(), false, true, 10.00, 1, false, '00000000-0000-0000-0000-000000000001'),
        ('c86dd5da-8c5c-4304-a30d-95e5b8e59956', 'Nuggets de Pollo', 'Nuggets crujientes de pollo', 40.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/cd2kj0c2qra_1772087260956.jpg', 'a58287e8-d523-4cb1-b161-1d566be3fcdf', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('e0ca6c1c-d290-4265-a382-c3883696a3f8', 'Papas a la Francesa', 'Papas fritas crujientes', 40.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/ziubf50wwvh_1772384179475.jpeg', 'a58287e8-d523-4cb1-b161-1d566be3fcdf', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, true, '00000000-0000-0000-0000-000000000001'),
        ('619ed0f0-c58d-49bf-8bb2-d400a807348e', 'Mojito Frutos Rojos', 'Mojito con frutos rojos', 40.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/a0808orbzk_1772337467173.jpeg', 'f532d2e3-2dc0-4c39-b974-bcd5f0653854', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('f1b32e64-b750-43d6-b530-2b455790f773', 'Mojito Clásico', 'Mojito fresco y refrescante', 35.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/5ta9iyfrdg_1772337761576.jpeg', 'f532d2e3-2dc0-4c39-b974-bcd5f0653854', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('f85375f8-5cd4-4ae4-88a7-163b11acb2f1', 'Labios Rojos', 'Cóctel especial de la casa', 75.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/b7a14qd16j_1772337772267.jpeg', 'f532d2e3-2dc0-4c39-b974-bcd5f0653854', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('03cbe688-8b50-4789-8f2d-1873b1dde84e', 'Iced Latte Coffee Vainilla', 'Café latte frío con vainilla', 50.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/et9t2g39cn8_1772381373549.jpeg', '6d7e70b9-b699-414b-814a-3555b39eba5c', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('0519ef41-ef93-42a2-86c0-38a1aa7b7776', 'Marquesita', 'Marquesita crujiente con un ingrediente incluido', 45.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/dnirrdspie_1772086442102.jpg', '5c7859e9-113b-485e-b5db-a64db683b422', true, '2026-02-26 03:53:13.493537+00', now(), false, true, 10.00, 1, false, '00000000-0000-0000-0000-000000000001'),
        ('4aeaeabc-cab1-49a9-afb6-df8c81e6f201', 'Waffle', 'Waffle con sabores incluidos, toppings extra disponibles', 45.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/4buvdxabyv2_1772336590535.jpeg', '825220e5-218f-4aa6-9d1d-ad88bf37e44c', true, '2026-02-26 03:53:13.493537+00', now(), false, true, 10.00, 2, false, '00000000-0000-0000-0000-000000000001'),
        ('d7ba175b-80f3-400c-8e2d-ff2eddbf01ab', 'Frappé Magnum', 'Frappuccino magnum', 90.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/yauffz12ts_1772380354289.jpeg', '46854cb7-552e-426f-9147-2f9273691749', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('829a971c-46aa-4e6e-9d6d-7ff18a217b60', 'Bubble Tea Ferrero', 'Bubble tea sabor ferrero', 80.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/dfy55x0h9lr_1772400908462.jpeg', '3878aaa0-31c2-46c1-a444-c429592571a2', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('85bf2b7a-dba7-4b90-be0e-d60688475f02', 'Frappé Ferrero', 'Frappuccino ferrero', 70.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/zfzf57t9ebi_1772401487605.jpeg', '46854cb7-552e-426f-9147-2f9273691749', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('93953ed3-61ad-4530-a5c0-0b08f7310937', 'Soda Manzana Verde', 'Soda italiana de manzana verde', 50.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/zdrxsc3m9n_1772339055376.jpeg', '0ba5fe1d-a8af-43dd-971f-8a3c75dd64bb', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('2735b127-fd84-448f-bb37-010d45d4e07d', 'Malteada de Fresa', 'Malteada cremosa de fresa', 50.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/v1kbos1diwt_1772381472080.jpeg', 'd8f1db4c-3438-4621-9066-8e9d9141c9de', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('8aee57f1-db49-48b2-93fe-744ebb22637a', 'Matcha', 'Frappuccino matcha', 50.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/wmhi47otge_1772401476274.jpeg', '3878aaa0-31c2-46c1-a444-c429592571a2', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('aa4faba9-a62e-49cd-89b9-329690987b14', 'Alitas Piña Habanero', 'Alitas con salsa piña habanero', 80.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/n82i3km07zp_1772379271334.png', '413a33d6-f6f3-4be1-ae70-3cb112c646d5', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('00d905a1-e07b-4b70-8996-d9d55bbb83be', 'PaqueteAnimes', '1 orden de alitas (sabor a elegir)
1 orden de papas
1 orden de nuggets', 140.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/wkdi3hunf3i_1772407522191.jpeg', 'd5356b64-d36e-4502-bfdb-337ff847327a', true, '2026-03-01 23:25:25.547558+00', now(), true, false, 0.00, 0, true, '00000000-0000-0000-0000-000000000001'),
        ('8315f6c5-3a4d-43fd-9aaa-e4f565629b53', 'Alitas Mango Habanero', 'Alitas con salsa mango habanero', 80.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/29rtc84ltj7_1772379232067.jpg', '413a33d6-f6f3-4be1-ae70-3cb112c646d5', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('ba9f310e-6106-42d8-a4f3-1b4cdfffd936', 'Alitas Búfalo', 'Alitas con salsa búfalo', 80.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/inm4mrzfzom_1772379244450.jpg', '413a33d6-f6f3-4be1-ae70-3cb112c646d5', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('564651b8-8e09-4e5f-afef-07dc1887f8b6', 'Soda Fresa', 'Soda italiana de fresa', 50.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/2qp2mkjw67v_1772339035108.jpeg', '0ba5fe1d-a8af-43dd-971f-8a3c75dd64bb', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('cc5dca3e-8c40-4c33-9cc8-16acdace0900', 'Soda Blue Berry', 'Soda italiana de blue berry', 50.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/r8muse62dvg_1772339065825.jpeg', '0ba5fe1d-a8af-43dd-971f-8a3c75dd64bb', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('8a4da722-51bc-465d-ae5c-ac16ca973b22', 'Mazapán Frío', 'Frappuccino mazapán', 50.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/msu5vc2g57_1772383213667.jpeg', '46854cb7-552e-426f-9147-2f9273691749', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('cbb2477e-9383-4827-861b-77e8842147fb', 'Frappé Kit Kat', 'Frappuccino kit kat', 70.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/4uf014gbeff_1772381752415.jpeg', '46854cb7-552e-426f-9147-2f9273691749', true, '2026-02-26 03:53:13.493537+00', now(), false, false, 0.00, 0, false, '00000000-0000-0000-0000-000000000001'),
        ('a5e95c36-c3e8-4496-84cd-7c450881d61e', 'PaQueMeLlene', '1 hamburguesa
Alitas
Papás
Y Nuggets', 100.00, 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/productos/hstgx7nr2a_1772407610419.jpeg', 'd5356b64-d36e-4502-bfdb-337ff847327a', true, '2026-03-01 23:27:11.553797+00', now(), true, false, 0.00, 0, true, '00000000-0000-0000-0000-000000000001');

    INSERT INTO "public"."banners" ("id", "titulo", "descripcion", "imagen_url", "activo", "orden", "creado_en", "imagen_fondo_completo_url", "fondo_seleccionado", "cafeteria_id") VALUES
        ('f73bdb2f-62b2-4609-aa41-213ce06098e9', 'Paquete Promo', 'a  tan solo 100 mxm', 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/banners/ix9fikj2jvr_1772088543560.png', false, 3, '2026-02-26 06:49:34.065766+00', NULL, 'fondo2', '00000000-0000-0000-0000-000000000001'),
        ('f148293b-026e-452d-97b0-8fbdb605f4a3', '', '', '', true, 3, '2026-03-01 23:17:59.666898+00', 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/banners/full_13bx13qkaes_1772407267709.png', NULL, '00000000-0000-0000-0000-000000000001'),
        ('2feadd36-ec3f-4e13-bd1e-6990d39b0531', '', '', '', true, 4, '2026-03-01 23:22:46.725183+00', 'https://vcarfmhherrkevzziqdq.supabase.co/storage/v1/object/public/imagenes/banners/full_c6lfjrq5p1s_1772407363730.png', NULL, '00000000-0000-0000-0000-000000000001');

    INSERT INTO "public"."banner_productos" ("id", "banner_id", "producto_id", "cafeteria_id") VALUES
        ('c949b1df-33f9-4711-86be-98aa02aac192', 'f73bdb2f-62b2-4609-aa41-213ce06098e9', '7c942d2a-4a41-4524-999b-6b0a5d4369d6', '00000000-0000-0000-0000-000000000001'),
        ('493351c8-a718-4428-95f7-b34bb1023975', 'f148293b-026e-452d-97b0-8fbdb605f4a3', 'a5e95c36-c3e8-4496-84cd-7c450881d61e', '00000000-0000-0000-0000-000000000001'),
        ('f4cad224-e80c-4ee5-943e-14583603ec54', '2feadd36-ec3f-4e13-bd1e-6990d39b0531', '00d905a1-e07b-4b70-8996-d9d55bbb83be', '00000000-0000-0000-0000-000000000001');

    INSERT INTO "public"."grupos_variantes" ("id", "producto_id", "nombre", "creado_en", "cafeteria_id") VALUES
        ('b26c7a2a-4f5d-4720-9b52-b60f1f973c29', 'a5e95c36-c3e8-4496-84cd-7c450881d61e', 'Sabores de alitas', '2026-03-11 21:57:39.752545+00', '00000000-0000-0000-0000-000000000001'),
        ('f7b60b96-b93d-4fd6-8123-d6af966fed03', '00d905a1-e07b-4b70-8996-d9d55bbb83be', 'Sabor de alitas', '2026-03-30 01:29:39.201239+00', '00000000-0000-0000-0000-000000000001');

    INSERT INTO "public"."variantes" ("id", "grupo_id", "nombre", "precio", "disponible", "orden") VALUES
        ('87add288-fa30-44e3-b5f1-60f4e83bcf3d', 'b26c7a2a-4f5d-4720-9b52-b60f1f973c29', 'BBQ Clasica', NULL, true, 0),
        ('e80f3c7b-1d7c-4cf6-8ad1-477c0a8e1713', 'b26c7a2a-4f5d-4720-9b52-b60f1f973c29', 'BBQ Picante', NULL, true, 1),
        ('0434a40b-cfe6-44c3-abc2-48f26a036508', 'b26c7a2a-4f5d-4720-9b52-b60f1f973c29', 'Buffalo', NULL, true, 2),
        ('9f8b212d-378c-4d72-babf-593e38548844', 'b26c7a2a-4f5d-4720-9b52-b60f1f973c29', 'Piña Habanero', NULL, true, 3),
        ('28a5b216-a42c-47d6-aaf9-ee1bfaf9b527', 'b26c7a2a-4f5d-4720-9b52-b60f1f973c29', 'Piña Habanero', NULL, true, 4),
        ('ae01d70a-be3e-4b72-b01e-929467761880', 'f7b60b96-b93d-4fd6-8123-d6af966fed03', 'BBQ Clasica', NULL, true, 0),
        ('ef0b2314-bf2b-4571-a2bb-80308e82945d', 'f7b60b96-b93d-4fd6-8123-d6af966fed03', 'BBQ Picante', NULL, true, 1),
        ('7f241094-2b04-4ad0-97da-7d345d7e9a22', 'f7b60b96-b93d-4fd6-8123-d6af966fed03', 'Buffalo', NULL, true, 2),
        ('4a125aee-8e88-49c2-aab2-fa93ba9ee0f0', 'f7b60b96-b93d-4fd6-8123-d6af966fed03', 'Piña Habanero', NULL, true, 3),
        ('decf0914-6415-4d6e-a10d-deba759b3e04', 'f7b60b96-b93d-4fd6-8123-d6af966fed03', 'Mango Habanero', NULL, true, 4);

    INSERT INTO "public"."toppings" ("id", "nombre", "activo", "creado_en", "cafeteria_id") VALUES
        ('6b92d687-b3cd-48b4-b7cf-1e1923b2478a', 'Nutella', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('0950e4e0-34c1-4e1c-870e-d5779d16c063', 'Fresa', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('70038662-053d-44d2-b030-83b170d3b3f0', 'Plátano', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('3c7c7be9-13c7-4db9-a97c-a4dee68fdac6', 'Durazno', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('a760d861-4c47-4823-8593-b5741b71c615', 'Nuez', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('2e6ffb90-d5f9-450f-b34d-a56969797d12', 'Cajeta', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('89f48d4e-b2b5-4fe1-bcfe-669dd3f95ebc', 'Lechera', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('2cff7426-5ce4-4dc0-bfe9-f137acb453b5', 'Mermelada de Fresa', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('3df576df-81e9-4560-86e0-0ca66d49953e', 'Mermelada de Piña', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('eba1721b-e77f-4ae8-979a-2259302aea7a', 'Mermelada de Zarzamora', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('355fcdf3-d7d5-4765-863a-b1ddaa5f0f98', 'Oreo', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('ea2be585-d905-44a0-8671-4e7c18bbfef0', 'Crema de Cacahuate', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('4dc9ef39-c1c2-4725-b71d-83daaee88b97', 'Jarabe Hersheys', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('ab465b9f-652b-4871-9c29-29385bdac075', 'Bombón', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('f4353371-cca4-4a3f-aade-9e8095c96fe3', 'Manchego', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('4cf6c3ae-d658-4f9d-aea0-6f642dfb22aa', 'Jamón', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('3089db68-e3d8-48b7-99d6-a5dde074a586', 'Philadelphia', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('b4dd85dd-7c3a-4724-87f4-c10b20e57a9e', 'Bola', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('f931e406-e19c-477a-9243-92bf1bb5175a', 'Oreo Espolvoreado', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('7b1f08fa-950e-4207-abce-52f9a00fada6', 'Chispas de Chocolate', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('556ed417-5833-4fae-91f2-73ae1edd85f9', 'Lunetas', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('4de9fd5a-e144-47c0-aa82-fa55989b57b4', 'Granola', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('89a1e769-51c6-4179-b5d2-cb12c4d5d632', 'Coco Rayado', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('c42eef74-8ed0-41d7-80a3-7b68c49f1e7e', 'Crema Batida', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001'),
        ('a8e88901-3feb-4c54-81b6-e2fdf6d6b643', 'Almendra', true, '2026-02-26 03:53:13.493537+00', '00000000-0000-0000-0000-000000000001');

    INSERT INTO "public"."producto_toppings" ("id", "producto_id", "topping_id", "cafeteria_id") VALUES
        ('4538a76f-8aa0-4423-8035-bb2dc1fc10a8', 'dd0dee99-5b29-47ab-baf4-fb7d79f589e6', 'f4353371-cca4-4a3f-aade-9e8095c96fe3', '00000000-0000-0000-0000-000000000001'),
        ('562cb8c9-63bb-48e4-a6b7-0d22d7522678', 'dd0dee99-5b29-47ab-baf4-fb7d79f589e6', '4cf6c3ae-d658-4f9d-aea0-6f642dfb22aa', '00000000-0000-0000-0000-000000000001'),
        ('836bb4ca-fc1f-483a-9522-cbbee326338c', 'dd0dee99-5b29-47ab-baf4-fb7d79f589e6', '3089db68-e3d8-48b7-99d6-a5dde074a586', '00000000-0000-0000-0000-000000000001'),
        ('53612aab-991c-47a9-9269-a6c4f7e755d9', '13b682fe-c853-44ee-9394-d8d185d2b42d', 'a760d861-4c47-4823-8593-b5741b71c615', '00000000-0000-0000-0000-000000000001'),
        ('01a41d0a-acc3-4120-be92-9a96565eb21e', '13b682fe-c853-44ee-9394-d8d185d2b42d', 'f931e406-e19c-477a-9243-92bf1bb5175a', '00000000-0000-0000-0000-000000000001'),
        ('b626840c-d271-4040-8ae1-715826940612', '13b682fe-c853-44ee-9394-d8d185d2b42d', '7b1f08fa-950e-4207-abce-52f9a00fada6', '00000000-0000-0000-0000-000000000001'),
        ('31419de2-7b5f-4889-9b41-1912c184e2fe', '13b682fe-c853-44ee-9394-d8d185d2b42d', '556ed417-5833-4fae-91f2-73ae1edd85f9', '00000000-0000-0000-0000-000000000001'),
        ('728fc7d2-2f02-45ca-9c66-e5b91f2fe181', '13b682fe-c853-44ee-9394-d8d185d2b42d', '4de9fd5a-e144-47c0-aa82-fa55989b57b4', '00000000-0000-0000-0000-000000000001'),
        ('5dce3457-6548-46e9-aff0-403356ebc387', '13b682fe-c853-44ee-9394-d8d185d2b42d', '89a1e769-51c6-4179-b5d2-cb12c4d5d632', '00000000-0000-0000-0000-000000000001'),
        ('7abb1290-844e-4fe2-ad73-6050891c5fa8', '13b682fe-c853-44ee-9394-d8d185d2b42d', 'c42eef74-8ed0-41d7-80a3-7b68c49f1e7e', '00000000-0000-0000-0000-000000000001'),
        ('c86324c7-7033-4da4-9c20-9fa886fe5b47', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', '0950e4e0-34c1-4e1c-870e-d5779d16c063', '00000000-0000-0000-0000-000000000001'),
        ('39be9eca-b0f4-48dd-bbc3-9b804648dccb', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', '2cff7426-5ce4-4dc0-bfe9-f137acb453b5', '00000000-0000-0000-0000-000000000001'),
        ('380e5c11-6f9b-497a-8697-ba361c001eba', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', '2e6ffb90-d5f9-450f-b34d-a56969797d12', '00000000-0000-0000-0000-000000000001'),
        ('40c8e9e0-5fe4-4f52-9783-c34cbdbc72ba', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', '355fcdf3-d7d5-4765-863a-b1ddaa5f0f98', '00000000-0000-0000-0000-000000000001'),
        ('2cd4ee1c-a204-41c6-b24e-b50a5c2820c7', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', '3c7c7be9-13c7-4db9-a97c-a4dee68fdac6', '00000000-0000-0000-0000-000000000001'),
        ('eb4864ab-96ad-4278-88ef-976a9437e7f1', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', '3df576df-81e9-4560-86e0-0ca66d49953e', '00000000-0000-0000-0000-000000000001'),
        ('32cacabf-6056-4c11-94e0-8dcdc6045aa6', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', '4dc9ef39-c1c2-4725-b71d-83daaee88b97', '00000000-0000-0000-0000-000000000001'),
        ('5fc5e3c5-042c-446c-95a0-235b30ffe37a', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', '6b92d687-b3cd-48b4-b7cf-1e1923b2478a', '00000000-0000-0000-0000-000000000001'),
        ('c958bd42-2be1-4d32-8179-fefaf775aeac', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', '70038662-053d-44d2-b030-83b170d3b3f0', '00000000-0000-0000-0000-000000000001'),
        ('4ffba612-21dc-4998-9fad-ec43e5237a93', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', '89f48d4e-b2b5-4fe1-bcfe-669dd3f95ebc', '00000000-0000-0000-0000-000000000001'),
        ('c1baea17-07ae-4013-b80e-a3435ca6ef72', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', 'a760d861-4c47-4823-8593-b5741b71c615', '00000000-0000-0000-0000-000000000001'),
        ('c6877bc3-f3a8-4c40-8182-1ed97294213a', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', 'a8e88901-3feb-4c54-81b6-e2fdf6d6b643', '00000000-0000-0000-0000-000000000001'),
        ('376554cb-7636-49f7-8761-995fbf60b42d', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', 'ab465b9f-652b-4871-9c29-29385bdac075', '00000000-0000-0000-0000-000000000001'),
        ('50274ebc-acd7-4d2b-b2fb-ec37bae7d7b6', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', 'ea2be585-d905-44a0-8671-4e7c18bbfef0', '00000000-0000-0000-0000-000000000001'),
        ('7bead85e-9ac0-4caa-be26-4fa3192cd434', '4aeaeabc-cab1-49a9-afb6-df8c81e6f201', 'eba1721b-e77f-4ae8-979a-2259302aea7a', '00000000-0000-0000-0000-000000000001'),
        ('db14d262-a814-4215-bbfb-5b3a327c2089', '0519ef41-ef93-42a2-86c0-38a1aa7b7776', '6b92d687-b3cd-48b4-b7cf-1e1923b2478a', '00000000-0000-0000-0000-000000000001'),
        ('e77f43ed-4739-4e9a-be60-ec2b8c41e6d4', '0519ef41-ef93-42a2-86c0-38a1aa7b7776', '0950e4e0-34c1-4e1c-870e-d5779d16c063', '00000000-0000-0000-0000-000000000001'),
        ('95117887-b41c-4a1d-a2b2-83e1860784db', '0519ef41-ef93-42a2-86c0-38a1aa7b7776', '70038662-053d-44d2-b030-83b170d3b3f0', '00000000-0000-0000-0000-000000000001'),
        ('e34153b4-3f8d-49b4-adc4-dacafd5cec90', '0519ef41-ef93-42a2-86c0-38a1aa7b7776', 'a760d861-4c47-4823-8593-b5741b71c615', '00000000-0000-0000-0000-000000000001'),
        ('82dacf0a-3a17-4f62-b35d-009992b0ee9c', '0519ef41-ef93-42a2-86c0-38a1aa7b7776', '2e6ffb90-d5f9-450f-b34d-a56969797d12', '00000000-0000-0000-0000-000000000001'),
        ('9aca310a-e938-4b01-b4cf-546e7248efb2', '0519ef41-ef93-42a2-86c0-38a1aa7b7776', '89f48d4e-b2b5-4fe1-bcfe-669dd3f95ebc', '00000000-0000-0000-0000-000000000001'),
        ('ab314c93-f1f6-4c22-ac1f-bab2ad5e2e6e', '0519ef41-ef93-42a2-86c0-38a1aa7b7776', '2cff7426-5ce4-4dc0-bfe9-f137acb453b5', '00000000-0000-0000-0000-000000000001'),
        ('26ff5b31-8742-44f8-b590-dea611168df9', '0519ef41-ef93-42a2-86c0-38a1aa7b7776', '3df576df-81e9-4560-86e0-0ca66d49953e', '00000000-0000-0000-0000-000000000001'),
        ('d973f222-9679-493a-8b24-421e9462d7e6', '0519ef41-ef93-42a2-86c0-38a1aa7b7776', 'eba1721b-e77f-4ae8-979a-2259302aea7a', '00000000-0000-0000-0000-000000000001'),
        ('08b18715-137f-43e7-839f-1d1c11059b5f', '0519ef41-ef93-42a2-86c0-38a1aa7b7776', 'a8e88901-3feb-4c54-81b6-e2fdf6d6b643', '00000000-0000-0000-0000-000000000001'),
        ('0fad7dcb-72b3-496b-b611-480cb4f4a124', '0519ef41-ef93-42a2-86c0-38a1aa7b7776', 'ea2be585-d905-44a0-8671-4e7c18bbfef0', '00000000-0000-0000-0000-000000000001'),
        ('68595ed0-5b61-45d4-a908-61b38e988927', '0519ef41-ef93-42a2-86c0-38a1aa7b7776', '4dc9ef39-c1c2-4725-b71d-83daaee88b97', '00000000-0000-0000-0000-000000000001'),
        ('9da6bb58-6c2c-4f87-a850-3bf136b5ec66', '0519ef41-ef93-42a2-86c0-38a1aa7b7776', 'f4353371-cca4-4a3f-aade-9e8095c96fe3', '00000000-0000-0000-0000-000000000001'),
        ('e3382c6b-bcca-476b-a99a-d4a7a1496cb9', '0519ef41-ef93-42a2-86c0-38a1aa7b7776', 'b4dd85dd-7c3a-4724-87f4-c10b20e57a9e', '00000000-0000-0000-0000-000000000001'),
        ('1079dd3e-4df4-46b7-b40e-489ae39aab2c', 'dc783a4e-2689-4021-aebf-d5fbdf825703', '6b92d687-b3cd-48b4-b7cf-1e1923b2478a', '00000000-0000-0000-0000-000000000001'),
        ('11dcf1f7-d2a9-4547-bd89-2ea05c847e3d', 'dc783a4e-2689-4021-aebf-d5fbdf825703', '0950e4e0-34c1-4e1c-870e-d5779d16c063', '00000000-0000-0000-0000-000000000001'),
        ('566c4359-8b37-4fc6-9c2e-f0ef6ebcae0d', 'dc783a4e-2689-4021-aebf-d5fbdf825703', '70038662-053d-44d2-b030-83b170d3b3f0', '00000000-0000-0000-0000-000000000001'),
        ('e26dd723-7e93-4131-bca5-7d2b4fbc1a19', 'dc783a4e-2689-4021-aebf-d5fbdf825703', '3c7c7be9-13c7-4db9-a97c-a4dee68fdac6', '00000000-0000-0000-0000-000000000001'),
        ('e2270b6f-6da8-453f-b537-5382f9ce2c49', 'dc783a4e-2689-4021-aebf-d5fbdf825703', 'a760d861-4c47-4823-8593-b5741b71c615', '00000000-0000-0000-0000-000000000001'),
        ('1b366733-2944-4377-b4e3-01a1d0e2bb5c', 'dc783a4e-2689-4021-aebf-d5fbdf825703', '2e6ffb90-d5f9-450f-b34d-a56969797d12', '00000000-0000-0000-0000-000000000001'),
        ('efb0a842-74d2-42d0-b8e2-f4a115e74cb5', 'dc783a4e-2689-4021-aebf-d5fbdf825703', '89f48d4e-b2b5-4fe1-bcfe-669dd3f95ebc', '00000000-0000-0000-0000-000000000001'),
        ('26b6bc01-7a5d-4877-9da2-2ab17b0b1057', 'dc783a4e-2689-4021-aebf-d5fbdf825703', '2cff7426-5ce4-4dc0-bfe9-f137acb453b5', '00000000-0000-0000-0000-000000000001'),
        ('39624b42-9daf-4349-985d-1dbc40a8aa54', 'dc783a4e-2689-4021-aebf-d5fbdf825703', '3df576df-81e9-4560-86e0-0ca66d49953e', '00000000-0000-0000-0000-000000000001'),
        ('b00d2575-6ba1-4f21-aa1d-a983ba6f5ce4', 'dc783a4e-2689-4021-aebf-d5fbdf825703', 'eba1721b-e77f-4ae8-979a-2259302aea7a', '00000000-0000-0000-0000-000000000001'),
        ('dc001a5e-9e3d-4c1f-9b36-c74fc34c9079', 'dc783a4e-2689-4021-aebf-d5fbdf825703', 'a8e88901-3feb-4c54-81b6-e2fdf6d6b643', '00000000-0000-0000-0000-000000000001'),
        ('be6d06d8-999b-463d-9ab7-8b847ac5afec', 'dc783a4e-2689-4021-aebf-d5fbdf825703', '355fcdf3-d7d5-4765-863a-b1ddaa5f0f98', '00000000-0000-0000-0000-000000000001'),
        ('f8f4b8cd-88de-4df9-97ad-ff35d7bf8fe1', 'dc783a4e-2689-4021-aebf-d5fbdf825703', 'ea2be585-d905-44a0-8671-4e7c18bbfef0', '00000000-0000-0000-0000-000000000001'),
        ('5e9d605d-0366-4f2f-a4b6-d2ae88b8fc57', 'dc783a4e-2689-4021-aebf-d5fbdf825703', '4dc9ef39-c1c2-4725-b71d-83daaee88b97', '00000000-0000-0000-0000-000000000001'),
        ('eff76bc2-b5a5-4fac-9885-ce21e9c278cf', 'dc783a4e-2689-4021-aebf-d5fbdf825703', 'ab465b9f-652b-4871-9c29-29385bdac075', '00000000-0000-0000-0000-000000000001');

    INSERT INTO "public"."producto_ingredientes" ("id", "producto_id", "nombre", "orden", "creado_en", "cafeteria_id") VALUES
        ('e1638eb5-beb2-46c3-b686-8dcf00b7bf2c', 'e0ca6c1c-d290-4265-a382-c3883696a3f8', 'catsup', 0, '2026-03-10 01:49:16.459911+00', '00000000-0000-0000-0000-000000000001'),
        ('95cc4627-c79b-4bdc-8556-7d7ea9061e37', 'e0ca6c1c-d290-4265-a382-c3883696a3f8', 'salsa', 1, '2026-03-10 01:49:16.459911+00', '00000000-0000-0000-0000-000000000001'),
        ('234d31c5-d513-4b2c-9ea0-6e3059df696e', 'e0ca6c1c-d290-4265-a382-c3883696a3f8', 'queso amarillo', 2, '2026-03-10 01:49:16.459911+00', '00000000-0000-0000-0000-000000000001'),
        ('8df137af-7baa-4f59-8b2c-ba552e475f0d', 'e0ca6c1c-d290-4265-a382-c3883696a3f8', 'salsa', 3, '2026-03-10 01:49:16.459911+00', '00000000-0000-0000-0000-000000000001'),
        ('7e9ceb93-3325-4e00-9ce4-35d0aac59d2e', 'e0ca6c1c-d290-4265-a382-c3883696a3f8', 'crema', 4, '2026-03-10 01:49:16.459911+00', '00000000-0000-0000-0000-000000000001'),
        ('f220fbe4-4427-49dc-accc-0c4ba280e4f8', 'a5e95c36-c3e8-4496-84cd-7c450881d61e', 'Catsup', 0, '2026-03-11 21:57:40.431281+00', '00000000-0000-0000-0000-000000000001'),
        ('722e757c-ecdd-45b0-a8f4-44b1c9390ec8', 'a5e95c36-c3e8-4496-84cd-7c450881d61e', 'Salsa', 1, '2026-03-11 21:57:40.431281+00', '00000000-0000-0000-0000-000000000001'),
        ('1d6f57cf-f4e8-410f-9542-a03d45f4a27b', 'a5e95c36-c3e8-4496-84cd-7c450881d61e', 'Creama', 2, '2026-03-11 21:57:40.431281+00', '00000000-0000-0000-0000-000000000001'),
        ('d5747eca-fcf2-485f-9021-12f0949b75e0', 'a5e95c36-c3e8-4496-84cd-7c450881d61e', 'Queso amarillo', 3, '2026-03-11 21:57:40.431281+00', '00000000-0000-0000-0000-000000000001'),
        ('b4cdd649-f6eb-46f8-a561-b248050a3b18', '00d905a1-e07b-4b70-8996-d9d55bbb83be', 'Catsup', 0, '2026-03-30 01:29:40.036623+00', '00000000-0000-0000-0000-000000000001'),
        ('28a40d1d-71de-490f-98a1-7d73f7c61b1f', '00d905a1-e07b-4b70-8996-d9d55bbb83be', 'Salsa', 1, '2026-03-30 01:29:40.036623+00', '00000000-0000-0000-0000-000000000001'),
        ('5f44f7a0-be5d-4012-a77e-c311d705fcf6', '00d905a1-e07b-4b70-8996-d9d55bbb83be', 'Creama', 2, '2026-03-30 01:29:40.036623+00', '00000000-0000-0000-0000-000000000001'),
        ('11d542ce-04d4-4350-8cde-e8ec5205ba9b', '00d905a1-e07b-4b70-8996-d9d55bbb83be', 'Queso amarillo', 3, '2026-03-30 01:29:40.036623+00', '00000000-0000-0000-0000-000000000001');

    UPDATE "public"."configuracion"
    SET "nombre_negocio" = 'Cafecito',
        "telefono_whatsapp" = '522722815138',
        "logo_url" = '',
        "color_primario" = '#99582a',
        "banco" = 'Banco',
        "beneficiario" = 'nombre del admin',
        "clabe" = '1234567891234567',
        "concepto_transferencia" = 'Pago de pedido'
    WHERE "cafeteria_id" = '00000000-0000-0000-0000-000000000001';
END;
$$;

REVOKE ALL ON FUNCTION "public"."reset_demo_data"() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "public"."reset_demo_data"() TO "authenticated";
