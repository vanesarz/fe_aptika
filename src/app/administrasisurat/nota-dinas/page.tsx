"use client";

import { useEffect, useState } from "react";
import { 
  FileText, Eye, Edit, Trash2, Plus, Search, Filter, Download, 
  UserPlus, Bold, Italic, Underline, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, Link2, Maximize2, Send, ChevronDown, X,
  Printer, ArrowLeft, CheckCircle2 
} from "lucide-react";
import { getNotaDinasList, deleteNotaDinas, createNotaDinas, updateNotaDinas, exportNotaDinas } from "@/services/api";
import { Pagination } from "@/components/ui/Pagination";
import { RichTextEditor, FormattedContentViewer } from "@/components/ui/RichTextEditor";

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    const cleanStr = String(dateString).split("T")[0].split(" ")[0];
    const parts = cleanStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(year, month, day);
        return date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    }
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  } catch (e) {
    console.error(e);
  }
  return dateString;
};

const DEPARTMENT_OPTIONS = [
  "Kepala Bidang e-Government",
  "Kepala Bidang Aplikasi Informatika",
  "Kepala Bidang Persandian dan Keamanan Informasi",
  "Kepala Dinas Kominfo",
  "Sekretariat Diskominfo",
  "Divisi IT",
  "Finance",
  "Kepegawaian",
  "Humas",
  "Tim Teknis Pusat Data"
];

export default function NotaDinasPage() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // View states: 'list' | 'form' | 'preview'
  const [viewState, setViewState] = useState<"list" | "form" | "preview">("list");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Preview State
  const [previewItem, setPreviewItem] = useState<any>(null);

  // Form states
  const [selectedKepada, setSelectedKepada] = useState<string[]>([]);
  const [isKepadaOpen, setIsKepadaOpen] = useState(false);
  const [dari, setDari] = useState("Kepala Bidang Persandian dan Keamanan Informasi");
  const [tembusan, setTembusan] = useState("Yth. Kepala Dinas Komunikasi dan Informatika");
  const [sifatSurat, setSifatSurat] = useState<"biasa" | "penting" | "rahasia">("penting");
  const [perihal, setPerihal] = useState("");
  const [isiSurat, setIsiSurat] = useState("");
  const [jumlahLampiran, setJumlahLampiran] = useState<number>(1);
  const [isiLampiranList, setIsiLampiranList] = useState<string[]>([""]);
  const [tanggalSurat, setTanggalSurat] = useState("");
  const [lampiranFile, setLampiranFile] = useState<File | null>(null);
  const [existingLampiranName, setExistingLampiranName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getNotaDinasList({
        search,
        status: statusFilter,
        page: currentPage,
        per_page: itemsPerPage,
      });
      if (res?.success) {
        setItems(res.data || []);
        setTotalPages(res.meta?.last_page || 1);
        setTotalItems(res.meta?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch Nota Dinas data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (viewState === "list") {
      fetchData();
    }
  }, [currentPage, search, statusFilter, viewState]);

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus Nota Dinas ini?")) {
      try {
        await deleteNotaDinas(id);
        fetchData();
      } catch (error) {
        alert("Gagal menghapus Nota Dinas");
      }
    }
  };

  const handleOpenForm = (mode: "create" | "edit", data?: any) => {
    setFormMode(mode);
    if (mode === "edit" && data) {
      setSelectedId(data.id);
      
      const kepadaArray = data.tujuan ? data.tujuan.split(", ") : [];
      setSelectedKepada(kepadaArray);

      setDari(data.dari || "Kepala Bidang Persandian dan Keamanan Informasi");
      setTembusan(data.tembusan || "");
      setSifatSurat((data.sifat_surat as any) || "biasa");
      setPerihal(data.perihal || "");
      setIsiSurat(data.isi_surat || "");

      let parsedLampiran = [""];
      if (data.isi_lampiran) {
        try {
          parsedLampiran = JSON.parse(data.isi_lampiran);
          if (!Array.isArray(parsedLampiran)) parsedLampiran = [data.isi_lampiran];
        } catch (e) {
          parsedLampiran = [data.isi_lampiran];
        }
      }
      setIsiLampiranList(parsedLampiran);
      setJumlahLampiran(parsedLampiran.length > 0 ? parsedLampiran.length : 1);

      setTanggalSurat(data.tanggal_surat ? data.tanggal_surat.split("T")[0] : "");
      setExistingLampiranName(data.lampiran || "");
      setLampiranFile(null);
    } else {
      setSelectedId(null);
      setSelectedKepada([]);
      setDari("");
      setTembusan("");
      setSifatSurat("biasa");
      setPerihal("");
      setIsiSurat("");
      setIsiLampiranList([""]);
      setJumlahLampiran(1);
      setTanggalSurat(new Date().toISOString().split("T")[0]);
      setExistingLampiranName("");
      setLampiranFile(null);
    }
    setViewState("form");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedKepada.length === 0) {
      alert("Silakan pilih minimal satu unit kerja pada field 'Kepada'");
      return;
    }

    if (lampiranFile && lampiranFile.size > 5 * 1024 * 1024) {
      alert("Ukuran file lampiran tidak boleh melebihi 5MB");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("tujuan", selectedKepada.join(", "));
      payload.append("dari", dari);
      payload.append("tembusan", tembusan);
      payload.append("sifat_surat", sifatSurat);
      payload.append("perihal", perihal);
      payload.append("isi_surat", isiSurat);
      payload.append("isi_lampiran", JSON.stringify(isiLampiranList));
      payload.append("tanggal_surat", tanggalSurat);
      payload.append("status", "terkirim");
      payload.append("catatan", "");

      if (lampiranFile) {
        payload.append("lampiran", lampiranFile);
      }

      if (formMode === "create") {
        await createNotaDinas(payload);
      } else if (formMode === "edit" && selectedId) {
        await updateNotaDinas(selectedId, payload);
      }

      setViewState("list");
      fetchData();
    } catch (error: any) {
      alert("Gagal menyimpan data. Pastikan semua field telah diisi dengan benar.");
      console.error(error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportNotaDinas({ status: statusFilter });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `nota_dinas_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Export failed", error);
      alert("Gagal mendownload export data.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleKepada = (dept: string) => {
    if (selectedKepada.includes(dept)) {
      setSelectedKepada(selectedKepada.filter((d) => d !== dept));
    } else {
      setSelectedKepada([...selectedKepada, dept]);
    }
  };

  if (!mounted) return null;

  // Preview Screen layout
  if (viewState === "preview" && previewItem) {
    return (
      <div suppressHydrationWarning className="flex flex-col gap-6 max-w-[1200px] mx-auto font-sans bg-slate-100 min-h-screen p-4 md:p-6 pb-20 print:p-0 print:bg-white">
        
        {/* Top bar (Hidden when printing) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewState("list")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              title="Kembali ke Daftar"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-800">Administrasi Surat</h2>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Printer size={14} />
              Print All Documents
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white shadow-sm"
            >
              <Download size={14} />
              Download PDF
            </button>
            <button
              onClick={() => setViewState("list")}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold transition-colors"
            >
              Cancel
            </button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={13} />
              TTE Valid
            </div>
          </div>
        </div>

        {/* Info Notification Bar (Hidden when printing) */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 flex items-center gap-2 print:hidden shadow-sm">
          <span>ⓘ</span>
          <span>You are viewing 2 pages (PAGE and DRAFT views documents). See the layout options to change.</span>
        </div>

        {/* Document Rendered Container */}
        <div className="flex flex-col items-center gap-8 py-4 print:gap-0 print:py-0">
          
          {/* PAGE 1: The Memo */}
          <div className="w-[210mm] min-h-[297mm] bg-white p-[25mm] shadow-lg border border-slate-200 relative flex flex-col justify-between print:shadow-none print:border-none print:p-[20mm]">
            <div>
              {/* Kop Surat */}
              <div className="flex items-center border-b-[3px] border-double border-slate-900 pb-3 mb-5">
                {/* SVG Logo Pemprov Jawa Barat */}
                <div className="w-16 h-16 mr-4 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 5 L85 25 L85 65 C85 80, 65 92, 50 95 C35 92, 15 80, 15 65 L15 25 Z" fill="#1b5e20" />
                    <path d="M50 12 L78 30 L78 63 C78 75, 62 85, 50 88 C38 85, 22 75, 22 63 L22 30 Z" fill="#ffeb3b" />
                    <circle cx="50" cy="50" r="18" fill="#1565c0" />
                    <path d="M50 35 L50 65 M35 50 L65 50" stroke="white" strokeWidth="4" />
                  </svg>
                </div>
                <div className="flex-1 text-center font-sans">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Pemerintah Provinsi Jawa Barat</h3>
                  <h2 className="text-base font-extrabold text-slate-900 uppercase">Dinas Komunikasi Dan Informatika</h2>
                  <p className="text-[10px] text-slate-600 font-medium">Jalan Tamansari No. 55 Kota Bandung, Jawa Barat 40132</p>
                  <p className="text-[10px] text-slate-600 font-medium">Telepon (022) 2502898 Faksimile (022) 2501151</p>
                  <p className="text-[9px] text-blue-600 hover:underline">Laman: https://diskominfo.jabarprov.go.id, Pos-el: diskominfo@jabarprov.go.id</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-950 inline-block pb-0.5">Nota Dinas</h4>
              </div>

              {/* Metadata Block */}
              <table className="w-full text-xs text-slate-800 border-collapse mb-6">
                <tbody>
                  <tr className="align-top">
                    <td className="w-24 py-1">Kepada</td>
                    <td className="w-4 py-1 text-center">:</td>
                    <td className="py-1">
                      {previewItem.tujuan ? (
                        previewItem.tujuan.split(", ").map((t: string, i: number) => (
                          <div key={i} className="font-semibold text-slate-900">
                            {previewItem.tujuan.split(", ").length > 1 ? `${i + 1}. ` : ""}{t}
                          </div>
                        ))
                      ) : "-"}
                    </td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-1">Dari</td>
                    <td className="text-center">:</td>
                    <td className="py-1 font-semibold text-slate-900">{previewItem.dari || "-"}</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-1">Tembusan</td>
                    <td className="text-center">:</td>
                    <td className="py-1 text-slate-700">{previewItem.tembusan || "-"}</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-1">Tanggal</td>
                    <td className="text-center">:</td>
                    <td className="py-1">{formatDate(previewItem.tanggal_surat)}</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-1">Nomor</td>
                    <td className="text-center">:</td>
                    <td className="py-1">{previewItem.nomor_surat}</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-1">Sifat</td>
                    <td className="text-center">:</td>
                    <td className="py-1 font-bold text-slate-900 capitalize">{previewItem.sifat_surat}</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-1">Lampiran</td>
                    <td className="text-center">:</td>
                    <td className="py-1">1 (Satu) berkas</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-1 font-bold">Hal</td>
                    <td className="text-center font-bold">:</td>
                    <td className="py-1 font-bold text-slate-900 underline">{previewItem.perihal}</td>
                  </tr>
                </tbody>
              </table>

              <div className="h-px bg-slate-300 w-full mb-6" />

              {/* Isi Surat */}
              <FormattedContentViewer content={previewItem.isi_surat} />
            </div>

            {/* Signature Block */}
            <div className="flex justify-end mt-12">
              <div className="text-center w-72">
                <p className="text-xs font-bold text-slate-950 uppercase leading-normal">
                  {previewItem.dari}
                </p>
                
                {/* Space for Digital Signature (TTE) */}
                <div className="my-8 flex items-center justify-center">
                  <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50/50 flex flex-col items-center">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">DITANDATANGANI SECARA ELEKTRONIK</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">✓ TTE VALID</span>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block uppercase">
                  PEMERINTAH PROVINSI JAWA BARAT
                </p>
              </div>
            </div>
            
            {/* Page number footer */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-semibold">
              1
            </div>
          </div>

          {/* PAGE 2: The Attachment (Isi Lampiran) */}
          <div className="w-[210mm] min-h-[297mm] bg-white p-[25mm] shadow-lg border border-slate-200 relative flex flex-col justify-between print:shadow-none print:border-none print:p-[20mm]">
            <div>
              {/* Rahasia / Sifat badge in top right */}
              <div className="flex justify-end mb-6">
                <span className="bg-red-600 text-white font-bold text-xs uppercase px-4 py-1.5 rounded shadow-sm tracking-wider">
                  {previewItem.sifat_surat}
                </span>
              </div>

              {/* Attachment Header Metadata */}
              <div className="text-xs text-slate-800 mb-6 flex flex-col gap-1.5 font-sans border-b border-slate-200 pb-4">
                <div className="grid grid-cols-6">
                  <span className="font-semibold col-span-2">LAMPIRAN</span>
                  <span className="col-span-4">: NOTA DINAS {previewItem.dari}</span>
                </div>
                <div className="grid grid-cols-6">
                  <span className="font-semibold col-span-2">NOMOR</span>
                  <span className="col-span-4">: {previewItem.nomor_surat}</span>
                </div>
                <div className="grid grid-cols-6">
                  <span className="font-semibold col-span-2">TANGGAL</span>
                  <span className="col-span-4">: {formatDate(previewItem.tanggal_surat)}</span>
                </div>
                <div className="grid grid-cols-6">
                  <span className="font-semibold col-span-2">HAL</span>
                  <span className="col-span-4 font-bold text-slate-900">: {previewItem.perihal}</span>
                </div>
              </div>

              {/* Blue Banner Title */}
              <div className="bg-blue-600 text-white rounded-lg p-3 text-xs font-bold shadow-sm mb-6 text-center tracking-wide">
                {previewItem.perihal}
              </div>

              {/* Section Header */}
              <h3 className="text-xs font-bold text-slate-900 uppercase mb-4 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">A</span>
                Isi Lampiran
              </h3>

              {/* Attachment content body */}
              <div className="text-xs text-slate-800 leading-relaxed mb-6">
                {(() => {
                  try {
                    const parsed = JSON.parse(previewItem.isi_lampiran);
                    if (Array.isArray(parsed)) {
                      return parsed.map((item, idx) => (
                        <div key={idx} className="mb-4">
                          {parsed.length > 1 && <div className="font-bold mb-1">Lampiran {idx + 1}</div>}
                          <FormattedContentViewer content={item} />
                        </div>
                      ));
                    }
                    return <FormattedContentViewer content={previewItem.isi_lampiran} />;
                  } catch(e) {
                    return <FormattedContentViewer content={previewItem.isi_lampiran} />;
                  }
                })()}
              </div>

              {/* Premium Sampling table matching the screenshot */}
              <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                      <th className="px-3 py-2 text-center w-12 border-r border-slate-300">NO</th>
                      <th className="px-4 py-2 border-r border-slate-300">IP-CLIENT</th>
                      <th className="px-4 py-2 text-center border-r border-slate-300" colSpan={4}>AKSES KE**</th>
                      <th className="px-4 py-2 text-center">AKSES KE**</th>
                    </tr>
                    <tr className="bg-slate-50 border-b border-slate-300 text-slate-600 text-[10px] font-bold text-center">
                      <th className="border-r border-slate-300"></th>
                      <th className="border-r border-slate-300"></th>
                      <th className="border-r border-slate-300 py-1 w-10">A</th>
                      <th className="border-r border-slate-300 py-1 w-10">B</th>
                      <th className="border-r border-slate-300 py-1 w-10">C</th>
                      <th className="border-r border-slate-300 py-1 w-10">D</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-center border-r border-slate-200">1.</td>
                      <td className="px-4 py-2 border-r border-slate-200 font-medium">91.103.251.94 (Yerevan, Armenia)</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">95</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">0</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">0</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">0</td>
                      <td className="px-4 py-2 text-center">57</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-center border-r border-slate-200">2.</td>
                      <td className="px-4 py-2 border-r border-slate-200 font-medium">172.105.40.47 (San Francisco, United States)</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">42</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">0</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">0</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">37</td>
                      <td className="px-4 py-2 text-center">2</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-center border-r border-slate-200">3.</td>
                      <td className="px-4 py-2 border-r border-slate-200 font-medium">178.20.216.222 (Vélizy-Villacoublay, France)</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">34</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">0</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">33</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">0</td>
                      <td className="px-4 py-2 text-center">2</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-center border-r border-slate-200">4.</td>
                      <td className="px-4 py-2 border-r border-slate-200 font-medium">94.102.49.125 (Amsterdam, Netherlands)</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">9</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">1</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">0</td>
                      <td className="px-4 py-2 text-center border-r border-slate-200">0</td>
                      <td className="px-4 py-2 text-center">2</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Explanatory notes */}
              <div className="text-[10px] text-slate-500 space-y-1 font-sans">
                <p className="font-bold">** KETERANGAN AKSES:</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>A : /subdomain.jabarprov.go.id</div>
                  <div>C : /env</div>
                  <div>E : /phpmyadmin</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>B : /~cpanel</div>
                  <div>D : /eval-stdin</div>
                </div>
              </div>

              {/* Sample images placeholder matching the screenshot */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 flex flex-col items-center">
                  <div className="w-full h-24 bg-slate-200 rounded flex items-center justify-center text-[10px] text-slate-400 font-bold mb-1">
                    [IP Map Yerevan]
                  </div>
                  <span className="text-[9px] font-bold text-slate-700">91.103.251.94 (Armenia)</span>
                </div>
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 flex flex-col items-center">
                  <div className="w-full h-24 bg-slate-200 rounded flex items-center justify-center text-[10px] text-slate-400 font-bold mb-1">
                    [IP Map San Francisco]
                  </div>
                  <span className="text-[9px] font-bold text-slate-700">172.105.40.47 (USA)</span>
                </div>
              </div>

            </div>

            {/* Page number footer */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-semibold">
              2
            </div>
          </div>

        </div>

      </div>
    );
  }
  // Form Screen layout
  if (viewState === "form") {
    return (
      <div suppressHydrationWarning className="flex flex-col gap-6 max-w-[1200px] mx-auto font-sans pb-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewState("list")}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors border border-slate-200"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-blue-800">
                {formMode === "create" ? "Buat Nota Dinas Baru" : "Edit Nota Dinas"}
              </h2>
              <p className="text-xs text-slate-500">
                Silakan lengkapi form di bawah ini untuk {formMode === "create" ? "membuat" : "mengubah"} nota dinas.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            {/* Field: Kepada */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">
                Kepada <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsKepadaOpen(!isKepadaOpen)}
                  className="w-full text-left border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none flex justify-between items-center bg-white"
                >
                  <span className={selectedKepada.length > 0 ? "text-slate-800" : "text-slate-400"}>
                    {selectedKepada.length > 0 
                      ? `${selectedKepada.length} unit kerja terpilih` 
                      : "Pilih Tujuan Nota Dinas"}
                  </span>
                  <ChevronDown size={16} className="text-slate-400" />
                </button>
                
                {isKepadaOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 max-h-60 overflow-y-auto">
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <div 
                        key={dept} 
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                        onClick={() => toggleKepada(dept)}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selectedKepada.includes(dept) ? "bg-blue-600 border-blue-600" : "border-slate-300"
                        }`}>
                          {selectedKepada.includes(dept) && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <span className="text-xs text-slate-700 font-medium">{dept}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedKepada.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedKepada.map(dept => (
                    <span key={dept} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                      {dept}
                      <button type="button" onClick={() => toggleKepada(dept)} className="hover:text-red-500 ml-1">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Field: Dari */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  Dari <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dari}
                  onChange={(e) => setDari(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Kepala Bidang Persandian..."
                />
              </div>

              {/* Field: Tanggal */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  Tanggal Surat <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggalSurat}
                  onChange={(e) => setTanggalSurat(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Field: Sifat */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  Sifat Surat <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={sifatSurat}
                  onChange={(e) => setSifatSurat(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white text-slate-700"
                >
                  <option value="biasa">Biasa</option>
                  <option value="penting">Penting</option>
                  <option value="rahasia">Rahasia</option>
                </select>
              </div>

              {/* Field: Tembusan */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Tembusan</label>
                <input
                  type="text"
                  value={tembusan}
                  onChange={(e) => setTembusan(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Tembusan surat..."
                />
              </div>
            </div>

            {/* Field: Perihal */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">
                Perihal (Hal) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={perihal}
                onChange={(e) => setPerihal(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Perihal nota dinas..."
              />
            </div>

            {/* Field: Isi Surat */}
            <RichTextEditor
              label="Isi Surat"
              required
              rows={6}
              value={isiSurat}
              onChange={setIsiSurat}
              placeholder="Tuliskan isi dari nota dinas..."
            />

            {/* Field: Jumlah Lampiran */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">
                Lampiran
              </label>
              <select
                value={jumlahLampiran}
                onChange={(e) => {
                  const num = parseInt(e.target.value);
                  setJumlahLampiran(num);
                  const newList = [...isiLampiranList];
                  if (num > newList.length) {
                    for (let i = newList.length; i < num; i++) newList.push("");
                  } else {
                    newList.length = num;
                  }
                  setIsiLampiranList(newList);
                }}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white text-slate-700"
              >
                <option value={1}>1 (Satu) Berkas</option>
                <option value={2}>2 (Dua) Berkas</option>
                <option value={3}>3 (Tiga) Berkas</option>
                <option value={4}>4 (Empat) Berkas</option>
              </select>
            </div>

            {/* Field: Isi Lampiran (Multiple) */}
            <div className="flex flex-col gap-4">
              {isiLampiranList.map((isi, index) => (
                <RichTextEditor
                  key={index}
                  label={`Isi Lampiran ${jumlahLampiran > 1 ? `${index + 1}` : ""}`}
                  required
                  rows={4}
                  value={isi}
                  onChange={(val) => {
                    const newList = [...isiLampiranList];
                    newList[index] = val;
                    setIsiLampiranList(newList);
                  }}
                  placeholder="Tuliskan isi untuk lampiran di sini..."
                />
              ))}
            </div>

            {/* Field: Lampiran Tambahan */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">
                File Lampiran (Opsional)
              </label>
              <div className="border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 transition-colors">
                <input
                  type="file"
                  id="lampiran-file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setLampiranFile(e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="lampiran-file" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <span className="text-xs font-medium text-blue-600">Klik untuk mengunggah file</span>
                  <span className="text-[10px] text-slate-500 text-center max-w-xs">
                    Format yang didukung: PDF, DOC, DOCX, JPG, PNG (Maks 5MB)
                  </span>
                </label>
                {(lampiranFile || existingLampiranName) && (
                  <div className="mt-2 bg-white px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2 shadow-sm w-full max-w-sm">
                    <FileText size={14} className="text-blue-500" />
                    <span className="truncate flex-1">
                      {lampiranFile ? lampiranFile.name : existingLampiranName}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => { setLampiranFile(null); setExistingLampiranName(""); }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewState("list")}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B3C9B] hover:bg-blue-800 shadow-sm flex items-center gap-2 transition-all"
              >
                <Send size={14} />
                {formMode === "create" ? "Buat Nota Dinas" : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="flex flex-col gap-6 max-w-[1200px] mx-auto font-sans">
      
      {/* ── HEADER CARD ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-blue-800 mb-1">Daftar Nota Dinas</h2>
          <p className="text-xs text-slate-500">
            Kelola dan pantau seluruh surat internal (Nota Dinas) dalam satu dasbor terpadu.
          </p>
        </div>
        <button
          onClick={() => handleOpenForm("create")}
          className="flex items-center justify-center gap-2 bg-[#0B3C9B] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus size={16} />
          Buat Nota Dinas Baru
        </button>
      </div>

      {/* ── FILTER & ACTIONS ── */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari ID, Perihal, atau Tujuan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white"
            >
              <Filter size={14} />
              Filter
              {statusFilter && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px]">{statusFilter}</span>}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg z-20 p-2">
                <p className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">Status</p>
                <button
                  onClick={() => { setStatusFilter(""); setIsFilterOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors ${statusFilter === "" ? "text-blue-600 bg-blue-50/50" : "text-slate-700"}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => { setStatusFilter("draft"); setIsFilterOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors ${statusFilter === "draft" ? "text-blue-600 bg-blue-50/50" : "text-slate-700"}`}
                >
                  Draft
                </button>
                <button
                  onClick={() => { setStatusFilter("menunggu_tte"); setIsFilterOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors ${statusFilter === "menunggu_tte" ? "text-blue-600 bg-blue-50/50" : "text-slate-700"}`}
                >
                  Menunggu TTE
                </button>
                <button
                  onClick={() => { setStatusFilter("terkirim"); setIsFilterOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors ${statusFilter === "terkirim" ? "text-blue-600 bg-blue-50/50" : "text-slate-700"}`}
                >
                  Terkirim
                </button>
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200">
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">Nomor</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-40">ID Nota Dinas</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tujuan</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Perihal</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-36">Status</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-xs text-slate-500 font-medium">Memuat data...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-xs text-slate-500 font-medium">Tidak ada data Nota Dinas</td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-5 py-4 text-xs text-slate-500 font-medium text-center">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-blue-700">
                      <button
                        onClick={() => {
                          setPreviewItem(item);
                          setViewState("preview");
                        }}
                        className="hover:underline text-left cursor-pointer font-bold"
                      >
                        {item.nomor_surat}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-700 font-semibold">{item.tujuan}</td>
                    <td className="px-5 py-4 text-xs text-slate-600 max-w-[250px] truncate" title={item.perihal}>
                      {item.perihal}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                        item.status === 'terkirim' ? 'bg-green-50 text-green-700 border border-green-100' :
                        item.status === 'menunggu_tte' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {item.status === 'terkirim' ? 'Terkirim' :
                         item.status === 'menunggu_tte' ? 'Menunggu TTE' :
                         'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setPreviewItem(item);
                            setViewState("preview");
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenForm("edit", item)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

    </div>
  );
}
