# SvelteKit: `afterNavigate` gets a broken `from` on start when SSR is off

When a page with `ssr = false` is loaded directly, the `enter` navigation passed to `afterNavigate` has `from: { route: { id: null }, url: null, … }` instead of `from: null`. Code that follows the types, such as `navigation.from?.url.pathname`, throws. Server-rendered pages pass `from: null`.

## By hand

[Open in StackBlitz](https://stackblitz.com/github/stickerdaniel/sveltekit-afternavigate-from-repro), or run `npm install && npm run dev`.

1. Open `/ssr`. The log shows `from` as `null`.
2. Open `/spa` directly, for example by typing it into the address bar. This page sets `ssr = false`.

Expected: `from` is `null`, like on `/ssr`.
Actual: `from` is `{"route":{"id":null},"url":null,"scroll":{"x":0,"y":0}}`, and `from?.url.pathname` throws `TypeError: Cannot read properties of null (reading 'pathname')`.

## Automated

```sh
npm install
npx playwright install chromium
npm run build
npm run repro
```

`repro.mjs` loads `/ssr` and `/spa` directly, clicks the `/ssr` link, and prints the `afterNavigate` log. With `@sveltejs/kit` 3.1.1 in Chromium 156:

| page | type | `navigation.from` | `navigation.from?.url.pathname` |
| --- | --- | --- | --- |
| `/ssr` | `enter` | `null` | `undefined` |
| `/spa` | `enter` | `{"route":{"id":null},"url":null,"scroll":{"x":0,"y":0}}` | `TypeError: Cannot read properties of null (reading 'pathname')` |
| `/ssr` | `link` | `{"params":{},"route":{"id":"/spa"},"url":"http://127.0.0.1:4321/spa",…}` | `/spa` |
