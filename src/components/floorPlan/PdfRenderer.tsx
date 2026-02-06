import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Loader2 } from 'lucide-react';

interface PdfRendererProps {
  pdfUrl: string;
  className?: string;
}

export default function PdfRenderer({ pdfUrl, className }: PdfRendererProps) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function renderPdf() {
      try {
        setLoading(true);
        setError(false);

        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const scale = 2;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');

        await page.render({ canvasContext: context, viewport, canvas } as Parameters<typeof page.render>[0]).promise;

        if (!cancelled) {
          setImageDataUrl(canvas.toDataURL('image/png'));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    renderPdf();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className ?? ''}`}>
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Rendering PDF...</p>
        </div>
      </div>
    );
  }

  if (error || !imageDataUrl) {
    return (
      <div className={`flex items-center justify-center ${className ?? ''}`}>
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <FileText size={48} />
          <p className="text-sm font-medium">PDF floor plan uploaded</p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-yolk-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-yolk-600"
          >
            <ExternalLink size={14} />
            Open PDF
          </a>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageDataUrl}
      alt="Floor plan (rendered from PDF)"
      className={className}
    />
  );
}
