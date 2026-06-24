'use client';

import React, { useState, useEffect } from 'react';

// Opsi Checkbox sesuai permintaan
const JENIS_PERUBAHAN_OPTIONS = ['Permintaan Baru', 'Peningkatan Sistem', 'Perbaikan Sistem'];
const JENIS_PERMOHONAN_OPTIONS = [
  'I. Permintaan Sub-Domain',
  'II. Perbaikan Sistem',
  'III. Pembuatan Akun Mail',
  'IV. Reset Password Mail',
  'V. Penghapusan Akun Mail',
  'VI. Akun Repository',
  'VII. SSL',
  'VIII. Deaktivasi Aplikasi',
  'IX. Repointing',
  'X. Replikasi Aplikasi',
];
const KRITERIA_OPTIONS = ['Malapetaka', 'Sangat Berat', 'Berat', 'Agak Berat', 'Tidak Berat'];

export default function FormPerubahanIT() {
  const [opdList, setOpdList] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    pemohon: '',
    unit_kerja: '',
    perangkat_daerah_id: '',
    nomor_kontak: '',
    jenis_perubahan: [] as string[],
    jenis_permohonan: [] as string[],
    nama_aplikasi: '',
    deskripsi_aplikasi: '',
    alamat_aplikasi: '',
    alamat_repository: '',
    latar_belakang: '',
    rincian_perubahan: '',
    risiko_tidak_dilakukan: '',
    kriteria_risiko: [] as string[],
    keterangan: '',
    solusi_diharapkan: '',
    risiko_perubahan: '',
    alternatif_perubahan: '',
    biaya_perubahan: '0',
    waktu_perubahan: '',
    tanggal_permohonan: new Date().toISOString().split('T')[0],
  });

  // Fetch data OPD dari backend saat halaman dimuat
  useEffect(() => {
    const fetchOPD = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/form-perubahan-it/opd`);
        const data = await res.json();
        if (Array.isArray(data)) setOpdList(data);
      } catch (error) {
        console.error('Gagal mengambil data OPD', error);
        // Fallback dummy data jika backend mati
        setOpdList([
          { id: 1, name: 'Dinas Pendidikan' },
          { id: 2, name: 'Diskominfo' },
        ]);
      }
    };
    fetchOPD();
  }, []);

  // Handle Text/Dropdown Inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Checkbox Inputs
  const handleCheckboxChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const currentArr = prev[field] as string[];
      if (currentArr.includes(value)) {
        return { ...prev, [field]: currentArr.filter((item) => item !== value) };
      } else {
        return { ...prev, [field]: [...currentArr, value] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/form-perubahan-it`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Formulir berhasil dikirim! File PDF akan segera diproses.');
        // Reset form jika diperlukan
      } else {
        setMessage('Terjadi kesalahan sistem. Silakan coba lagi.');
      }
    } catch (error) {
      setMessage('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 text-gray-800">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="text-center mb-8 border-b pb-4">
          <h2 className="text-2xl font-bold uppercase tracking-wide">Formulir Perubahan IT</h2>
          <p className="text-sm text-gray-500">No. RFC-019-FR-015</p>
        </div>

        {message && <div className={`p-4 mb-6 rounded ${message.includes('berhasil') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* INFORMASI PEMOHON */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 bg-gray-50 p-2">Informasi Pemohon</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">Pemohon</label>
                <input type="text" name="pemohon" required onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Unit Kerja</label>
                <input type="text" name="unit_kerja" onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Perangkat Daerah (OPD)</label>
                <select name="perangkat_daerah_id" required onChange={handleChange} className="mt-1 block w-full p-2 border rounded bg-white">
                  <option value="">-- Pilih OPD --</option>
                  {opdList.map((opd) => (
                    <option key={opd.id} value={opd.id}>
                      {opd.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Nomor Surat / Contact Person</label>
                <input type="text" name="nomor_kontak" required onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
              </div>
            </div>
          </section>

          {/* INFORMASI DATA (CHECKBOXES) */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 bg-gray-50 p-2">Informasi Data</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Jenis Perubahan</label>
              <div className="flex flex-wrap gap-4">
                {JENIS_PERUBAHAN_OPTIONS.map((opt) => (
                  <label key={opt} className="inline-flex items-center">
                    <input type="checkbox" className="form-checkbox text-indigo-600" checked={formData.jenis_perubahan.includes(opt)} onChange={() => handleCheckboxChange('jenis_perubahan', opt)} />
                    <span className="ml-2 text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Jenis Permohonan</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {JENIS_PERMOHONAN_OPTIONS.map((opt) => (
                  <label key={opt} className="inline-flex items-center">
                    <input type="checkbox" className="form-checkbox text-indigo-600" checked={formData.jenis_permohonan.includes(opt)} onChange={() => handleCheckboxChange('jenis_permohonan', opt)} />
                    <span className="ml-2 text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* DETAIL APLIKASI */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 bg-gray-50 p-2">Detail Aplikasi</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Nama Aplikasi</label>
                <input type="text" name="nama_aplikasi" onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Deskripsi Aplikasi</label>
                <textarea name="deskripsi_aplikasi" rows={2} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Alamat Aplikasi</label>
                  <input type="text" name="alamat_aplikasi" placeholder="https://" onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Alamat Repository</label>
                  <input type="text" name="alamat_repository" placeholder="https://github.com/..." onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
                </div>
              </div>
            </div>
          </section>

          {/* PERUBAHAN YANG DIHARAPKAN */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 bg-gray-50 p-2">Perubahan yang Diharapkan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Latar Belakang Perubahan</label>
                <textarea name="latar_belakang" rows={3} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Rincian atas perubahan yang diajukan</label>
                <textarea name="rincian_perubahan" rows={3} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Risiko terkait bila perubahan tidak dilakukan</label>
                <textarea name="risiko_tidak_dilakukan" rows={3} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Kriteria Risiko</label>
                <div className="flex flex-wrap gap-4">
                  {KRITERIA_OPTIONS.map((opt) => (
                    <label key={opt} className="inline-flex items-center">
                      <input type="checkbox" className="form-checkbox text-indigo-600" checked={formData.kriteria_risiko.includes(opt)} onChange={() => handleCheckboxChange('kriteria_risiko', opt)} />
                      <span className="ml-2 text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* TAMBAHAN */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 bg-gray-50 p-2">Informasi Ekstra</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Keterangan</label>
                <textarea name="keterangan" rows={2} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Solusi yang diharapkan</label>
                <textarea name="solusi_diharapkan" rows={2} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Risiko Perubahan</label>
                <textarea name="risiko_perubahan" rows={2} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Alternatif Perubahan</label>
                <textarea name="alternatif_perubahan" rows={2} onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Biaya Perubahan</label>
                  <input type="text" name="biaya_perubahan" defaultValue="0" onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Waktu Perubahan</label>
                  <input type="text" name="waktu_perubahan" onChange={handleChange} className="mt-1 block w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tanggal Permohonan</label>
                  <input type="date" name="tanggal_permohonan" value={formData.tanggal_permohonan} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded" />
                </div>
              </div>
            </div>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t">
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 font-medium disabled:bg-indigo-400">
              {loading ? 'Menyimpan Data...' : 'Kirim Formulir Pengajuan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
