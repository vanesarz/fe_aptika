"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from "@/services/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

const S = {
  page: { fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "28px" } as React.CSSProperties,
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" } as React.CSSProperties,
  title: { fontSize: "20px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.4px" } as React.CSSProperties,
  sub: { fontSize: "13px", color: "#94a3b8", marginTop: "4px" } as React.CSSProperties,
  card: { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "13px" } as React.CSSProperties,
  th: { backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", padding: "12px 16px", fontWeight: "700", color: "#475569", textAlign: "left" as const, fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" as const } as React.CSSProperties,
  td: { borderBottom: "1px solid #e2e8f0", padding: "14px 16px", color: "#334155", verticalAlign: "middle" } as React.CSSProperties,
  modalOverlay: { position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", width: "450px", maxWidth: "90%", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" } as React.CSSProperties,
  modalTitle: { fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "18px" } as React.CSSProperties,
  formGroup: { marginBottom: "14px" } as React.CSSProperties,
  label: { display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", letterSpacing: "0.8px", textTransform: "uppercase" as const, marginBottom: "6px" } as React.CSSProperties,
  inputWrap: { border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "0 14px", height: "44px", display: "flex", alignItems: "center", background: "#f8fafc" } as React.CSSProperties,
  input: { flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%" } as React.CSSProperties,
  select: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", height: "44px", background: "#f8fafc", fontSize: "13.5px", color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", cursor: "pointer" } as React.CSSProperties,
};

export default function UsersCrudPage() {
  const router = useRouter();
  
  const [authorized, setAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("user");
  const [formIsActive, setFormIsActive] = useState(1);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uStr = localStorage.getItem("user");
      if (!uStr) {
        router.push("/login");
        return;
      }
      try {
        const u = JSON.parse(uStr);
        setCurrentUser(u);
        if (u.role !== "admin") {
          router.push("/rekayasaaplikasi/dashboard");
        } else {
          setAuthorized(true);
        }
      } catch {
        router.push("/login");
      }
    }
  }, [router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch {
      alert("Gagal memuat daftar pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchUsers();
    }
  }, [authorized]);

  const handleOpenAdd = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("user");
    setFormIsActive(1);
    setShowAddModal(true);
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setFormIsActive(Number(user.is_active));
    setShowEditModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPassword) {
      alert("Harap isi semua field wajib.");
      return;
    }
    setSaving(true);
    try {
      await createAdminUser({
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
        is_active: Number(formIsActive)
      });
      setShowAddModal(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal membuat pengguna.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      alert("Nama dan Email wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: formName,
        email: formEmail,
        role: formRole,
        is_active: Number(formIsActive)
      };
      if (formPassword) {
        payload.password = formPassword;
      }
      await updateAdminUser(selectedUser.id, payload);
      
      // Jika mengedit akun sendiri, update localStorage
      if (selectedUser.id === currentUser?.id) {
        const updatedUser = { ...currentUser, name: formName, email: formEmail, role: formRole, is_active: Number(formIsActive) };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }

      setShowEditModal(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal memperbarui pengguna.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: any) => {
    if (user.id === currentUser?.id) {
      alert("Anda tidak dapat menghapus akun Anda sendiri.");
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus akun ${user.name}?`)) {
      return;
    }
    try {
      await deleteAdminUser(user.id);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menghapus pengguna.";
      alert(msg);
    }
  };

  if (!authorized) {
    return <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "28px", color: "#94a3b8" }}>Memeriksa hak akses...</div>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .input-focus:focus-within { border-color: #1d4ed8 !important; background: white !important; box-shadow: 0 0 0 3px rgba(29,78,216,0.09); }
        .select-focus:focus { border-color: #1d4ed8 !important; background: white !important; box-shadow: 0 0 0 3px rgba(29,78,216,0.09); }
      `}</style>

      <div style={S.page}>
        {/* HEADER */}
        <div style={S.header}>
          <div>
            <div style={S.title}>Manajemen Pengguna</div>
            <div style={S.sub}>Kelola akun admin dan user untuk pengisian rekapitulasi data</div>
          </div>
          <Button onClick={handleOpenAdd} variant="default" className="flex items-center">
            <Plus className="w-4 h-4 mr-1.5" /> Tambah Pengguna
          </Button>
        </div>

        {/* LIST TABLE */}
        <div style={S.card}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>Memuat daftar pengguna...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>Belum ada pengguna terdaftar.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Nama</th>
                    <th style={S.th}>Email</th>
                    <th style={S.th}>Role</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={S.td}>
                        <div style={{ fontWeight: "600", color: "#0f172a" }}>{u.name}</div>
                        {u.id === currentUser?.id && (
                          <Badge variant="outline" className="text-[6px] !text-black border-black mt-1 uppercase px-1.5 py-0 font-bold bg-transparent">
                            Akun Anda
                          </Badge>
                        )}
                      </td>
                      <td style={S.td}>{u.email}</td>
                      <td style={S.td}>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                          {u.role}
                        </Badge>
                      </td>
                      <td style={S.td}>
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-900">
                          <span>
                            {Number(u.is_active) === 1 ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                      </td>
                      <td style={S.td}>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleOpenEdit(u)} 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-slate-600 hover:text-slate-900"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          <Button 
                            onClick={() => handleDelete(u)} 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50/50"
                            disabled={u.id === currentUser?.id}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL ADD USER */}
        {showAddModal && (
          <div style={S.modalOverlay}>
            <div style={S.modalContent}>
              <div style={S.modalTitle}>Tambah Pengguna Baru</div>
              <form onSubmit={handleCreate}>
                <div style={S.formGroup}>
                  <label style={S.label}>Nama Lengkap <span style={{ color: "#ef4444" }}>*</span></label>
                  <div style={S.inputWrap} className="input-focus">
                    <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Masukkan nama lengkap" style={S.input} required />
                  </div>
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>Email <span style={{ color: "#ef4444" }}>*</span></label>
                  <div style={S.inputWrap} className="input-focus">
                    <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@domain.com" style={S.input} required />
                  </div>
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>Password <span style={{ color: "#ef4444" }}>*</span></label>
                  <div style={S.inputWrap} className="input-focus">
                    <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Minimal 8 karakter" style={S.input} required />
                  </div>
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>Hak Akses (Role) <span style={{ color: "#ef4444" }}>*</span></label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value)} style={S.select} className="select-focus">
                    <option value="user">User biasa (Hanya CRUD 6 Service)</option>
                    <option value="admin">Admin (CRUD User & CRUD Service)</option>
                  </select>
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>Status Akun <span style={{ color: "#ef4444" }}>*</span></label>
                  <select value={formIsActive} onChange={(e) => setFormIsActive(Number(e.target.value))} style={S.select} className="select-focus">
                    <option value={1}>Aktif (Bisa Login & Input)</option>
                    <option value={0}>Nonaktif (Dilarang Login)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button type="button" onClick={() => setShowAddModal(false)} variant="secondary" className="bg-slate-500 hover:bg-slate-600 text-white border-0">
                    Batal
                  </Button>
                  <Button type="submit" disabled={saving} variant="default">
                    {saving ? "Menyimpan..." : "Tambah Pengguna"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EDIT USER */}
        {showEditModal && (
          <div style={S.modalOverlay}>
            <div style={S.modalContent}>
              <div style={S.modalTitle}>Ubah Detail Pengguna</div>
              <form onSubmit={handleUpdate}>
                <div style={S.formGroup}>
                  <label style={S.label}>Nama Lengkap <span style={{ color: "#ef4444" }}>*</span></label>
                  <div style={S.inputWrap} className="input-focus">
                    <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Masukkan nama" style={S.input} required />
                  </div>
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>Email <span style={{ color: "#ef4444" }}>*</span></label>
                  <div style={S.inputWrap} className="input-focus">
                    <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@domain.com" style={S.input} required />
                  </div>
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>Password Baru <span style={{ color: "#94a3b8", textTransform: "none", fontSize: "10px" }}>(Kosongkan jika tidak diubah)</span></label>
                  <div style={S.inputWrap} className="input-focus">
                    <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Minimal 8 karakter" style={S.input} />
                  </div>
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>Hak Akses (Role) <span style={{ color: "#ef4444" }}>*</span></label>
                  <select 
                    value={formRole} 
                    onChange={(e) => setFormRole(e.target.value)} 
                    style={S.select} 
                    className="select-focus"
                    disabled={selectedUser?.id === currentUser?.id}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  {selectedUser?.id === currentUser?.id && <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "4px" }}>Anda tidak dapat mengubah role Anda sendiri untuk menghindari hilangnya akses admin.</div>}
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>Status Akun <span style={{ color: "#ef4444" }}>*</span></label>
                  <select 
                    value={formIsActive} 
                    onChange={(e) => setFormIsActive(Number(e.target.value))} 
                    style={S.select} 
                    className="select-focus"
                    disabled={selectedUser?.id === currentUser?.id}
                  >
                    <option value={1}>Aktif</option>
                    <option value={0}>Nonaktif</option>
                  </select>
                  {selectedUser?.id === currentUser?.id && <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "4px" }}>Anda tidak dapat menonaktifkan akun Anda sendiri.</div>}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button type="button" onClick={() => setShowEditModal(false)} variant="secondary" className="bg-slate-500 hover:bg-slate-600 text-white border-0">
                    Batal
                  </Button>
                  <Button type="submit" disabled={saving} variant="default">
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
