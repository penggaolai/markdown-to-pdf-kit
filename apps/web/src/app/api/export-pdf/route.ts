import chromium from '@sparticuz/chromium';
import MarkdownIt from 'markdown-it';
import puppeteer from 'puppeteer-core';

export const runtime = 'nodejs';

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

function wrapHtml(markdown: string) {
  const body = md.render(markdown);
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111; line-height: 1.6; font-size: 14px; padding: 32px; }
      h1, h2, h3 { line-height: 1.25; margin: 1.1em 0 0.5em; }
      h1 { font-size: 2em; }
      h2 { font-size: 1.5em; }
      h3 { font-size: 1.2em; }
      p { margin: 0.6em 0; }
      pre, code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace; }
      pre { background: #f6f8fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; overflow-x: auto; }
      code { background: #f3f4f6; padding: 0.12em 0.35em; border-radius: 4px; }
      pre code { background: transparent; padding: 0; }
      blockquote { border-left: 4px solid #d1d5db; margin: 0.8em 0; padding: 0.2em 1em; color: #4b5563; }
      table { width: 100%; border-collapse: collapse; margin: 1em 0; }
      th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
      th { background: #f9fafb; }
      ul, ol { padding-left: 1.4em; }
      a { color: #2563eb; text-decoration: none; }
      hr { border: 0; border-top: 1px solid #e5e7eb; margin: 1.2em 0; }
    </style>
  </head>
  <body>${body}</body>
</html>`;
}

export async function POST(req: Request) {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    const markdown = typeof body?.markdown === 'string' ? body.markdown.trim() : '';

    if (!markdown) {
      return Response.json({ error: 'markdown is required' }, { status: 400 });
    }

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(wrapHtml(markdown), { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    });

    return new Response(Buffer.from(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="markdown-export.pdf"',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return Response.json({ error: message }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
