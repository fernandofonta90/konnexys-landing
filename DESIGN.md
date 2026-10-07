# Diseño — "La línea"

Konnexys se dibuja como un mapa de transporte: un proceso es un recorrido con paradas.

## Idea
Una frase sale de origen, pasa por cinco estaciones (TRIGGER, FORM, RULE, APPROVE, OUTPUT) y llega a destino. La misma línea naranja sale del hero y recorre el margen de toda la página; cada sección es una estación.

## Color
| Rol | Valor |
|---|---|
| Papel | `#FCF9F5`, con aurora durazno en el hero y en el formulario, hecha solo con degradés radiales (sin `filter: blur`, que Safari dibuja mal) |
| Texto | `#2B2622` (marrón muy oscuro, no negro), secundario `#5A544D` y `#756E66` |
| Bordes finos | `#EFE3D9` |
| Línea de marca | `#FF6A30` |
| Aro de estación | `#F6B08E`; se enciende con el color de su línea |
| Piezas (tintes pastel) | trigger `#E4EEF9`, form `#FFE9DD`, rule `#FBF0D6`, approve `#E1F2EA`, output `#EDEAE4`, cada uno con su texto oscuro |

No se usa negro puro ni bordes gruesos. El único bloque oscuro es el tablero del caso (`#332C27`).

## Tipografía
DM Sans, alojada en `assets/fonts/`. Titulares en 600 con interletra −0.03 a −0.04em; cuerpo en 400 a 18 px; etiquetas de pieza en 700 mayúsculas a 11.5 px. No se usa monoespaciada.

## Formas
- **Línea:** 6–7 px, extremos y uniones redondeados, solo tramos rectos y un quiebre en diagonal.
- **Estación:** círculo blanco con aro durazno; se enciende al pasar.
- **Placa:** blanca, borde fino, radio 14–24 px y sombra cálida suave.
- **Botones:** el principal es una pastilla en marrón oscuro (`#2B2622`) con texto blanco y la flecha dentro de un círculo naranja; el secundario es texto apoyado en un tramo de línea naranja de 2 px. Sin degradés, vidrio ni sombras.
- **Pestañas:** texto sobre una regla fina; la activa lleva un tramo de línea naranja de 4 px.

## Movimiento
- La frase se escribe y la línea crece estación por estación.
- La línea del margen se dibuja con el scroll y enciende cada estación al pasar.
- El caso "#1042" viaja por la línea en la sección de operación.
- Transiciones de 0.14–0.45 s con desaceleración, sin rebote. Con `prefers-reduced-motion` todo queda en su estado final.

## Plataforma
La sección se muestra como un mosaico de seis piezas, cada una con su capacidad en acción. No se dibuja a Konnexys como un puente entre sistemas: no es un integrador. Las conexiones se mencionan en una línea de texto.

## Celular
- Áreas táctiles de 44 px o más; campos de formulario a 16 px para que iOS no haga zoom.
- Se respetan las zonas seguras (muesca y barras del sistema).
- En pantallas táctiles la aurora queda quieta y la barra no usa desenfoque.
- Probado con el motor de Safari (iPhone 15, iPhone SE, iPad Mini) y el de Chrome (Pixel 7, Galaxy S9+).

## Reglas
- Una sola línea, la naranja de marca, en toda la página. No hay líneas de otros colores.
- La línea del margen aparece desde 1100 px de ancho; por debajo, cada bloque conserva su propia línea.
- Nada que no se pueda respaldar: sin logos de clientes, premios ni cifras sin fuente.
