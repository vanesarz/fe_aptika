'use client';

import React, { useState, useEffect, useRef } from 'react';
import SignaturePad, { SignaturePadRef } from './Signaturepad';

const inputCls = "block w-full rounded-md border border-[#E2E8F0] bg-[#EFF4FF] px-4 py-3 text-[13px] text-slate-800 placeholder:text-[#94a3b8] focus:border-[#153289] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#153289]";
const labelCls = "mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#1e293b]";
const reqMark = <span className="ml-1 text-red-600">*</span>;

const KRITERIA_RISIKO_OPTIONS = ['Malapetaka', 'Sangat Berat', 'Berat', 'Agak Berat', 'Tidak Berat'];

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const API_BASE_URL = 'http://localhost:8000/api'; 

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
  const [kriteriaRisiko, setKriteriaRisiko] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [solusiDiharapkan, setSolusiDiharapkan] = useState('');
  const [risikoPerubahan, setRisikoPerubahan] = useState('');
  const [alternatifPerubahan, setAlternatifPerubahan] = useState('');
  const [biayaPerubahan, setBiayaPerubahan] = useState('');
  const [waktuPerubahan, setWaktuPerubahan] = useState('');
  const [perubahanDiharapkan, setPerubahanDiharapkan] = useState(''); 
  const [setujuDataBenar, setSetujuDataBenar] = useState(false);
  const [setujuAtasan, setSetujuAtasan] = useState(false);

  // State untuk Tanda Tangan (Canvas Curat-Coret)
  const signaturePadRef = useRef<SignaturePadRef>(null);
  const [ttdError, setTtdError] = useState<string>('');

  // State Baru untuk Multi Upload Dokumen (Maks 5)
  const [dokumen, setDokumen] = useState<File[]>([]);
  const [pesanError, setPesanError] = useState<string>("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/form-perubahan-it/opd`) 
      .then(res => res.json())
      .then(data => setOpdList(data))
      .catch(err => console.error(err));
  }, []);

  const handleCheckboxPermohonan = (val: string) => {
    setJenisPermohonan(prev => prev.includes(val) ? prev.filter(item => item !== val) : [...prev, val]);
  };

  const handleRadioPerubahan = (val: string) => {
    setJenisPerubahan([val]); 
  };

  // Handler Multi Upload
  const handleUploadDokumen = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPesanError("");
    const fileTerpilih = e.target.files;
    if (!fileTerpilih) return;

    const arrayFileBaru = Array.from(fileTerpilih);

    if (dokumen.length + arrayFileBaru.length > 5) {
      setPesanError("Maksimal hanya 5 dokumen pendukung yang diperbolehkan.");
      return;
    }

    setDokumen((prev) => [...prev, ...arrayFileBaru]);
    e.target.value = ""; // Reset input
  };

  const hapusDokumen = (indexDihapus: number) => {
    setDokumen((prev) => prev.filter((_, index) => index !== indexDihapus));
    setPesanError("");
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signaturePadRef.current?.isEmpty()) {
      setTtdError('Mohon bubuhkan tanda tangan terlebih dahulu pada kanvas yang tersedia.');
      return;
    }
    setTtdError('');
    setShowConfirmModal(true);
  };

  const executeSubmit = async () => {
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
    if (kriteriaRisiko) formData.append('kriteria_risiko[]', kriteriaRisiko);
    formData.append('keterangan', keterangan);
    formData.append('solusi_diharapkan', solusiDiharapkan);
    formData.append('risiko_perubahan', risikoPerubahan);
    formData.append('alternatif_perubahan', alternatifPerubahan);
    formData.append('biaya_perubahan', biayaPerubahan);
    formData.append('waktu_perubahan', waktuPerubahan);
    
    const today = new Date();
    formData.append('tanggal_permohonan', today.toISOString().split('T')[0]);
    formData.append('setuju_data_benar', setujuDataBenar ? '1' : '');
    formData.append('setuju_atasan', setujuAtasan ? '1' : '');

    // Ambil tanda tangan hasil coretan kanvas sebagai Base64 PNG
    const signatureBase64 = signaturePadRef.current?.getSignature();
    if (signatureBase64) formData.append('tanda_tangan_file', signatureBase64);
    
    // Perubahan di sini: Mengirim array file dokumen
    dokumen.forEach((file) => {
      formData.append('dokumen_pendukung_file[]', file); 
    });

    try {
      const response = await fetch(`${API_BASE_URL}/form-perubahan-it`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });

      const result = await response.json();
      console.log("RESULT BACKEND:", result);
      
      if (response.ok) {
        const selectedOpdName = opdList.find(o => o.id.toString() === perangkatDaerahId)?.name || '-';
        const displayData = {
          ...result,
          formData: {
            tanggalPengajuan: today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            perangkatDaerah: selectedOpdName,
            pemohon: pemohon,
            jenisPermohonan: jenisPermohonan.join(', '),
            namaAplikasi: namaAplikasi,
          }
        };
        setShowConfirmModal(false);
        onSuccess(displayData);
      } else {
        const errorMsg = result.errors ? Object.values(result.errors).flat().join('\n') : (result.error || result.message);
        alert("Gagal mengirim data:\n" + errorMsg);
        setShowConfirmModal(false);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleInitialSubmit} className="relative space-y-6">
        {/* --- STEP 1 --- */}
        <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-100">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a365d] text-[11px] font-bold text-white">1</span>
            <h2 className="font-bold text-slate-800">Informasi Pemohon</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
            <div className="md:col-span-1"><label className={labelCls}>Nama Pemohon {reqMark}</label><input required type="text" className={inputCls} placeholder="Masukkan Nama Pemohon" value={pemohon} onChange={e => setPemohon(e.target.value)} /></div>
            <div className="md:col-span-1"><label className={labelCls}>Unit Kerja {reqMark}</label><input required type="text" className={inputCls} placeholder="Masukkan Unit Kerja" value={unitKerja} onChange={e => setUnitKerja(e.target.value)} /></div>
            <div className="md:col-span-1">
              <label className={labelCls}>Perangkat Daerah {reqMark}</label>
              <select required className={inputCls} value={perangkatDaerahId} onChange={e => setPerangkatDaerahId(e.target.value)}>
                <option value="" disabled>Pilih Perangkat Daerah</option>
                {opdList.map(opd => <option key={opd.id} value={opd.id}>{opd.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-1"><label className={labelCls}>Email Dinas {reqMark}</label><input required type="email" className={inputCls} placeholder="nama@perangkatdaerah.go.id" value={emailDinas} onChange={e => setEmailDinas(e.target.value)} /></div>
            <div className="md:col-span-1"><label className={labelCls}>Nomor Surat/Contact Person {reqMark}</label><input required type="text" className={inputCls} placeholder="08xxxxxxxxxx" value={nomorKontak} onChange={e => setNomorKontak(e.target.value)} /></div>
          </div>
        </div>

        {/* --- STEP 2 --- */}
        <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-100">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a365d] text-[11px] font-bold text-white">2</span>
            <h2 className="font-bold text-slate-800">Informasi Data</h2>
          </div>
          <div className="p-8 space-y-8">
            <div>
              <label className={labelCls}>Jenis Perubahan {reqMark}</label>
              <div className="flex flex-wrap gap-8 mt-3">
                {['Permintaan Baru', 'Peningkatan Sistem', 'Perbaikan Sistem'].map(o => (
                  <label key={o} className="flex items-center gap-2.5 cursor-pointer text-[13px] text-slate-700">
                    <input required={jenisPerubahan.length === 0} type="radio" name="jenis" className="h-4 w-4 accent-[#153289]" checked={jenisPerubahan.includes(o)} onChange={() => handleRadioPerubahan(o)} /> 
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Jenis Permohonan {reqMark}</label>
              <div className="grid grid-cols-1 gap-4 mt-3 sm:grid-cols-2 md:grid-cols-4">
                {JENIS_PERMOHONAN_OPTIONS.map((o, idx) => (
                  <label key={idx} className={`flex items-center gap-3 cursor-pointer rounded-md border px-4 py-3 transition ${jenisPermohonan.includes(o) ? 'border-blue-500 bg-[#EFF4FF]' : 'border-[#E2E8F0] bg-white hover:bg-slate-50'}`}>
                    <input type="checkbox" className="h-4 w-4 rounded accent-[#153289]" checked={jenisPermohonan.includes(o)} onChange={() => handleCheckboxPermohonan(o)} /> 
                    <span className="text-[13px] text-slate-700 leading-tight">{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="md:col-span-1"><label className={labelCls}>Nama Aplikasi {reqMark}</label><input required type="text" className={inputCls} placeholder="Masukkan Nama Aplikasi" value={namaAplikasi} onChange={e => setNamaAplikasi(e.target.value)} /></div>
              <div className="md:col-span-1"><label className={labelCls}>Deskripsi Aplikasi {reqMark}</label><input required type="text" className={inputCls} placeholder="Masukkan Deskripsi Aplikasi" value={deskripsiAplikasi} onChange={e => setDeskripsiAplikasi(e.target.value)} /></div>
              <div className="md:col-span-1"><label className={labelCls}>Alamat Aplikasi {reqMark}</label><input required type="text" className={inputCls} placeholder="https://domain-saat-ini.go.id" value={alamatAplikasi} onChange={e => setAlamatAplikasi(e.target.value)} /></div>
              <div className="md:col-span-1"><label className={labelCls}>Alamat Repository</label><input type="text" className={inputCls} placeholder="https://repository-example.go.id" value={alamatRepository} onChange={e => setAlamatRepository(e.target.value)} /></div>

              <div className="md:col-span-2"><label className={labelCls}>Perubahan Yang Diharapkan {reqMark}</label><input required type="text" className={inputCls} placeholder="Jelaskan Perubahan yang Diharapkan" value={perubahanDiharapkan} onChange={e => setPerubahanDiharapkan(e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelCls}>Latar Belakang Perubahan {reqMark}</label><input required type="text" className={inputCls} placeholder="Jelaskan Latar Belakang Perubahan" value={latarBelakang} onChange={e => setLatarBelakang(e.target.value)} /></div>

              <div className="md:col-span-2"><label className={labelCls}>Rincian Atas Perubahan Yang Diajukan {reqMark}</label><input required type="text" className={inputCls} placeholder="Jelaskan Rincian Perubahan yang Diajukan" value={rincianPerubahan} onChange={e => setRincianPerubahan(e.target.value)} /></div>
                <div className="md:col-span-1">
                <label className={labelCls}>Risiko Bila Perubahan Tidak Dilakukan {reqMark}</label>
                <select required className={inputCls} value={kriteriaRisiko} onChange={e => setKriteriaRisiko(e.target.value)}>
                  <option value="" disabled>Pilih Kriteria Risiko</option>
                  {KRITERIA_RISIKO_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1"><label className={labelCls}>Keterangan {reqMark}</label><input required type="text" className={inputCls} placeholder="Masukkan Keterangan Tingkat Risiko" value={keterangan} onChange={e => setKeterangan(e.target.value)} /></div>

              <div className="md:col-span-2"><label className={labelCls}>Solusi Yang Diharapkan {reqMark}</label><input required type="text" className={inputCls} placeholder="Jelaskan Solusi yang Diharapkan" value={solusiDiharapkan} onChange={e => setSolusiDiharapkan(e.target.value)} /></div>
              <div className="md:col-span-1"><label className={labelCls}>Risiko Perubahan {reqMark}</label><input required type="text" className={inputCls} placeholder="Jelaskan Risiko Perubahan" value={risikoPerubahan} onChange={e => setRisikoPerubahan(e.target.value)} /></div>
              <div className="md:col-span-1"><label className={labelCls}>Alternatif Perubahan</label><input type="text" className={inputCls} placeholder="Masukkan Keterangan Alternatif" value={alternatifPerubahan} onChange={e => setAlternatifPerubahan(e.target.value)} /></div>

              <div className="md:col-span-1"><label className={labelCls}>Biaya Perubahan</label><input type="text" className={inputCls} placeholder="Contoh: 10.000.000" value={biayaPerubahan} onChange={e => setBiayaPerubahan(e.target.value)} /></div>
              <div className="md:col-span-1"><label className={labelCls}>Waktu Perubahan</label><input type="text" className={inputCls} placeholder="Masukkan Estimasi Waktu Perubahan" value={waktuPerubahan} onChange={e => setWaktuPerubahan(e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* --- STEP 3 --- */}
        <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-100">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a365d] text-[11px] font-bold text-white">3</span>
            <h2 className="font-bold text-slate-800">Laporan & Konfirmasi</h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
              {/* Box Tanda Tangan: Kanvas Curat-Coret (Tinta Hitam) */}
              <div>
                <label className={labelCls}>Tanda Tangan Pemohon {reqMark}</label>
                <div className="mt-2">
                  <SignaturePad ref={signaturePadRef} height={180} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[11px] text-slate-400">Gunakan mouse atau jari untuk membubuhkan tanda tangan.</p>
                  <button
                    type="button"
                    onClick={() => { signaturePadRef.current?.clear(); setTtdError(''); }}
                    className="text-[12px] font-semibold text-[#153289] hover:underline shrink-0 ml-3"
                  >
                    Hapus &amp; Ulangi
                  </button>
                </div>
                {ttdError && (
                  <div className="flex items-center gap-2 text-red-600 text-[12px] font-medium bg-red-50 p-3 rounded-lg border border-red-100 mt-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    {ttdError}
                  </div>
                )}
              </div>

              {/* Box Upload Multi Dokumen */}
              <div>
                <label className={labelCls}>Upload Dokumen Pendukung (Maks. 5)</label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center gap-4">
                    <label className={`
                      flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors text-[13px] font-semibold
                      ${dokumen.length >= 5 
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-white border-[#153289] text-[#153289] hover:bg-blue-50'
                      }
                    `}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <span>Pilih Dokumen</span>
                      <input 
                        type="file" 
                        multiple 
                        onChange={handleUploadDokumen} 
                        disabled={dokumen.length >= 5}
                        className="hidden" 
                        accept=".pdf,.png,.jpg,.jpeg,.zip,.docx"
                      />
                    </label>
                    <span className="text-[12px] text-slate-500">
                      {dokumen.length} / 5 dokumen terunggah
                    </span>
                  </div>

                  {pesanError && (
                    <div className="flex items-center gap-2 text-red-600 text-[12px] font-medium bg-red-50 p-3 rounded-lg border border-red-100 w-fit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      {pesanError}
                    </div>
                  )}

                  {dokumen.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 pr-2 mt-4 overflow-y-auto sm:grid-cols-2 max-h-48">
                      {dokumen.map((file, index) => (
                        <div key={index} className="flex items-center justify-between border border-slate-200 rounded-lg p-2.5 bg-white shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded bg-[#EFF4FF] flex items-center justify-center text-[#153289] shrink-0">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-semibold text-slate-800 text-[11px] truncate" title={file.name}>
                                {file.name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => hapusDokumen(index)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors shrink-0"
                            type="button"
                            title="Hapus dokumen"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-4 border-t border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer text-[13px] text-slate-700">
                <input required type="checkbox" className="mt-0.5 h-4 w-4 accent-[#1a365d]" checked={setujuDataBenar} onChange={e => setSetujuDataBenar(e.target.checked)} /> 
                <span>Saya menyatakan bahwa seluruh data yang diisi adalah benar dan dapat dipertanggungjawabkan. {reqMark}</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer text-[13px] text-slate-700">
                <input required type="checkbox" className="mt-0.5 h-4 w-4 accent-[#1a365d]" checked={setujuAtasan} onChange={e => setSetujuAtasan(e.target.checked)} /> 
                <span>Saya telah mendapatkan persetujuan dari atasan/pejabat berwenang untuk pengajuan permohonan ini. {reqMark}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 pb-10">
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#153289] px-8 py-3.5 text-[14px] font-semibold text-white shadow-md transition hover:bg-[#122643]">
            Kirim Permohonan
          </button>
        </div>
      </form>

      {/* --- MODAL KONFIRMASI --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden duration-200 bg-white border shadow-2xl rounded-xl border-slate-100 animate-in zoom-in-95">
            <div className="p-6">
              <h3 className="mb-3 text-lg font-bold tracking-tight text-slate-800">Konfirmasi Permohonan Perubahan TI</h3>
              <p className="text-[14px] text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin mengirim permohonan perubahan TI ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-white border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-50"
              >
                Tidak
              </button>
              <button 
                type="button" 
                onClick={executeSubmit}
                disabled={loading}
                className="rounded-lg bg-[#113289] px-6 py-2 text-[14px] font-semibold text-white shadow-sm hover:bg-[#0e276b] transition disabled:opacity-70 flex items-center gap-2"
              >
                {loading ? 'Mengirim...' : 'Iya, Kirim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}