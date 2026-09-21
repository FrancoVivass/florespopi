# Flores amarillas · Angular

Aplicación Angular 22 standalone, dedicada a Popi de parte de Fran. Al tocar “Hacer florecer”, seis flores aparecen una por una con efectos de crecimiento, luces y mensajes. Al completarse el ramo se habilita la carta. Incluye melodía original mediante Web Audio, diseño móvil y modo de movimiento reducido.

## Abrir

Con Node.js 24.15+ (serie 24) y pnpm 11.19.0 instalados:

```sh
pnpm install
pnpm start
```

Abrir http://127.0.0.1:4200/. La app necesita un servidor: no se abre haciendo doble clic en src/index.html.

## Compilar

```sh
pnpm build
```

La carpeta `dist/` contiene el sitio estático listo para alojar. No necesita backend ni claves. La música solo empieza al tocar “Activar música”.

## Publicar después en Vercel

1. En Vercel, importar el repositorio `FrancoVivass/florespopi`.
2. Dejar **Root Directory** en `./`: los archivos Angular están directamente en la raíz del repositorio.
3. Conservar el preset **Angular** y Node.js **24.x**.
4. Desplegar. No se necesitan variables de entorno.

`vercel.json` ya define la instalación, la compilación y la carpeta de salida `dist`. Se fija pnpm 11.19.0 en los comandos para usar la misma versión que generó el lockfile. La versión de Node se declara en `package.json`.

Referencias oficiales: [configuración del proyecto](https://vercel.com/docs/project-configuration/project-settings), [gestores de paquetes](https://vercel.com/docs/package-managers) y [versiones de Node.js](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## Dedicatoria

El regalo y la carta están fijos para Popi, de parte de Fran. No hay editor, formulario ni personalización por URL. El texto de la carta está en `src/app/app.ts`. Localhost solo funciona en esta computadora; para enviarlo a Popi hace falta alojar la carpeta `dist/` en un sitio accesible para ella.

## Archivos

- `src/app/app.ts`, `app.html`, `app.css`: experiencia y secuencia floral.
- `src/app/atmosphere.ts`: partículas Canvas.
- `src/app/music.ts`: melodía original sin grabaciones externas.
- `public/assets/ramo-amarillo.png`: ilustración del ramo.

## Ilustración

Creada con la herramienta integrada de generación de imágenes. Prompt: “An exquisite hand-painted bouquet of abundant yellow flowers being offered as a September gift, with large sunflowers, yellow roses, small golden wildflowers and delicate green stems tied with a flowing deep navy silk ribbon. Premium editorial botanical illustration, detailed gouache and subtle watercolor texture, vertical centered bouquet, warm golden rim light, no text, no vase, no hands, no watermark.”

La imagen recibida tiene fondo oscuro ilustrado. Se conserva intacta y se integra con máscaras y capas animadas en la aplicación.
