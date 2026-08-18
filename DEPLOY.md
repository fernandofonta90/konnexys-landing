# Deploying the Konnexys landing page

Target: **Render** (static site) + **GoDaddy** (DNS for `konnexys.com`).

This is a separate Render service from the Konnexys LCAP app. That is
deliberate: the landing page and the application have independent deploy
lifecycles, so a bad landing deploy cannot take down the app, and vice
versa. The cost is two services to watch in the dashboard.

There is no build step. [index.html](index.html) is a single
self-contained file — inline CSS, inline JS, inline SVG — so the deploy is
effectively a file copy. See [README.md](README.md) for what the page does
and does not depend on.

---

## Runbook — Render dashboard

### 1. Create the static site

1. **render.com → New + → Static Site**

   > ### ⚠️ Static Site, not Web Service
   >
   > A Web Service would provision an always-on container to serve one
   > HTML file — slower, and billable once it leaves the free tier. A
   > Static Site is served from Render's CDN, is free, and has no
   > spin-down, so there is no cold-start penalty on the landing page.
   > This differs from the app service, which does spin down when idle.

2. **Connect the GitHub repo** `fernandofonta90/konnexys-landing`.

   If the repo does not appear in the list, click **Configure account** /
   **Configure GitHub App** and grant Render access to it. Render's GitHub
   App is usually scoped to *selected repositories* rather than all of
   them, so a newly created repo stays invisible until it is added.

3. **Branch:** `main`

### 2. Settings

| Field | Value |
|---|---|
| **Name** | `konnexys-landing` |
| **Branch** | `main` |
| **Root Directory** | *leave blank* |
| **Build Command** | *leave completely empty* |
| **Publish Directory** | `.` |

Only two of these can go wrong, and both are worth stating plainly:

- **Build Command must be empty.** There is nothing to build. Any command
  here will either fail or waste build minutes.
- **Publish Directory is `.`** — a single dot, meaning the repository
  root, because `index.html` sits at the top level. Entering `dist` or
  `build` (the habitual values, and the ones the app repo uses) fails the
  deploy with *publish directory not found*. Those directories do not
  exist in this repo and never will.

There is no `package.json`, so Render skips dependency installation
entirely. The first deploy should complete in well under a minute.

### 3. Deploy and verify

1. **Create Static Site.**
2. Once live, open the assigned `konnexys-landing.onrender.com` URL and
   confirm the page renders: hero canvas animation running, fonts loaded,
   anchor navigation working.
3. **Verify this before touching DNS.** Debugging a broken page and
   broken DNS at the same time is avoidable work.

Pushes to `main` auto-deploy from here on.

---

## Custom domain — `konnexys.com`

### 4. Register the domains in Render

**Your static site → Settings → Custom Domains → Add Custom Domain.**

Add **both**:

- `konnexys.com`
- `www.konnexys.com`

Add `www` even if it will not be advertised — visitors type it regardless.
Once both are registered, Render redirects `www` to the apex automatically.

Render then displays the exact DNS records to create. **Use the values
Render shows you.** They are authoritative for this account; anything
written below is a sanity check, not a substitute.

### 5. Why the apex domain needs an A record

`konnexys.com` is the zone apex (the root), not a subdomain like
`demo.konnexys.com`. The DNS specification forbids a CNAME at the apex:
the apex must carry SOA and NS records, and a CNAME cannot coexist with
any other record at the same name. So the apex **cannot** be a CNAME to
`konnexys-landing.onrender.com`.

There are normally two ways around this:

1. **ALIAS / ANAME** — a provider-specific pseudo-record that behaves like
   a CNAME but resolves to an A record at query time, making it legal at
   the apex. Cloudflare calls this CNAME flattening; Route 53 calls it an
   Alias record.
2. **A record** pointing at a static IP.

> ### ⚠️ GoDaddy does not support ALIAS or ANAME
>
> GoDaddy's DNS editor offers only A, AAAA, CNAME, MX, TXT, SRV, NS and
> CAA. Option 1 is unavailable. **The apex must use an A record** — which
> is precisely why Render publishes a static anycast IP for apex domains.
>
> The `www` subdomain is unaffected and takes an ordinary CNAME.

### 6. GoDaddy records

**Domain Portfolio → konnexys.com → DNS → Manage Zones**

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | *the IP Render displays* | 600 |
| CNAME | `www` | `konnexys-landing.onrender.com` | 600 |

`@` is GoDaddy's notation for the apex.

Render's documented apex IP has been `216.24.57.1`. Treat that as a
cross-check only — enter whatever the Render dashboard shows. If the two
disagree, Render is right.

Lower the TTL to 600 seconds *before* making changes where possible, so a
mistake is cheap to correct rather than cached for an hour.

### 7. Three GoDaddy gotchas

Each of these fails silently or confusingly:

1. **Delete the parked records first.** GoDaddy ships new domains with an
   `A @` record pointing at its parking page and a `www` CNAME to `@` or
   a GoDaddy host. **Edit the existing records rather than adding new
   ones** — two A records at `@` round-robin, so roughly half of all
   traffic lands on GoDaddy's parking page while the other half works.
   This presents as "the site works intermittently" and wastes hours.

2. **Turn off Domain Forwarding.** If any forwarding is configured on
   `konnexys.com`, GoDaddy injects its own records that silently override
   the ones above. Find it in the domain settings and remove it.

3. **Check for CAA records.** If a CAA record exists at the apex it must
   permit Render's certificate authority (Let's Encrypt,
   `letsencrypt.org`) or TLS issuance fails with an opaque error. Most
   domains have none — an absent CAA record means any CA is allowed,
   which is fine.

### 8. Verify

```bash
dig +short konnexys.com A
# expect: the IP shown in the Render dashboard

dig +short www.konnexys.com CNAME
# expect: konnexys-landing.onrender.com.
```

Then check both over HTTPS:

```bash
curl -sSI https://konnexys.com | head -1
curl -sSI https://www.konnexys.com | head -1
```

In Render, the domains flip to **Verified** once DNS propagates — usually
minutes, though GoDaddy's default 1-hour TTL can stretch it. Render issues
the TLS certificate automatically after verification. A brief certificate
warning in the window between DNS resolving and the certificate being
issued is normal; give it a few minutes before investigating.

---

## Known limitations at launch

- **The contact form does not capture anything.** The "Solicitar piloto"
  button is a `mailto:` handoff — it opens the visitor's mail client
  addressed to `hola@konnexys.com` with the form fields prefilled, and
  posts to no server. Visitors without a configured desktop mail client
  get nothing at all. This is intentional for now; making it capture
  submissions means swapping `enviarSolicitud()` near the bottom of
  `index.html` for a form endpoint such as Formspree.
- **`hola@konnexys.com` must be a real inbox** or those submissions go
  nowhere.
- **Google Fonts is a third-party dependency.** The page makes requests to
  `fonts.googleapis.com` and `fonts.gstatic.com` for Bricolage Grotesque
  and Hanken Grotesk. Self-hosting the two families is the only change
  that would introduce an asset folder to this repo.
- **No analytics.** Nothing is instrumented; there is no way to tell how
  many people reach the page.

## Rollback

Render keeps previous deploys: **your static site → Deploys →** pick the
last good one **→ Rollback**. This is instant and does not touch git.

To roll back the source, `git revert` the offending commit and push;
auto-deploy handles the rest.

To detach the domain without deleting anything, remove the custom domains
in Render and repoint the GoDaddy `A @` record. DNS changes take a TTL to
propagate — which is the argument for keeping the TTL low.
