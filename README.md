# markdown-to-pdf-kit

Nx + Next.js + TypeScript starter for exporting Markdown content to PDF **without writing custom Markdown parsing logic**.

## Stack

- Nx workspace
- Next.js (App Router)
- TypeScript
- [`md-to-pdf`](https://www.npmjs.com/package/md-to-pdf) for Markdown → PDF rendering

## How it works

- UI page: `apps/web/src/app/page.tsx`
  - Paste Markdown
  - Click **Export PDF**
- API route: `apps/web/src/app/api/export-pdf/route.ts`
  - Accepts `{ markdown: string }`
  - Generates PDF using `md-to-pdf`
  - Returns downloadable PDF bytes

## Run locally

```bash
npm install
npx nx serve web
```

Open: `http://localhost:4200`

## Export API

`POST /api/export-pdf`

Request body:

```json
{
  "markdown": "# Hello\n\nThis will become a PDF."
}
```

Response:
- `200 application/pdf` on success
- JSON error on failure

## Notes

- The API route runs with `runtime = 'nodejs'`.
- Puppeteer launch flags include `--no-sandbox` for server compatibility.
- If deployment platform blocks Chromium, use a platform-supported browser runtime.
