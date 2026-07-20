'use client';

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

// ============================================================
// SignaturePad: Komponen Canvas Tanda Tangan (Curat-Coret)
// ------------------------------------------------------------
// Menggantikan input upload file tanda tangan dengan canvas
// yang bisa dicoret langsung menggunakan mouse / jari (touch),
// memakai tinta hitam. Hasil akhirnya berupa string Base64 PNG
// (data:image/png;base64,...) yang siap dikirim ke field
// `tanda_tangan_file` pada backend Laravel.
// ============================================================

export interface SignaturePadRef {
  /** Mengambil hasil tanda tangan sebagai Base64 PNG, null jika kosong */
  getSignature: () => string | null;
  /** Mengosongkan kembali kanvas */
  clear: () => void;
  /** Mengecek apakah kanvas sudah ada coretan */
  isEmpty: () => boolean;
}

interface SignaturePadProps {
  /** Lebar kanvas dalam px (default mengikuti container) */
  width?: number;
  /** Tinggi kanvas dalam px */
  height?: number;
  className?: string;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ height = 200, className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawing = useRef(false);
    const hasDrawn = useRef(false);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);
    const [isEmptyState, setIsEmptyState] = useState(true);

    // Setup ulang ukuran kanvas (mendukung Retina/HiDPI) setiap kali container resize
    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const setupCanvas = () => {
        const ratio = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        const prevDrawing = canvas.toDataURL();

        canvas.width = rect.width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(ratio, ratio);
          ctx.lineWidth = 2.2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = '#000000'; // Tinta hitam sesuai permintaan
        }

        // Coba pulihkan coretan sebelumnya setelah resize (best effort)
        if (hasDrawn.current && prevDrawing && prevDrawing !== 'data:,') {
          const img = new Image();
          img.onload = () => ctx?.drawImage(img, 0, 0, rect.width, height);
          img.src = prevDrawing;
        }
      };

      setupCanvas();
      const resizeObserver = new ResizeObserver(setupCanvas);
      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [height]);

    const getPointFromEvent = (
      e: React.MouseEvent | React.TouchEvent
    ): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();

      if ('touches' in e) {
        const touch = e.touches[0] || e.changedTouches[0];
        if (!touch) return null;
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const point = getPointFromEvent(e);
      if (!point) return;
      isDrawing.current = true;
      lastPoint.current = point;
    };

    const moveDraw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing.current) return;
      e.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const point = getPointFromEvent(e);
      if (!ctx || !point || !lastPoint.current) return;

      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();

      lastPoint.current = point;
      if (!hasDrawn.current) {
        hasDrawn.current = true;
        setIsEmptyState(false);
      }
    };

    const endDraw = () => {
      isDrawing.current = false;
      lastPoint.current = null;
    };

    useImperativeHandle(ref, () => ({
      getSignature: () => {
        const canvas = canvasRef.current;
        if (!canvas || !hasDrawn.current) return null;
        return canvas.toDataURL('image/png');
      },
      clear: () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        hasDrawn.current = false;
        setIsEmptyState(true);
      },
      isEmpty: () => !hasDrawn.current,
    }));

    return (
      <div className="space-y-2">
        <div
          ref={containerRef}
          className={`relative w-full rounded-md border border-dashed border-[#E2E8F0] bg-white touch-none ${className}`}
        >
          <canvas
            ref={canvasRef}
            className="block w-full cursor-crosshair touch-none"
            style={{ height }}
            onMouseDown={startDraw}
            onMouseMove={moveDraw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={moveDraw}
            onTouchEnd={endDraw}
          />
          {isEmptyState && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[12px] text-slate-400 italic">Coret tanda tangan Anda di sini</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;