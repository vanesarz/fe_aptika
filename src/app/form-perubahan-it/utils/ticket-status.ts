export const statusMap: Record<string, { step: number; label: string; badgeClass: string }> = {
  menunggu: {
    step: 1,
    label: 'MENUNGGU VERIFIKASI',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-600',
  },
  verifikasi_admin: {
    step: 2,
    label: 'VERIFIKASI ADMIN',
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-600',
  },
  Disetujui: {
    step: 3,
    label: 'DISETUJUI',
    badgeClass: 'border-green-200 bg-green-50 text-green-600',
  },
  Pengerjaan: {
    step: 4,
    label: 'DALAM PENGERJAAN',
    badgeClass: 'border-purple-200 bg-purple-50 text-purple-600',
  },
  Selesai: {
    step: 5,
    label: 'SELESAI',
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-700',
  },
  Ditolak: {
    step: 1,
    label: 'DITOLAK',
    badgeClass: 'border-red-200 bg-red-50 text-red-600',
  }
};