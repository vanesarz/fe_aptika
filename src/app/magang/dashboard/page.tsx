"use client";

import { useEffect, useState } from "react";
import { Users, Eye, Edit, Trash2, Plus } from "lucide-react";
import { getMagangList, deleteMagang, createMagang, updateMagang } from "@/services/api";
import { Modal } from "@/components/ui/Modal";

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function MagangDashboard() {
  const [magangs, setMagangs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "add">("add");
  const [selectedMagang, setSelectedMagang] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    nama: "",
    nama_kampus: "",
    tgl_mulai_magang: "",
    tgl_selesai_magang: "",
    sertifikat: "Belum menerima",
    keterangan: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  // Compute status magang otomatis berdasarkan tanggal
  const computeStatusMagang = (tglMulai: string, tglSelesai: string) => {
    if (!tglMulai || !tglSelesai) return "-";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(tglMulai);
    start.setHours(0, 0, 0, 0);
    const end = new Date(tglSelesai);
    end.setHours(0, 0, 0, 0);

    if (today < start) return "Belum mulai";
    if (today > end) return "Selesai magang";
    return "Sedang magang";
  };

  const currentStatus = computeStatusMagang(formData.tgl_mulai_magang, formData.tgl_selesai_magang);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMagangList();
      if (res?.data) {
        setMagangs(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch magang data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
      try {
        await deleteMagang(id);
        fetchData();
      } catch (error) {
        alert("Gagal menghapus data");
      }
    }
  };

  const handleOpenModal = (mode: "view" | "edit" | "add", data?: any) => {
    setModalMode(mode);
    setSelectedMagang(data || null);
    if (data && mode !== "add") {
      setFormData({
        nama: data.nama || "",
        nama_kampus: data.nama_kampus || "",
        tgl_mulai_magang: data.tgl_mulai || "",
        tgl_selesai_magang: data.tgl_selesai || "",
        sertifikat: data.sertifikat || "Belum menerima",
        keterangan: data.keterangan || "",
      });
      setCvFile(null);
    } else {
      setFormData({
        nama: "",
        nama_kampus: "",
        tgl_mulai_magang: "",
        tgl_selesai_magang: "",
        sertifikat: "Belum menerima",
        keterangan: "",
      });
      setCvFile(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi file size maksimal 2MB
    if (cvFile && cvFile.size > 2 * 1024 * 1024) {
      alert("Ukuran file CV Magang tidak boleh melebihi 2MB");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("nama", formData.nama);
      payload.append("nama_kampus", formData.nama_kampus);
      payload.append("tgl_mulai_magang", formData.tgl_mulai_magang);
      payload.append("tgl_selesai_magang", formData.tgl_selesai_magang);
      payload.append("sertifikat", formData.sertifikat);
      if (formData.keterangan) payload.append("keterangan", formData.keterangan);

      if (cvFile) {
        payload.append("cv_magang", cvFile);
      }

      if (modalMode === "add") {
        await createMagang(payload);
      } else if (modalMode === "edit" && selectedMagang) {
        await updateMagang(selectedMagang.id, payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      if (error?.response?.status === 413) {
        alert("Gagal menyimpan data: Ukuran file terlalu besar (Maksimal 2MB)");
      } else if (error?.response?.data?.message) {
        alert(`Gagal menyimpan data: ${error.response.data.message}`);
      } else {
        alert("Gagal menyimpan data. Pastikan semua field telah diisi dengan benar.");
      }
      console.error(error);
    }
  };

  const activeMagangs = magangs.filter(m => m.status_magang === 'Sedang magang').length;

  return (
    <div className="p-6 max-w-[1200px] mx-auto font-sans">

      {/* ── STATISTIC CARD ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Anak Magang</p>
            <h3 className="text-3xl font-extrabold text-slate-900">{magangs.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Sedang Magang</p>
            <h3 className="text-3xl font-extrabold text-slate-900">{activeMagangs}</h3>
          </div>
        </div>
      </div>

      {/* ── HEADER ACTION ── */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">Daftar Anak Magang</h2>
        <button
          onClick={() => handleOpenModal("add")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
        >
          <Plus size={18} />
          Tambah Data Magang
        </button>
      </div>

      {/* ── TABLE DASHBOARD ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-10 text-center">No</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Kampus</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Periode</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Magang</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Sertifikat</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">Memuat data...</td>
                </tr>
              ) : magangs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">Tidak ada data magang</td>
                </tr>
              ) : (
                magangs.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-3 text-sm text-slate-500 font-medium text-center">{idx + 1}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-slate-800">{item.nama}</td>
                    <td className="px-3 py-3 text-sm text-slate-600">{item.nama_kampus}</td>
                    <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(item.tgl_mulai)} - {formatDate(item.tgl_selesai)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${item.status_magang === 'Sedang magang' ? 'bg-blue-100 text-blue-800' :
                          item.status_magang === 'Selesai magang' ? 'bg-green-100 text-green-800' :
                            'bg-slate-100 text-slate-800'
                        }`}>
                        {item.status_magang}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${item.sertifikat === 'Sudah menerima' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {item.sertifikat || 'Belum menerima'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleOpenModal("view", item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleOpenModal("edit", item)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL FORM ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "Tambah Data Magang" : modalMode === "edit" ? "Edit Data Magang" : "Detail Anak Magang"}
        size="lg"
      >
        {modalMode === "view" && selectedMagang ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Nama</span>
              <span className="col-span-2 font-semibold text-slate-900">{selectedMagang.nama}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Kampus</span>
              <span className="col-span-2 font-semibold text-slate-900">{selectedMagang.nama_kampus}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Tgl Mulai</span>
              <span className="col-span-2 font-semibold text-slate-900">{formatDate(selectedMagang.tgl_mulai)}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Tgl Selesai</span>
              <span className="col-span-2 font-semibold text-slate-900">{formatDate(selectedMagang.tgl_selesai)}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="col-span-2 font-semibold text-slate-900">{selectedMagang.status_magang}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Sertifikat</span>
              <span className="col-span-2 font-semibold text-slate-900">{selectedMagang.sertifikat}</span>
            </div>
            <div className="grid grid-cols-3 pb-3">
              <span className="text-slate-500 font-medium">CV Magang</span>
              <span className="col-span-2 font-semibold text-blue-600 hover:underline">
                {selectedMagang.cv_magang ? <a href={selectedMagang.cv_magang} target="_blank" rel="noreferrer">Lihat File</a> : "-"}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Masukkan nama"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kampus / Sekolah</label>
                <input
                  type="text"
                  required
                  value={formData.nama_kampus}
                  onChange={(e) => setFormData({ ...formData, nama_kampus: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Masukkan institusi"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  required
                  value={formData.tgl_mulai_magang}
                  onChange={(e) => setFormData({ ...formData, tgl_mulai_magang: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  required
                  value={formData.tgl_selesai_magang}
                  onChange={(e) => setFormData({ ...formData, tgl_selesai_magang: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Magang</label>
                <div className={`w-full rounded-lg px-3 py-2 text-sm font-semibold border ${
                  currentStatus === 'Sedang magang' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  currentStatus === 'Selesai magang' ? 'bg-green-50 text-green-700 border-green-200' :
                  currentStatus === 'Belum mulai' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                  'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {currentStatus}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Sertifikat</label>
                <select
                  required
                  value={formData.sertifikat}
                  onChange={(e) => setFormData({ ...formData, sertifikat: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="Belum menerima">Belum menerima</option>
                  <option value="Sudah menerima">Sudah menerima</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Upload CV (PDF/JPG/PNG)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required={modalMode === "add"}
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-slate-200 rounded-xl p-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan (Opsional)</label>
              <textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                rows={3}
                placeholder="Masukkan keterangan jika ada..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                Simpan Data
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
