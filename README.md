# VAL Lashes — Soft Bloom v2.1

Primera web estática de VAL Lashes, diseñada para GitHub Pages. No requiere npm, servidor, base de datos ni clave API.

## Publicación rápida en GitHub

1. Crear un repositorio **público** llamado `val-lashes` en tu cuenta de GitHub (sin marcar «Add a README» para facilitar la subida).
2. Descomprimir este ZIP. En el repositorio recién creado, usar **Add file → Upload files** y arrastrar **el contenido de la carpeta**, NO el ZIP ni una carpeta contenedora. Debe quedar `index.html` directamente en la raíz, acompañado de `styles.css`, `script.js`, `config.js` y `assets/`.
3. Confirmar la subida en la rama `main`.
4. Ir a **Settings → Pages → Build and deployment → Deploy from a branch**; elegir `main` y `/(root)` y guardar.
5. La URL prevista, una vez activada y finalizada la publicación, es `https://ibarrantesg-cenfo.github.io/val-lashes/`. Verificarla en Settings → Pages; no asumir que está activa antes de hacerlo.

## Configurar antes de habilitar citas

Editar `config.js` en GitHub:

- `whatsapp`: número **del negocio** en formato `506XXXXXXXX`, sin espacios, solo si Vale autoriza publicarlo.
- `instagram`: URL oficial completa https://www.instagram.com/...
- `publicLocation`: zona general de atención (evitar domicilio privado).
- `openingHours`: horario confirmado.
- `services`: precios y duraciones confirmados. Nunca inventar.

Sin WhatsApp configurado, el formulario **NO envía solicitudes** y muestra un aviso claro de demostración. Incluso con WhatsApp configurado, la solicitud requiere que la clienta **envíe el mensaje desde WhatsApp** y Vale **confirme** la cita.

## Checklist antes de anunciar la web públicamente

- [ ] Sustituir las imágenes de demostración y espacios vacíos por fotografías reales autorizadas.
- [ ] Aprobar el texto biográfico de Vale y verificar las afirmaciones de higiene.
- [ ] Confirmar servicios, precios, duración, horario y zona de atención.
- [ ] Agregar WhatsApp Business y probar desde Android/iPhone y escritorio.
- [ ] Confirmar la política de privacidad y consentimiento para publicar fotografías.
- [ ] Probar navegación, contrastes y formulario en móvil.

## Archivos

- `index.html`: contenido y secciones.
- `styles.css`: diseño responsive.
- `config.js`: datos editables del negocio.
- `script.js`: navegación y preparación del mensaje de WhatsApp.
- `assets/`: logotipo e ilustraciones locales SVG.
- `.nojekyll`: solicita a GitHub Pages servir los archivos estáticos sin Jekyll.

## Desarrollo local

Abrí `index.html` con un navegador. Para pruebas con servidor local: `python -m http.server 8000` y abrir `http://localhost:8000`.
