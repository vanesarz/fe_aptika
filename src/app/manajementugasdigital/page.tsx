"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Globe, 
  Smartphone, 
  Link2, 
  Shield, 
  Plus, 
  MoreVertical, 
  FolderPlus,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui/Toast";
import { getProjects, createProject, joinProject } from "@/services/api";

interface Project {
  id: number;
  name: string;
  description: string;
  manager: string;
  deadline: string;
  members: { name: string; avatarUrl?: string }[];
  totalMembersCount: number;
  isJoined?: boolean;
  type?: "web" | "mobile" | "api" | "security";
}

export default function ManajemenTugasDigitalPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Create Project Modal Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjManager, setNewProjManager] = useState("");
  const [newProjDeadline, setNewProjDeadline] = useState("");
  
  // Validation errors state
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    manager?: string;
    deadline?: string;
  }>({});

  // Join Project confirmation modal state
  const [isJoinConfirmOpen, setIsJoinConfirmOpen] = useState(false);
  const [projectToJoin, setProjectToJoin] = useState<Project | null>(null);
  const [joining, setJoining] = useState(false);

  // Fetch projects from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getProjects();
      if (res && res.data) {
        const mapped = res.data.map((b: any) => ({
          ...b,
          manager: b.pm?.name || "Unknown",
          deadline: b.end_date,
          members: b.members?.map((m: any) => ({ name: m.user?.name || "Member" })) || [],
          totalMembersCount: b.members?.length || 0,
          isJoined: b.members?.length > 0
        }));
        setProjects(mapped);
      } else {
        setProjects([]);
      }
    } catch (err: any) {
      console.error("Gagal mengambil data proyek:", err);
      setError("Gagal memuat daftar proyek. Silakan coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtering
  const filteredProjects = useMemo(() => {
    return projects.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.manager.toLowerCase().includes(search.toLowerCase())
    );
  }, [projects, search]);

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  // Form Validation
  const validateForm = () => {
    const errors: typeof formErrors = {};
    let isValid = true;

    if (!newProjName.trim()) {
      errors.name = "Nama proyek wajib diisi";
      isValid = false;
    } else if (newProjName.trim().length < 3) {
      errors.name = "Nama proyek minimal 3 karakter";
      isValid = false;
    }

    if (!newProjDesc.trim()) {
      errors.description = "Deskripsi proyek wajib diisi";
      isValid = false;
    } else if (newProjDesc.trim().length < 10) {
      errors.description = "Deskripsi proyek minimal 10 karakter";
      isValid = false;
    }

    if (!newProjDeadline) {
      errors.deadline = "Tenggat waktu wajib diisi";
      isValid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(newProjDeadline);
      if (selectedDate < today) {
        errors.deadline = "Tenggat waktu tidak boleh di masa lalu";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Detect type based on keywords
    let pType: "web" | "mobile" | "api" | "security" = "web";
    const lowercaseName = newProjName.toLowerCase();
    if (lowercaseName.includes("mobile") || lowercaseName.includes("app") || lowercaseName.includes("android") || lowercaseName.includes("ios")) {
      pType = "mobile";
    } else if (lowercaseName.includes("api") || lowercaseName.includes("integrasi") || lowercaseName.includes("interop")) {
      pType = "api";
    } else if (lowercaseName.includes("security") || lowercaseName.includes("keamanan") || lowercaseName.includes("audit")) {
      pType = "security";
    }

    const payload = {
      name: newProjName,
      description: newProjDesc,
      deadline: newProjDeadline,
      type: pType
    };

    try {
      const res = await createProject(payload as any);
      // Auto refetch to update table without full reload
      await fetchData();
      
      // Reset form states
      setNewProjName("");
      setNewProjDesc("");
      setNewProjManager("");
      setNewProjDeadline("");
      setFormErrors({});
      setIsModalOpen(false);
      
      showToast.success(`Proyek "${payload.name}" berhasil dibuat!`);
    } catch (err) {
      console.error(err);
      showToast.error("Gagal menyimpan proyek baru.");
    }
  };

  const initiateJoin = (project: Project) => {
    setProjectToJoin(project);
    setIsJoinConfirmOpen(true);
  };

  const confirmJoinRequest = async () => {
    if (!projectToJoin) return;
    setJoining(true);
    try {
      await joinProject(projectToJoin.id);
      // Auto refetch to update table without reload
      await fetchData();
      setIsJoinConfirmOpen(false);
      showToast.success(`Anda berhasil bergabung dengan proyek "${projectToJoin.name}"`);
    } catch (err) {
      console.error(err);
      showToast.error("Gagal bergabung ke proyek.");
    } finally {
      setJoining(false);
      setProjectToJoin(null);
    }
  };

  // Table Columns Definition
  const columns: Column<Project>[] = [
    {
      header: "NOMOR",
      className: "w-16 text-center text-slate-400 font-bold",
      render: (_, __, idx) => (
        <span className="font-semibold text-xs text-slate-400">
          {(currentPage - 1) * itemsPerPage + idx + 1}
        </span>
      ),
    },
    {
      header: "NAMA PROJECT",
      accessor: "name",
      className: "font-semibold text-slate-800",
      render: (val, row) => {
        const IconMap = {
          web: Globe,
          mobile: Smartphone,
          api: Link2,
          security: Shield,
        };
        const Icon = IconMap[row.type as "web" | "mobile" | "api" | "security"] || Globe;
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
              <Icon size={16} />
            </div>
            <div className="flex flex-col text-left">
              {/* Kanban board entrance link */}
              <Link 
                href={`/manajementugasdigital/board/${row.id}`}
                className="text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors hover:underline cursor-pointer"
              >
                {val}
              </Link>
              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] mt-0.5" title={row.description}>
                {row.description}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "PROJECT MANAGER",
      accessor: "manager",
      className: "text-xs font-bold text-slate-600",
    },
    {
      header: "LIST ANGGOTA",
      className: "w-40",
      render: (_, row) => {
        const displayed = row.members ? row.members.slice(0, 3) : [];
        const totalCount = row.totalMembersCount || (row.members ? row.members.length : 0);
        const extra = totalCount - displayed.length;
        return (
          <div className="flex items-center -space-x-1.5">
            {displayed.map((m, i) => (
              <Avatar
                key={i}
                name={m.name}
                size="xs"
                className="ring-2 ring-white"
              />
            ))}
            {extra > 0 && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 ring-2 ring-white text-[9px] font-extrabold text-blue-600 select-none">
                +{extra}
              </div>
            )}
            {totalCount === 0 && (
              <span className="text-[11px] text-slate-400 font-medium italic">Belum ada</span>
            )}
          </div>
        );
      },
    },
    {
      header: "AKSI",
      className: "w-24 text-center",
      render: (_, row) => {
        if (row.isJoined) {
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
              Joined
            </span>
          );
        }
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => initiateJoin(row)}
            className="border-slate-200 text-xs font-bold px-4 py-1.5 h-8 bg-blue-900 text-white rounded-lg hover:bg-blue-800 hover:text-white"
          >
            Join
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100/80 rounded-2xl p-4 shadow-sm">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          onClear={() => setSearch("")}
          placeholder="Cari proyek atau tugas..."
          className="max-w-md bg-slate-50/50"
        />

        <Button
          onClick={() => {
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md shadow-orange-500/20 hover:scale flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={16} />
          Tambah Proyek
        </Button>
      </div>

      {/* Main Table Content */}
      {error ? (
        <Card hoverable={false} className="border-red-100 bg-red-50/20 py-8 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <AlertTriangle className="text-red-500 w-8 h-8" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Terjadi Kesalahan</h3>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
            </div>
            <Button size="sm" onClick={fetchData} className="mt-2 bg-slate-900 text-white">
              Coba Lagi
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          title="Daftar Proyek Utama"
          headerActions={
            <button 
              onClick={fetchData} 
              className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
              title="Refresh Data"
            >
              <MoreVertical size={16} />
            </button>
          }
          hoverable={false}
          className="shadow-sm border border-slate-100"
        >
          <div className="-mx-6 -my-5 flex flex-col">
            <Table
              columns={columns}
              data={paginatedProjects}
              loading={loading}
              emptyText="Tidak ada proyek ditemukan."
              className="border-0 rounded-none shadow-none"
            />
            {!loading && filteredProjects.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredProjects.length}
                itemsPerPage={itemsPerPage}
                className="border-0 border-t border-slate-100 rounded-none"
              />
            )}
          </div>
        </Card>
      )}

      {/* Reusable Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Proyek Baru"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="text-xs font-semibold px-4 h-9 border-slate-200"
            >
              Batal
            </Button>
            <Button
              onClick={handleCreateProject}
              className="bg-slate-900 text-white text-xs font-semibold px-4 h-9"
            >
              Simpan Proyek
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100/60 rounded-xl mb-2">
            <FolderPlus className="text-blue-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="text-xs font-bold text-slate-800">Tambahkan Proyek Aptika</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Seluruh developer di tim Anda dapat bergabung dan melacak tugasnya secara kolaboratif.</p>
            </div>
          </div>

          <Input
            label="Nama Proyek"
            placeholder="Masukkan nama proyek utama..."
            value={newProjName}
            onChange={(e) => {
              setNewProjName(e.target.value);
              if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
            }}
            error={formErrors.name}
            required
          />

          <Input
            textarea
            rows={3}
            label="Deskripsi Proyek"
            placeholder="Tuliskan deskripsi singkat mengenai target, ruang lingkup, atau detail proyek..."
            value={newProjDesc}
            onChange={(e) => {
              setNewProjDesc(e.target.value);
              if (formErrors.description) setFormErrors({ ...formErrors, description: undefined });
            }}
            error={formErrors.description}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Project Manager"
              placeholder="Nama PM..."
              value={newProjManager}
              onChange={(e) => {
                setNewProjManager(e.target.value);
                if (formErrors.manager) setFormErrors({ ...formErrors, manager: undefined });
              }}
              error={formErrors.manager}
              required
            />

            <Input
              type="date"
              label="Tenggat Waktu"
              value={newProjDeadline}
              onChange={(e) => {
                setNewProjDeadline(e.target.value);
                if (formErrors.deadline) setFormErrors({ ...formErrors, deadline: undefined });
              }}
              error={formErrors.deadline}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Join Project Confirmation Modal */}
      <Modal
        isOpen={isJoinConfirmOpen}
        onClose={() => {
          if (!joining) {
            setIsJoinConfirmOpen(false);
            setProjectToJoin(null);
          }
        }}
        title="Konfirmasi Join Proyek"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              disabled={joining}
              onClick={() => {
                setIsJoinConfirmOpen(false);
                setProjectToJoin(null);
              }}
              className="text-xs font-semibold px-4 h-9 border-slate-200"
            >
              Batal
            </Button>
            <Button
              disabled={joining}
              onClick={confirmJoinRequest}
              className="bg-blue-900 text-white text-xs font-bold px-4 h-9 hover:bg-blue-800"
            >
              {joining ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                "Ya, Bergabung"
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-left">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin bergabung sebagai anggota dalam proyek <strong>{projectToJoin?.name}</strong>?
          </p>
          <p className="text-[10px] text-slate-400">
            Setelah bergabung, nama Anda akan terdaftar sebagai anggota proyek ini, dan Anda akan dapat mengelola papan Kanban untuk tugas-tugas di dalamnya.
          </p>
        </div>
      </Modal>
    </div>
  );
}
