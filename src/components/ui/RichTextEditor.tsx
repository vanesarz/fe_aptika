"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";

interface RichTextEditorProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function RichTextEditor({
  label,
  required,
  value,
  onChange,
  placeholder = "Ketik isi surat di sini...",
  rows = 6,
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fullscreenEditorRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Sync internal contentEditable HTML with value prop without breaking active cursor
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
    if (fullscreenEditorRef.current) {
      if (fullscreenEditorRef.current.innerHTML !== (value || "")) {
        fullscreenEditorRef.current.innerHTML = value || "";
      }
    }
  }, [value, isFullscreen]);

  const handleInput = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const html = ref.current.innerHTML;
      // If content is just empty break tags, clear it
      if (html === "<br>" || html === "<div><br></div>") {
        onChange("");
      } else {
        onChange(html);
      }
    }
  };

  const execCmd = (command: string, arg: string | undefined = undefined) => {
    const activeRef = isFullscreen ? fullscreenEditorRef : editorRef;
    if (activeRef.current) {
      activeRef.current.focus();
      document.execCommand(command, false, arg);
      handleInput(activeRef);
    }
  };

  const handleLink = () => {
    const url = prompt("Masukkan URL Tautan (misal: https://jabarprov.go.id):", "https://");
    if (url && url !== "https://") {
      execCmd("createLink", url);
    }
  };

  const minHeightPx = Math.max(rows * 24, 120);

  const toolbar = (
    <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-1.5 text-slate-700 select-none">
      {/* Group 1: Text Styling (B, I, U) */}
      <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
        <button
          type="button"
          onClick={() => execCmd("bold")}
          title="B: Bold / Tebal"
          className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded text-slate-800 font-bold transition-colors"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("italic")}
          title="I: Italic / Miring"
          className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded text-slate-800 italic transition-colors"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("underline")}
          title="U: Underline / Garis Bawah"
          className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded text-slate-800 underline transition-colors"
        >
          <Underline size={15} />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* Group 2: Lists (Bulleted & Numbered) */}
      <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
        <button
          type="button"
          onClick={() => execCmd("insertUnorderedList")}
          title="☷: Bulleted List (Daftar Simbol)"
          className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded text-slate-800 transition-colors"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("insertOrderedList")}
          title="1 2 3: Numbered List (Daftar Angka)"
          className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded text-slate-800 transition-colors"
        >
          <ListOrdered size={15} />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* Group 3: Alignments (Left, Center, Right) */}
      <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
        <button
          type="button"
          onClick={() => execCmd("justifyLeft")}
          title="☰: Align Left (Rata Kiri)"
          className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded text-slate-800 transition-colors"
        >
          <AlignLeft size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyCenter")}
          title="≡: Align Center (Rata Tengah)"
          className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded text-slate-800 transition-colors"
        >
          <AlignCenter size={15} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyRight")}
          title="☷: Align Right (Rata Kanan)"
          className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded text-slate-800 transition-colors"
        >
          <AlignRight size={15} />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* Group 4: Insert Link */}
      <button
        type="button"
        onClick={handleLink}
        title="🔗: Insert Link (Tambah Tautan)"
        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 hover:text-blue-600 rounded-lg text-slate-800 transition-colors shadow-sm"
      >
        <Link2 size={15} />
      </button>

      <div className="flex-1" />

      {/* Group 5: Fullscreen Toggle */}
      <button
        type="button"
        onClick={() => setIsFullscreen(!isFullscreen)}
        title={isFullscreen ? "Kecilkan Editor" : "Perbesar Fullscreen"}
        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 hover:text-blue-600 rounded-lg text-slate-800 transition-colors shadow-sm flex items-center gap-1.5 text-xs font-bold"
      >
        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        <span>{isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}</span>
      </button>
    </div>
  );

  const isEmpty = !value || value === "<br>" || value === "<div><br></div>";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* WYSIWYG Editor Container */}
      <div
        className={`border rounded-xl overflow-hidden transition-all bg-white shadow-sm ${
          isFocused ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-300"
        }`}
      >
        {toolbar}

        <div className="relative">
          {isEmpty && !isFocused && (
            <div className="absolute top-3 left-4 text-xs text-slate-400 pointer-events-none select-none">
              {placeholder}
            </div>
          )}

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onInput={() => handleInput(editorRef)}
            style={{ minHeight: `${minHeightPx}px` }}
            className="w-full p-4 text-xs outline-none font-sans leading-relaxed text-slate-800 overflow-y-auto prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-600 [&_a]:underline"
          />
        </div>
      </div>

      {/* Fullscreen WYSIWYG Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9999] p-4 md:p-8 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full h-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                Editor Teks ({label || "Dokumen"})
              </h3>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-2 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {toolbar}
            <div className="relative flex-1 bg-white">
              {isEmpty && (
                <div className="absolute top-6 left-6 text-sm text-slate-400 pointer-events-none select-none">
                  {placeholder}
                </div>
              )}
              <div
                ref={fullscreenEditorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => handleInput(fullscreenEditorRef)}
                className="w-full h-full p-6 text-sm outline-none font-sans leading-relaxed text-slate-800 overflow-y-auto prose max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-600 [&_a]:underline"
              />
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-all"
              >
                Selesai Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Viewer component to render the HTML formatted WYSIWYG content
 * in preview cards and printable document pages.
 */
export function FormattedContentViewer({
  content,
  className = "",
}: {
  content?: string;
  className?: string;
}) {
  if (!content) return <span className="text-slate-400 italic">-</span>;

  let html = content;
  const containsHtml = /<[a-z][\s\S]*>/i.test(content);

  if (!containsHtml) {
    html = html.replace(/\n/g, "<br/>");
  }

  return (
    <div
      className={`prose prose-sm max-w-none text-slate-800 leading-relaxed font-sans text-xs [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-600 [&_a]:underline ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
