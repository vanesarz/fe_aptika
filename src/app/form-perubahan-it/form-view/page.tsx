'use client';

import React, { useState, useEffect, useRef } from 'react';

const inputCls = "block w-full rounded-md border border-[#E2E8F0] bg-[#EFF4FF] px-4 py-3 text-[13px] text-slate-800 placeholder:text-[#94a3b8] focus:border-[#153289] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#153289]";
const labelCls = "mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#1e293b]";
const reqMark = <span className="text-red-600 ml-1">*</span>;

const JENIS_PERMOHONAN_OPTIONS = [
  'I. Permintaan Sub-Domain', 'II. Perbaikan Sistem', 'III. Pembuatan Akun Mail', 'Permintaan Sub-Domain',
  'IV. Reset Password Mail', 'V. Penghapusan Akun Mail', 'VI. Akun Repository', 'VII. SSL',
  'VIII. Deaktivasi Aplikasi', 'IX. Repointing', 'X. Replikasi Aplikasi', 'IV. Reset Password Mail'
];

interface OpdItem {
  id: number;
  name: string;
}

export default function FormView({ onSuccess }: { onSuccess: (data: any) => void }) {
  const [opdList, setOpdList] = useState<OpdItem[]>([]);
  const [loading, setLoading] = useState(false);

  // -- Konfigurasi Base URL --
  const API_BASE_URL = 'http://localhost:8000/api'; 

  // -- State Input Form --
  const [pemohon, setPemohon] = useState('');
  const [unitKerja, setUnitKerja] = useState('');
  const [perangkatDaerahId, setPerangkatDaerahId] = useState('');
  const [emailDinas, setEmailDinas] = useState('');
  const [nomorKontak, setNomorKontak] = useState('');
  
  const [jenisPerubahan, setJenisPerubahan] = useState<string[]>([]);
  const [jenisPermohonan, setJenisPermohonan] = useState<string[]>([]);
  
  const [namaAplikasi, setNamaAplikasi] = useState('');
  const [deskripsiAplikasi, setDeskripsiAplikasi] = useState('');
  const [alamatAplikasi, setAlamatAplikasi] = useState('');
  const [alamatRepository, setAlamatRepository] = useState('');
  
  const [latarBelakang, setLatarBelakang] = useState('');
  const [rincianPerubahan, setRincianPerubahan] = useState('');
  const [risikoTidakDilakukan, setRisikoTidakDilakukan] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [solusiDiharapkan, setSolusiDiharapkan] = useState('');
  const [risikoPerubahan, setRisikoPerubahan] = useState('');
  const [alternatifPerubahan, setAlternatifPerubahan] = useState('');
  const [biayaPerubahan, setBiayaPerubahan] = useState('');
  const [waktuPerubahan, setWaktuPerubahan] = useState('');
  const [perubahanDiharapkan, setPerubahanDiharapkan] = useState(''); 
  
  // -- State Persetujuan Khusus untuk Validasi Backend --
  const [setujuDataBenar, setSetujuDataBenar] = useState(false);
  const [setujuAtasan, setSetujuAtasan] = useState(false);

  // -- State File --
  const [ttdFile, setTtdFile] = useState<File | null>(null);
  const [dokumenFile, setDokumenFile] = useState<File | null>(null);
  const ttdRef = useRef<HTMLInputElement>(null);
  const dokRef = useRef<HTMLInputElement>(null);

  // Fetch Data OPD Saat Komponen Dimuat
  // Fetch Data OPD Saat Komponen Dimuat
  useEffect(() => {
    // Perhatikan perubahan URL di bawah ini, disesuaikan dengan route Laravel Anda
    fetch(`${API_BASE_URL}/form-perubahan-it/opd`) 
      .then(res => {
        if (!res.ok) {
          throw new Error(`Terjadi kesalahan jaringan atau endpoint tidak ditemukan (Status: ${res.status})`);
        }
        return res.json();
      })
      .then(data => setOpdList(data))
      .catch(err => console.error("Gagal load OPD. Pastikan backend Laravel menyala dan route '/api/form-perubahan-it/opd' tersedia.", err));
  }, []);

  const handleCheckboxPermohonan = (val: string) => {
    setJenisPermohonan(prev => 
      prev.includes(val) ? prev.filter(item => item !== val) : [...prev, val]
    );
  };

  const handleRadioPerubahan = (val: string) => {
    setJenisPerubahan([val]); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('pemohon', pemohon);
    formData.append('unit_kerja', unitKerja);
    formData.append('perangkat_daerah_id', perangkatDaerahId);
    formData.append('nomor_kontak', nomorKontak);
    formData.append('email_dinas', emailDinas); 
    
    jenisPerubahan.forEach(val => formData.append('jenis_perubahan[]', val));
    jenisPermohonan.forEach(val => formData.append('jenis_permohonan[]', val));
    
    formData.append('nama_aplikasi', namaAplikasi);
    formData.append('deskripsi_aplikasi', deskripsiAplikasi);
    formData.append('alamat_aplikasi', alamatAplikasi);
    formData.append('alamat_repository', alamatRepository);
    formData.append('latar_belakang', latarBelakang);
    formData.append('rincian_perubahan', rincianPerubahan);
    formData.append('risiko_tidak_dilakukan', risikoTidakDilakukan);
    formData.append('keterangan', keterangan);
    formData.append('solusi_diharapkan', solusiDiharapkan);
    formData.append('risiko_perubahan', risikoPerubahan);
    formData.append('alternatif_perubahan', alternatifPerubahan);
    formData.append('biaya_perubahan', biayaPerubahan);
    formData.append('waktu_perubahan', waktuPerubahan);
    
    // Auto Generate Tanggal Pengajuan Hari Ini
    formData.append('tanggal_permohonan', new Date().toISOString().split('T')[0]);

    // Persetujuan diubah ke string '1' (aturan accepted Laravel)
    formData.append('setuju_data_benar', setujuDataBenar ? '1' : '');
    formData.append('setuju_atasan', setujuAtasan ? '1' : '');

    if (ttdFile) formData.append('tanda_tangan_file', ttdFile);
    if (dokumenFile) formData.append('dokumen_pendukung_file', dokumenFile);

    try {
      const response = await fetch(`${API_BASE_URL}/form-perubahan-it`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // Note: FormData tidak memerlukan Content-Type karena browser secara otomatis menambahkannya beserta boundaries
        },
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        onSuccess(result); // Trigger Halaman Sukses
      } else {
        // Tampilkan pesan error validasi Laravel dengan lebih detail jika ada
        const errorMsg = result.errors 
          ? Object.values(result.errors).flat().join('\n') 
          : (result.error || result.message);
        alert("Gagal mengirim data:\n" + errorMsg);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* --- STEP 1 --- */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 bg-white">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a365d] text-[11px] font-bold text-white">1</span>
          <h2 className="font-bold text-slate-800">Informasi Pemohon</h2>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className={labelCls}>Nama Pemohon {reqMark}</label>
            <input required type="text" className={inputCls} placeholder="Masukkan Nama Pemohon" value={pemohon} onChange={e => setPemohon(e.target.value)} />
          </div>
          <div className="md:col-span-1">
            <label className={labelCls}>Unit Kerja {reqMark}</label>
            <input required type="text" className={inputCls} placeholder="Masukkan Unit Kerja" value={unitKerja} onChange={e => setUnitKerja(e.target.value)} />
          </div>
          <div className="md:col-span-1">
            <label className={labelCls}>Perangkat Daerah {reqMark}</label>
            <select required className={inputCls} value={perangkatDaerahId} onChange={e => setPerangkatDaerahId(e.target.value)}>
              <option value="" disabled>Pilih Perangkat Daerah</option>
              {opdList.map(opd => (
                <option key={opd.id} value={opd.id}>{opd.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className={labelCls}>Email Dinas {reqMark}</label>
            <input required type="email" className={inputCls} placeholder="nama@perangkatdaerah.go.id" value={emailDinas} onChange={e => setEmailDinas(e.target.value)} />
          </div>
          <div className="md:col-span-1">
            <label className={labelCls}>Nomor Surat/Contact Person {reqMark}</label>
            <input required type="text" className={inputCls} placeholder="08xxxxxxxxxx" value={nomorKontak} onChange={e => setNomorKontak(e.target.value)} />
          </div>
        </div>
      </div>

      {/* --- STEP 2 --- */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 bg-white">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a365d] text-[11px] font-bold text-white">2</span>
          <h2 className="font-bold text-slate-800">Informasi Data</h2>
        </div>
        <div className="p-8 space-y-8">
          
          <div>
            <label className={labelCls}>Jenis Perubahan {reqMark}</label>
            <div className="flex flex-wrap gap-8 mt-3">
              {['Permintaan Baru', 'Peningkatan Sistem', 'Perbaikan Sistem'].map(o => (
                <label key={o} className="flex items-center gap-2.5 cursor-pointer text-[13px] text-slate-700">
                  <input required={jenisPerubahan.length === 0} type="radio" name="jenis" className="h-4 w-4 accent-[#153289] border-[#E2E8F0]" 
                         checked={jenisPerubahan.includes(o)} onChange={() => handleRadioPerubahan(o)} /> 
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Jenis Permohonan {reqMark}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              {JENIS_PERMOHONAN_OPTIONS.map((o, idx) => (
                <label key={idx} className={`flex items-center gap-3 cursor-pointer rounded-md border px-4 py-3 transition ${jenisPermohonan.includes(o) ? 'border-blue-500 bg-[#EFF4FF]' : 'border-[#E2E8F0] bg-white hover:bg-slate-50'}`}>
                  <input type="checkbox" className="h-4 w-4 rounded accent-[#153289]" 
                         checked={jenisPermohonan.includes(o)} onChange={() => handleCheckboxPermohonan(o)} /> 
                  <span className="text-[13px] text-slate-700 leading-tight">{o}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1"><label className={labelCls}>Nama Aplikasi {reqMark}</label><input required type="text" className={inputCls} placeholder="Masukkan Nama Aplikasi" value={namaAplikasi} onChange={e => setNamaAplikasi(e.target.value)} /></div>
            <div className="md:col-span-1"><label className={labelCls}>Deskripsi Aplikasi {reqMark}</label><input required type="text" className={inputCls} placeholder="Masukkan Deskripsi Aplikasi" value={deskripsiAplikasi} onChange={e => setDeskripsiAplikasi(e.target.value)} /></div>
            <div className="md:col-span-1"><label className={labelCls}>Alamat Aplikasi {reqMark}</label><input required type="text" className={inputCls} placeholder="https://domain-saat-ini.go.id" value={alamatAplikasi} onChange={e => setAlamatAplikasi(e.target.value)} /></div>
            <div className="md:col-span-1"><label className={labelCls}>Alamat Repository</label><input type="text" className={inputCls} placeholder="https://repository-example.go.id" value={alamatRepository} onChange={e => setAlamatRepository(e.target.value)} /></div>

            <div className="md:col-span-2"><label className={labelCls}>Perubahan Yang Diharapkan {reqMark}</label><input required type="text" className={inputCls} placeholder="Jelaskan Perubahan yang Diharapkan" value={perubahanDiharapkan} onChange={e => setPerubahanDiharapkan(e.target.value)} /></div>
            <div className="md:col-span-2"><label className={labelCls}>Latar Belakang Perubahan {reqMark}</label><input required type="text" className={inputCls} placeholder="Jelaskan Latar Belakang Perubahan" value={latarBelakang} onChange={e => setLatarBelakang(e.target.value)} /></div>

            <div className="md:col-span-2"><label className={labelCls}>Rincian Atas Perubahan Yang Diajukan {reqMark}</label><input required type="text" className={inputCls} placeholder="Jelaskan Rincian Perubahan yang Diajukan" value={rincianPerubahan} onChange={e => setRincianPerubahan(e.target.value)} /></div>
            <div className="md:col-span-1">
              <label className={labelCls}>Risiko Bila Perubahan Tidak Dilakukan {reqMark}</label>
              <select required className={inputCls} value={risikoTidakDilakukan} onChange={e => setRisikoTidakDilakukan(e.target.value)}>
                <option value="" disabled>Pilih Tingkat Risiko</option>
                <option value="Tinggi">Tinggi</option>
                <option value="Sedang">Sedang</option>
                <option value="Rendah">Rendah</option>
              </select>
            </div>
            <div className="md:col-span-1"><label className={labelCls}>Keterangan {reqMark}</label><input required type="text" className={inputCls} placeholder="Masukkan Keterangan Tingkat Risiko" value={keterangan} onChange={e => setKeterangan(e.target.value)} /></div>

            <div className="md:col-span-2"><label className={labelCls}>Solusi Yang Diharapkan {reqMark}</label><input required type="text" className={inputCls} placeholder="Jelaskan Solusi yang Diharapkan" value={solusiDiharapkan} onChange={e => setSolusiDiharapkan(e.target.value)} /></div>
            <div className="md:col-span-1"><label className={labelCls}>Risiko Perubahan {reqMark}</label><input required type="text" className={inputCls} placeholder="Jelaskan Risiko Perubahan" value={risikoPerubahan} onChange={e => setRisikoPerubahan(e.target.value)} /></div>
            <div className="md:col-span-1"><label className={labelCls}>Alternatif Perubahan</label><input type="text" className={inputCls} placeholder="Masukkan Keterangan Alternatif" value={alternatifPerubahan} onChange={e => setAlternatifPerubahan(e.target.value)} /></div>

            <div className="md:col-span-1"><label className={labelCls}>Biaya Perubahan</label><input type="text" className={inputCls} placeholder="Contoh: 10.000.000" value={biayaPerubahan} onChange={e => setBiayaPerubahan(e.target.value)} /></div>
            <div className="md:col-span-1"><label className={labelCls}>Waktu Perubahan</label><input type="text" className={inputCls} placeholder="Masukkan Estimasi Waktu Perubahan" value={waktuPerubahan} onChange={e => setWaktuPerubahan(e.target.value)} /></div>
            <div className="md:col-span-1"><label className={labelCls}>Lampiran</label><input type="text" className={inputCls} placeholder="Jumlah Lampiran" /></div>
          </div>
        </div>
      </div>

      {/* --- STEP 3 --- */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 bg-white">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a365d] text-[11px] font-bold text-white">3</span>
          <h2 className="font-bold text-slate-800">Laporan & Konfirmasi</h2>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            <input type="file" className="hidden" ref={ttdRef} accept=".png,.jpg,.jpeg,.pdf" onChange={e => setTtdFile(e.target.files?.[0] || null)} />
            <input type="file" className="hidden" ref={dokRef} accept=".png,.jpg,.jpeg,.pdf,.zip,.docx" onChange={e => setDokumenFile(e.target.files?.[0] || null)} />

            <div>
              <label className={labelCls}>Upload Tanda Tangan Pemohon {reqMark}</label>
              <div onClick={() => ttdRef.current?.click()} className="mt-2 flex cursor-pointer items-center justify-center gap-4 rounded-md border border-dashed border-[#E2E8F0] bg-[#EFF4FF] px-6 py-6 transition hover:bg-[#e0edff]">
                {ttdFile ? (
                   <span className="text-[13px] font-semibold text-[#153289]">{ttdFile.name}</span>
                ) : (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#153289" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <div className="text-left text-[14px]">
                      <p><span className="font-semibold text-[#153289]">Klik untuk Upload</span> <span className="text-slate-500">atau Seret File Ke Sini</span></p>
                      <p className="mt-0.5 text-[13px] text-slate-400">PDF, PNG, atau JPEG (Maks. 10 MB)</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className={labelCls}>Upload Dokumen Teknis Pendukung</label>
              <div onClick={() => dokRef.current?.click()} className="mt-2 flex cursor-pointer items-center justify-center gap-4 rounded-md border border-dashed border-[#E2E8F0] bg-[#EFF4FF] px-6 py-6 transition hover:bg-[#e0edff]">
                {dokumenFile ? (
                   <span className="text-[13px] font-semibold text-[#153289]">{dokumenFile.name}</span>
                ) : (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#153289" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <div className="text-left text-[14px]">
                      <p><span className="font-semibold text-[#153289]">Klik untuk Upload</span> <span className="text-slate-500">atau Seret File Ke Sini</span></p>
                      <p className="mt-0.5 text-[13px] text-slate-400">PDF, DOCX, PNG, atau ZIP (Maks. 10 MB)</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <label className="flex items-start gap-3 cursor-pointer text-[13px] text-slate-700">
              <input required type="checkbox" className="mt-0.5 h-4 w-4 rounded accent-[#1a365d] border-[#E2E8F0]" 
                     checked={setujuDataBenar} onChange={e => setSetujuDataBenar(e.target.checked)} /> 
              <span>Saya menyatakan bahwa seluruh data yang diisi adalah benar dan dapat dipertanggungjawabkan. {reqMark}</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer text-[13px] text-slate-700">
              <input required type="checkbox" className="mt-0.5 h-4 w-4 rounded accent-[#1a365d] border-[#E2E8F0]" 
                     checked={setujuAtasan} onChange={e => setSetujuAtasan(e.target.checked)} /> 
              <span>Saya telah mendapatkan persetujuan dari atasan/pejabat berwenang untuk pengajuan permohonan ini. {reqMark}</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 pb-10">
        <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#153289] px-8 py-3.5 text-[14px] font-semibold text-white shadow-md transition hover:bg-[#122643] disabled:opacity-50 disabled:cursor-wait">
          {loading ? (
             <span>Mengirim...</span>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              Kirim Permohonan
            </>
          )}
        </button>
      </div>
    </form>
  );
}