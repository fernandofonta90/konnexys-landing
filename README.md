# Konnexys — Landing Page

Marketing landing page for [konnexys.com](https://konnexys.com), deployed as a
static site.

This repository is **separate from the Konnexys LCAP application**
(`konnexys-mvp`) by design: the landing page has its own deploy lifecycle and
should never be coupled to the app's build, runtime, or database.

## Contents

The entire site is a single self-contained file:

```
index.html
```

There is **no build step**, no bundler, no `package.json`, and no asset folder.
Everything the page needs is inline:

- CSS lives in one `<style>` block
- JS lives in one `<script>` block (hero canvas animation, scroll reveals,
  contact handler)
- All graphics are inline `<svg>` plus a JS-drawn `<canvas>`
- The only decorative texture is a `data:` URI

The single external dependency is **Google Fonts**
(`fonts.googleapis.com` / `fonts.gstatic.com`) for the Bricolage Grotesque and
Hanken Grotesk families. If zero third-party requests are ever required, those
two families can be self-hosted — that is the only change that would introduce
an asset folder.

## Local preview

Open the file directly:

```bash
open index.html
```

Or serve it over HTTP (closer to production behaviour):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deployment

Any static host works — point it at the repository root and serve `index.html`.
No build command, no output directory, no environment variables.

## Contact form

The "Solicitar piloto" button is currently a `mailto:` handoff: it opens the
visitor's mail client addressed to `hola@konnexys.com` with the form fields
prefilled. It does **not** post to a server.

This is intentional for now (test behaviour). To make it capture submissions,
swap the handler in `index.html` for a form endpoint such as Formspree — the
relevant function is `enviarSolicitud()` near the bottom of the file.
