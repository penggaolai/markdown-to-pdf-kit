'use client';

import { FormEvent, useState } from 'react';

const SAMPLE_MD = `# Markdown to PDF\n\nThis PDF is generated from Markdown content in a **Next.js + Nx** app.\n\n## Features\n\n- Headings\n- Lists\n- Code blocks\n- Tables\n\n\`\`\`ts\nexport const hello = 'world';\n\`\`\`\n\n| Name | Value |\n| --- | --- |\n| Framework | Next.js |\n| Workspace | Nx |\n`;

export default function Page() {
  const [markdown, setMarkdown] = useState(SAMPLE_MD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onExport = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to export PDF');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'markdown-export.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1>markdown-to-pdf-kit</h1>
      <p>Paste Markdown and export directly to PDF.</p>

      <form onSubmit={onExport}>
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          rows={20}
          style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
        />

        <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{ padding: '10px 16px', borderRadius: 8, border: 0, background: '#111827', color: '#fff', cursor: 'pointer' }}
          >
            {isLoading ? 'Exporting…' : 'Export PDF'}
          </button>
          {error ? <span style={{ color: '#b91c1c' }}>{error}</span> : null}
        </div>
      </form>
    </main>
  );
}
