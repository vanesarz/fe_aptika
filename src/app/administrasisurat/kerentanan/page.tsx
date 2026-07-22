"use client";

import { useEffect, useState } from "react";
import { 
  TriangleAlert, Eye, Edit, Trash2, Plus, Search, Download, 
  ArrowLeft, Printer
} from "lucide-react";
import { 
  getKerentananList, deleteKerentanan, createKerentanan, 
  updateKerentanan, exportKerentanan 
} from "@/services/api";
import { Pagination } from "@/components/ui/Pagination";

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const SEVERITY_OPTIONS = ["Kritis", "Tinggi", "Sedang", "Rendah"];

export default function KerentananPage() {
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
  const [statusFilter] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Preview State
  const [previewItem, setPreviewItem] = useState<any>(null);

  // Form states
  const [aplikasi, setAplikasi] = useState("");
  const [url, setUrl] = useState("");
  const [tingkatKerentanan, setTingkatKerentanan] = useState("Tinggi");
  const [perihal, setPerihal] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [status, setStatus] = useState("DRAF");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getKerentananList({
        search,
        status: statusFilter,
        page: currentPage,
        per_page: itemsPerPage,
      });
      if (res?.success) {
        setItems(res.data || []);
        setTotalPages(res.meta?.last_page || 1);
      }
    } catch (error) {
      console.error("Failed to fetch Kerentanan data", error);
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
    if (confirm("Apakah Anda yakin ingin menghapus Peringatan Kerentanan ini?")) {
      try {
        await deleteKerentanan(id);
        fetchData();
      } catch (error) {
        alert("Gagal menghapus data");
      }
    }
  };

  const handleOpenForm = (mode: "create" | "edit", data?: any) => {
    setFormMode(mode);
    if (mode === "edit" && data) {
      setSelectedId(data.id);
      setAplikasi(data.aplikasi || "");
      setUrl(data.url || "");
      setTingkatKerentanan(data.tingkat_kerentanan || "Tinggi");
      setPerihal(data.perihal || "");
      setDeskripsi(data.deskripsi || "");
      setTanggal(data.tanggal ? data.tanggal.split("T")[0] : "");
      setStatus(data.status || "DRAF");
    } else {
      setSelectedId(null);
      setAplikasi("");
      setUrl("");
      setTingkatKerentanan("Tinggi");
      setPerihal("Pemberitahuan Celah Keamanan (Vulnerability Advisory)");
      setDeskripsi("");
      setTanggal(new Date().toISOString().split("T")[0]);
      setStatus("DRAF");
    }
    setViewState("form");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        aplikasi,
        url,
        tingkat_kerentanan: tingkatKerentanan,
        perihal,
        deskripsi,
        tanggal,
        status,
      };

      if (formMode === "create") {
        await createKerentanan(payload);
      } else if (formMode === "edit" && selectedId) {
        await updateKerentanan(selectedId, payload);
      }

      setViewState("list");
      fetchData();
    } catch (error: any) {
      const serverMsg = error?.response?.data?.message || (error?.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(", ") : null);
      alert(`Gagal menyimpan data: ${serverMsg || error?.message || "Terjadi kesalahan pada server"}`);
      console.error("Save error:", error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportKerentanan({ status: statusFilter });
      const downloadUrl = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `pemberitahuan_kerentanan_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Export failed", error);
      alert("Gagal mendownload export data.");
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "kritis":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "tinggi":
        return "bg-red-100 text-red-800 border border-red-200";
      case "sedang":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      default:
        return "bg-blue-100 text-blue-800 border border-blue-200";
    }
  };

  if (!mounted) return null;

  // Preview View Render
  if (viewState === "preview" && previewItem) {
    return (
      <div suppressHydrationWarning className="flex flex-col gap-6 max-w-[1200px] mx-auto font-sans bg-slate-100 min-h-screen p-4 md:p-6 pb-20 print:p-0 print:bg-white">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewState("list")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-800">Detail Peringatan Kerentanan</h2>
              <p className="text-xs text-slate-500">{previewItem.nomor_surat}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <Printer size={14} /> Cetak Surat
            </button>
          </div>
        </div>

        {/* Printable Paper */}
        <div className="w-[210mm] min-h-[297mm] bg-white p-[25mm] shadow-lg border border-slate-200 mx-auto relative flex flex-col justify-between print:shadow-none print:border-none print:p-[20mm]">
          <div>
            <div className="flex items-center border-b-[3px] border-double border-slate-900 pb-3 mb-5">
              <div className="flex-grow text-center">
                <h3 className="font-bold text-lg text-slate-900 tracking-wide">PEMERINTAH PROVINSI JAWA BARAT</h3>
                <h4 className="font-extrabold text-xl text-slate-900 tracking-wider">DINAS KOMUNIKASI DAN INFORMATIKA</h4>
                <p className="text-xs text-slate-600 mt-0.5">Jl. H. Juanda No. 28, Citarum, Bandung, Jawa Barat 40115</p>
              </div>
            </div>

            <div className="text-center my-6">
              <h2 className="font-bold text-base text-red-700 uppercase underline decoration-2 underline-offset-4">
                PEMBERITAHUAN KERENTANAN KEAMANAN (VULNERABILITY ADVISORY)
              </h2>
              <p className="text-xs text-slate-700 mt-1">Nomor: {previewItem.nomor_surat}</p>
            </div>

            <div className="text-xs text-slate-800 space-y-3 leading-relaxed">
              <div className="grid grid-cols-[140px_10px_1fr] gap-1">
                <span className="font-semibold">Aplikasi Terdampak</span>
                <span>:</span>
                <span className="font-bold">{previewItem.aplikasi}</span>
              </div>
              <div className="grid grid-cols-[140px_10px_1fr] gap-1">
                <span className="font-semibold">URL / Domain</span>
                <span>:</span>
                <span className="text-blue-600 underline">{previewItem.url || "-"}</span>
              </div>
              <div className="grid grid-cols-[140px_10px_1fr] gap-1">
                <span className="font-semibold">Tingkat Kerentanan</span>
                <span>:</span>
                <span className="font-bold text-red-600">{previewItem.tingkat_kerentanan}</span>
              </div>
              <div className="grid grid-cols-[140px_10px_1fr] gap-1">
                <span className="font-semibold">Tanggal Ditemukan</span>
                <span>:</span>
                <span>{formatDate(previewItem.tanggal)}</span>
              </div>
              <div className="grid grid-cols-[140px_10px_1fr] gap-1">
                <span className="font-semibold">Perihal</span>
                <span>:</span>
                <span>{previewItem.perihal}</span>
              </div>

              <div className="pt-4 border-t border-slate-200 mt-4">
                <h4 className="font-bold text-sm text-slate-900 mb-2">Deskripsi & Imbauan Penanganan:</h4>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 whitespace-pre-wrap font-sans text-xs text-slate-800">
                  {previewItem.deskripsi || "Segera lakukan patching dan langkah mitigasi sesuai prosedur."}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-10">
            <div className="text-center text-xs">
              <p>Bandung, {formatDate(previewItem.tanggal)}</p>
              <p className="font-bold mt-1">Tim Keamanan Informasi (CSIRT)</p>
              <div className="h-16 flex items-center justify-center text-slate-400 italic">
                [Tanda Tangan Elektronik]
              </div>
              <p className="font-bold underline">Diskominfo Jawa Barat</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form View Render
  if (viewState === "form") {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setViewState("list")} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-bold text-slate-800">
              {formMode === "create" ? "Buat Peringatan Kerentanan Baru" : "Edit Peringatan Kerentanan"}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Aplikasi Terdampak *</label>
              <input
                type="text"
                required
                value={aplikasi}
                onChange={(e) => setAplikasi(e.target.value)}
                placeholder="Contoh: Portal Layanan OPD X"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">URL / Domain</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://opd.jabarprov.go.id"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Kerentanan *</label>
              <select
                value={tingkatKerentanan}
                onChange={(e) => setTingkatKerentanan(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal *</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Perihal *</label>
            <input
              type="text"
              required
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              placeholder="Pemberitahuan Celah Keamanan Kritis"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Kerentanan & Langkah Mitigasi</label>
            <textarea
              rows={6}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan detail kerentanan (misal SQL Injection / XSS) dan panduan perbaikan..."
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="DRAF">DRAF</option>
              <option value="TERKIRIM">TERKIRIM</option>
              <option value="TERSOLUSIKAN">TERSOLUSIKAN</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setViewState("list")}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm"
            >
              Simpan Peringatan
            </button>
          </div>
        </form>
      </div>
    );
  }

  // List View Render
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => window.location.href = "/administrasisurat"} className="text-slate-400 hover:text-slate-600">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
              <TriangleAlert size={22} className="text-red-500" />
              Pemberitahuan Kerentanan
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Kelola surat peringatan dini mengenai celah keamanan dan advis keselamatan sistem informasi.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={() => handleOpenForm("create")}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={14} /> Buat Peringatan
          </button>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari aplikasi, nomor, kerentanan..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
              <tr>
                <th className="p-3">No. Surat</th>
                <th className="p-3">Aplikasi</th>
                <th className="p-3">Tingkat Risiko</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-slate-400">Loading data...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-slate-400">Belum ada data kerentanan.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-800">{item.nomor_surat}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{item.aplikasi}</p>
                      <p className="text-[11px] text-slate-400">{item.url || "-"}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadge(item.tingkat_kerentanan)}`}>
                        {item.tingkat_kerentanan || "Sedang"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{formatDate(item.tanggal)}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.status || "DRAF"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setPreviewItem(item);
                            setViewState("preview");
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100"
                          title="Lihat Detail"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenForm("edit", item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100"
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
