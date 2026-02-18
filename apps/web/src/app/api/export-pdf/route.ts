import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const markdown = typeof body?.markdown === 'string' ? body.markdown.trim() : '';

    if (!markdown) {
      return Response.json({ error: 'markdown is required' }, { status: 400 });
    }

    const { mdToPdf } = await import('md-to-pdf');

    const workDir = join(tmpdir(), `md-to-pdf-kit-${randomUUID()}`);
    await mkdir(workDir, { recursive: true });

    const inputPath = join(workDir, 'input.md');
    const outputPath = join(workDir, 'output.pdf');

    await writeFile(inputPath, markdown, 'utf8');

    const result = await mdToPdf(
      { path: inputPath },
      {
        dest: outputPath,
        launch_options: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      }
    );

    if (!result?.filename) {
      await rm(workDir, { recursive: true, force: true });
      return Response.json({ error: 'failed to generate pdf' }, { status: 500 });
    }

    const pdfBuffer = await readFile(result.filename);
    await rm(workDir, { recursive: true, force: true });

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="markdown-export.pdf"',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
