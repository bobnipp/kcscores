# Fourball — golf team scoring

A phone-first scoring app for 4-player teams: 1 gross + 1 net per hole (or 2 gross / 2 net), prizes for most birdies, front 9, back 9 and 18 holes, with per-player payouts. Data is shared live through Supabase.

## Files

- `Fourball.dc.html`: the app (open it in a browser)
- `support.js`: the runtime the app loads
- `_ds/`: the stylesheet and design-system bundle
- `supabase/setup.sql`: database setup (run once in Supabase → SQL Editor)

## Run locally

Serve the folder with any static server, e.g.

```
npx serve .
```

then open `http://localhost:3000/Fourball.dc.html`.

## Deploy (Cloudflare)

`wrangler.jsonc` tells Cloudflare to serve this folder as static files. `.assetsignore` keeps the config and README out of the upload.

- **Workers (Connect to Git):** build command empty, deploy command `npx wrangler deploy`.
- **Pages:** framework preset **None**, build command empty, build output directory `/`.

The site root serves the app (see `_redirects`).

`_redirects` maps `/` to the app. `_headers` turns off caching for the app files so phones pick up new versions straight away.

## Supabase

The project URL and anon key are set at the top of the script in `Fourball.dc.html` (`SB_URL`, `SB_KEY`). The anon key is public by design; access is controlled by the row-level security policies in `setup.sql`, which currently allow anyone with the link to read and write.
