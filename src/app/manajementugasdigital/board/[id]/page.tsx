"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft,
  ChevronDown,
  RefreshCw, 
  SlidersHorizontal,
  X,
  Search,
  Loader2,
  Sliders
} from "lucide-react";
import dynamic from "next/dynamic";
import { useTaskStore, Task } from "@/store/useTaskStore";
import { Avatar } from "@/components/ui/Avatar";
import { showToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TaskDetailModal } from "@/components/manajementugas/TaskDetailModal";
import { updateTask, getJoinRequests, approveJoinRequest, rejectJoinRequest } from "@/services/api";

// Lazy load the KanbanColumn component which automatically handles TaskCard inside it.
const KanbanColumn = dynamic(
  () => import("@/components/manajementugas/KanbanColumn").then((mod) => mod.KanbanColumn),
  { 
    ssr: false, 
    loading: () => <div className="min-h-[480px] bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" /> 
  }
);

export default function KanbanBoardPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = Number(params.id);

  const {
    projects,
    tasks,
    members,
    currentUser,
    loadingTasks,
    fetchTasks,
    fetchProjects,
    addTask,
    modifyTaskStatus,
    assignTask,
    removeTask,
    completeSprint,
    loadCurrentUser,
    addNotification
  } = useTaskStore();

  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom filter and grouping states
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("all");
  const [filterAssignee, setFilterAssignee] = useState<"all" | "unassigned" | number>("all");
  const [groupBy, setGroupBy] = useState<"status" | "priority" | "assignee">("status");
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Drag and Drop States
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  // Sprint Completion States
  const [isCompleteSprintModalOpen, setIsCompleteSprintModalOpen] = useState(false);
  const [isCompletingSprint, setIsCompletingSprint] = useState(false);

  // State for creating a task
  const [activeInputColumn, setActiveInputColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("unassigned");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Join request management states
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [, setLoadingRequests] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);

  // Selected task detail modal states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleUpdateTaskDetails = async (taskId: number, payload: any) => {
    try {
      if (payload.status === "done") {
        const task = tasks.find(t => t.id === taskId);
        if (task?.status !== "inreview") {
          showToast.error("Tugas harus berada di status In Review sebelum dapat diselesaikan.");
          return false;
        }
        const ok = await useTaskStore.getState().approveTask(taskId);
        if (ok) {
          await fetchTasks(projectId);
          const updatedTask = useTaskStore.getState().tasks.find(t => t.id === taskId);
          if (updatedTask) setSelectedTask(updatedTask);
          return true;
        }
        return false;
      }

      const apiPayload = { ...payload };
      if (payload.status) {
        if (payload.status === "inprogress") apiPayload.status = "in_progress";
        else if (payload.status === "inreview") apiPayload.status = "in_review";
      }
      
      const res = await updateTask(taskId, apiPayload);
      if (res && res.success) {
        // Sync store state
        await fetchTasks(projectId);
        
        // Also update the selected task state so the modal updates!
        const updatedTask = useTaskStore.getState().tasks.find(t => t.id === taskId);
        if (updatedTask) {
          setSelectedTask(updatedTask);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to update task", e);
      return false;
    }
  };

  // Open detail modal if task query parameter exists in URL
  const taskQuery = searchParams?.get("task");

  useEffect(() => {
    if (!taskQuery || tasks.length === 0) return;

    const matchedTask = tasks.find(
      (t) => t.id === Number(taskQuery)
    );

    if (matchedTask) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTask(matchedTask);
      setIsDetailModalOpen(true);
    }
  }, [taskQuery, tasks]);

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    // Remove query param task from URL
    const currentParams = new URLSearchParams(searchParams?.toString() || "");
    currentParams.delete("task");
    const newQuery = currentParams.toString();
    router.replace(`/manajementugasdigital/board/${projectId}${newQuery ? `?${newQuery}` : ""}`);
  };

  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === projectId) || null;
  }, [projects, projectId]);

  const isPm = useMemo(() => {
    return currentProject ? (currentProject.created_by === currentUser?.id || currentUser?.role === "admin") : false;
  }, [currentProject, currentUser]);


  useEffect(() => {
    loadCurrentUser();
    fetchProjects();
    fetchTasks(projectId);
  }, [projectId, loadCurrentUser, fetchProjects, fetchTasks]);

  const fetchRequests = async () => {
    if (!projectId) return;
    setLoadingRequests(true);
    try {
      const res = await getJoinRequests(projectId);
      if (res && res.data) {
        setJoinRequests(res.data);
      }
    } catch (err) {
      console.error("Failed fetching join requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (!isPm || !projectId) return;

    const loadRequests = async () => {
      try {
        const res = await getJoinRequests(projectId);

        setJoinRequests(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadRequests();
  }, [isPm, projectId]);

  // Click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) {
        setIsGroupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchTasks(projectId),
      isPm ? fetchRequests() : Promise.resolve()
    ]);
    setIsRefreshing(false);
    showToast.success("Papan disinkronisasi.");
  };

  const handleApproveRequest = async (userId: number) => {
    setProcessingRequestId(userId);
    try {
      const request = joinRequests.find(r => r.user?.id === userId);
      const userName = request?.user?.name || "Anggota";

      const res = await approveJoinRequest(projectId, userId);
      if (res && res.success) {
        showToast.success("Permintaan bergabung disetujui!");
        addNotification("Permintaan Join Disetujui", `Permintaan bergabung dari "${userName}" disetujui.`);
        await Promise.all([
          fetchRequests(),
          fetchTasks(projectId)
        ]);
      } else {
        showToast.error("Gagal menyetujui permintaan.");
      }
    } catch (err) {
      console.error(err);
      showToast.error("Gagal menyetujui permintaan.");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (userId: number) => {
    setProcessingRequestId(userId);
    try {
      const request = joinRequests.find(r => r.user?.id === userId);
      const userName = request?.user?.name || "Anggota";

      const res = await rejectJoinRequest(projectId, userId);
      if (res && res.success) {
        showToast.success("Permintaan bergabung ditolak.");
        addNotification("Permintaan Join Ditolak", `Permintaan bergabung dari "${userName}" ditolak.`);
        await fetchRequests();
      } else {
        showToast.error("Gagal menolak permintaan.");
      }
    } catch (err) {
      console.error(err);
      showToast.error("Gagal menolak permintaan.");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleCreateTask = async (colKey: string) => {
    if (!newTaskTitle.trim()) {
      setActiveInputColumn(null);
      return;
    }

    if (!isPm) {
      showToast.error("Hanya Project Manager yang dapat membuat tugas.");
      return;
    }

    // Guard against double-clicks / multiple submissions
    if (isCreatingTask) return;
    setIsCreatingTask(true);

    try {
      const tAssigneeId = newTaskAssignee === "unassigned" ? null : Number(newTaskAssignee);
      const success = await addTask(projectId, newTaskTitle, newTaskPriority, tAssigneeId, colKey, groupBy);
      
      if (success) {
        setNewTaskTitle("");
        setActiveInputColumn(null);
        showToast.success("Tugas berhasil ditambahkan!");
      } else {
        showToast.error("Gagal membuat tugas.");
      }
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleApproveTask = async (taskId: number) => {
    try {
      const ok = await useTaskStore.getState().approveTask(taskId);
      if (!ok) return;

      await fetchTasks(projectId);

      const updated = useTaskStore.getState().tasks.find((t) => t.id === taskId);
      if (updated) setSelectedTask(updated);

      showToast.success("Task successfully approved.");
    } catch (e: any) {
      if (e?.response?.status === 403) {
        showToast.error("This task has already been completed.");
        return;
      }
      showToast.error("Gagal menyetujui tugas.");
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const isAssignee = task.assigneeId === currentUser?.id;
    if (!isPm && !isAssignee) {
      showToast.error("Anda hanya boleh mengubah status tugas yang ditugaskan kepada Anda.");
      return;
    }

    const nextStatusMap: Record<string, Task["status"]> = {
      todo: "inprogress",
      inprogress: "inreview",
      inreview: "done",
      done: "done" // No next status after done,
    };
    const nextFStatus = nextStatusMap[task.status];

    // HANYA PM yang boleh ke DONE
    if (nextFStatus === "done") {
      if (!isPm) {
        showToast.error("Hanya Project Manager yang dapat menyelesaikan tugas.");
        return;
      }
      handleApproveTask(task.id);
      return;
    }

    const success = await modifyTaskStatus(task, nextFStatus);

    if (success) {
      showToast.success(`Tugas dipindahkan ke status ${nextFStatus === "done" ? "Done" : "To Do"}`);
    } else {
      showToast.error("Gagal mengubah status tugas.");
    }
  };

  const handleMoveStatus = async (
    taskId: number,
    nextStatus: Task["status"]
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const isAssignee = task.assigneeId === currentUser?.id;

    // Member cuma boleh ubah task miliknya
    if (!isPm && !isAssignee) {
      showToast.error("Anda hanya boleh mengubah status tugas yang ditugaskan kepada Anda.");
      return;
    }

    // HANYA PM yang boleh ke DONE
    if (nextStatus === "done") {
      if (!isPm) {
        showToast.error("Hanya Project Manager yang dapat menyelesaikan tugas.");
        return;
      }
      if (task.status !== "inreview") {
        showToast.error("Tugas harus berada di status In Review sebelum dapat diselesaikan.");
        return;
      }
      handleApproveTask(task.id);
      return;
    }

    const success = await modifyTaskStatus(task, nextStatus);

    if (success) {
      showToast.success("Status tugas berhasil diperbarui.");
    } else {
      showToast.error("Gagal mengubah status tugas.");
    }
  };

  const handleAssignTask = async (taskId: number, assigneeId: number | null) => {
    if (!isPm) {
      showToast.error("Hanya Project Manager yang dapat menugaskan anggota.");
      return;
    }

    const success = await assignTask(taskId, assigneeId);
    if (success) {
      showToast.success("Penerima tugas berhasil diperbarui.");
    } else {
      showToast.error("Gagal mengubah penerima tugas.");
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!isPm) {
      showToast.error("Hanya Project Manager yang dapat menghapus tugas.");
      return;
    }

    const success = await removeTask(id);
    if (success) {
      showToast.success("Tugas berhasil dihapus.");
    } else {
      showToast.error("Gagal menghapus tugas.");
    }
  };

  const confirmCompleteSprint = async () => {
    if (!isPm) {
      showToast.error("Hanya Project Manager yang dapat menyelesaikan sprint.");
      return;
    }

    setIsCompletingSprint(true);
    const success = await completeSprint(projectId);
    setIsCompletingSprint(false);
    setIsCompleteSprintModalOpen(false);

    if (success) {
      showToast.success("Sprint berhasil diselesaikan!");
      router.push("/manajementugasdigital");
    } else {
      showToast.error("Gagal menyelesaikan sprint.");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const isAssignee = task.assigneeId === currentUser?.id;
    if (!isPm && !isAssignee) {
      e.preventDefault();
      showToast.error("Anda hanya boleh memindahkan tugas yang ditugaskan kepada Anda.");
      return;
    }

    e.dataTransfer.setData("text/plain", id.toString());
    setDraggingTaskId(id);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    if (draggedOverColumn !== colKey) {
      setDraggedOverColumn(colKey);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const taskIdStr = e.dataTransfer.getData("text/plain");
    const taskId = Number(taskIdStr || draggingTaskId);
    if (!taskId) return;

    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove) return;

    const isAssignee = taskToMove.assigneeId === currentUser?.id;
    if (!isPm && !isAssignee) {
      showToast.error("Anda hanya boleh memindahkan tugas yang ditugaskan kepada Anda.");
      return;
    }

    if (groupBy === "status") {
      const targetStatus = colKey as Task["status"];
      if (taskToMove.status === targetStatus) return;

      // Non-PM: tidak boleh mengubah ke DONE
      if (targetStatus === "done") {
        if (!isPm) {
          showToast.error("Member biasa hanya bisa sampai status In Review.");
          return;
        }
        if (taskToMove.status !== "inreview") {
          showToast.error("Tugas harus berada di status In Review sebelum dapat diselesaikan.");
          return;
        }
        handleApproveTask(taskToMove.id);
        return;
      }

      const success = await modifyTaskStatus(taskToMove, targetStatus);
      if (success) {
        showToast.success("Status tugas berhasil diperbarui.");
      } else {
        showToast.error("Gagal memindahkan tugas.");
      }

    } else if (groupBy === "priority") {
      const targetPriority = colKey as Task["priority"];
      if (taskToMove.priority === targetPriority) return;

      try {
        await updateTask(taskId, { priority: targetPriority });
        showToast.success("Prioritas tugas berhasil diperbarui.");
        await fetchTasks(projectId);
      } catch (err) {
        console.error(err);
        showToast.error("Gagal mengubah prioritas.");
      }
    } else if (groupBy === "assignee") {
      const targetAssigneeId = colKey === "unassigned" ? null : Number(colKey);
      if (taskToMove.assigneeId === targetAssigneeId) return;

      if (!isPm) {
        showToast.error("Hanya Project Manager yang dapat mengubah penerima tugas.");
        return;
      }

      if (taskToMove.status === "inreview") {
        showToast.error("Tidak dapat mengubah penerima tugas saat status In Review.");
        return;
      }

      const success = await assignTask(taskId, targetAssigneeId);
      if (success) {
        showToast.success("Penerima tugas berhasil diperbarui.");
      } else {
        showToast.error("Gagal mengubah penerima tugas.");
      }
    }
  };

  // Filter tasks based on Search, Priority, and Assignee Filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchPriority = filterPriority === "all" || t.priority === filterPriority;
      
      let matchAssignee = true;
      if (filterAssignee !== "all") {
        if (filterAssignee === "unassigned") {
          matchAssignee = t.assigneeId === null;
        } else {
          matchAssignee = t.assigneeId === Number(filterAssignee);
        }
      }
      
      return matchSearch && matchPriority && matchAssignee;
    });
  }, [tasks, searchQuery, filterPriority, filterAssignee]);

  // Determine Columns dynamically based on active GroupBy configuration
  const columns = useMemo(() => {
    if (groupBy === "status") {
      return [
        { key: "todo", label: "TO DO", color: "bg-slate-50 border-slate-100" },
        { key: "inprogress", label: "IN PROGRESS", color: "bg-slate-50 border-slate-100" },
        { key: "inreview", label: "IN REVIEW", color: "bg-slate-50 border-slate-100" },
        { key: "done", label: "DONE", color: "bg-emerald-50/10 border-emerald-100/10", isDone: true }
      ];
    } else if (groupBy === "priority") {
      return [
        { key: "high", label: "HIGH PRIORITY", color: "bg-red-50/15 border-red-100/20" },
        { key: "medium", label: "MEDIUM PRIORITY", color: "bg-amber-50/15 border-amber-100/20" },
        { key: "low", label: "LOW PRIORITY", color: "bg-emerald-50/15 border-emerald-100/20" }
      ];
    } else { // assignee grouping
      const cols = [
        { key: "unassigned", label: "UNASSIGNED", color: "bg-slate-50 border-slate-100" }
      ];
      members.forEach((m) => {
        cols.push({
          key: m.user?.id.toString(),
          label: m.user?.name || "Anggota",
          color: "bg-slate-50 border-slate-100"
        });
      });
      return cols;
    }
  }, [groupBy, members]);

  // Get tasks belonging to a specific column key
  const getTasksForColumn = (colKey: string) => {
    if (groupBy === "status") {
      return filteredTasks.filter(t => t.status === colKey);
    } else if (groupBy === "priority") {
      return filteredTasks.filter(t => t.priority === colKey);
    } else { // assignee
      if (colKey === "unassigned") {
        return filteredTasks.filter(t => t.assigneeId === null);
      } else {
        return filteredTasks.filter(t => t.assigneeId === Number(colKey));
      }
    }
  };

  if (loadingTasks) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 select-none">
        <RefreshCw className="animate-spin text-blue-600 w-9 h-9 stroke-[2.5]" />
        <span className="text-xs font-semibold text-slate-400 tracking-wider">Memuat Papan Kanban...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Figma Kanban Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-100/90 rounded-2xl px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/manajementugasdigital")}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-slate-100 transition-colors"
            title="Kembali ke Daftar Proyek"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-extrabold text-slate-800 tracking-wide leading-none">{currentProject?.name || "Proyek"}</h2>
            <span className="text-[10px] text-slate-400 font-bold tracking-wide mt-1.5 uppercase">Papan Kanban / Sprint Aktif</span>
          </div>
        </div>

        {/* Board Search, Members, Filters & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Real Members Avatars */}
          <button 
            onClick={() => setIsMembersModalOpen(true)}
            className="flex items-center -space-x-1.5 mr-1.5 hover:opacity-80 transition-opacity outline-none"
            title="Daftar Anggota Proyek"
          >
            {members.slice(0, 3).map((m) => (
              <Avatar key={m.id} name={m.user?.name || "User"} size="xs" className="ring-2 ring-white" />
            ))}
            {members.length > 3 && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 ring-2 ring-white text-[9px] font-extrabold text-blue-600">
                +{members.length - 3}
              </div>
            )}
            {members.length === 0 && (
              <span className="text-[10px] text-slate-400 font-medium italic mr-1">No Members</span>
            )}
          </button>

          {isPm && joinRequests.length > 0 && (
            <button
              onClick={() => setIsMembersModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-extrabold rounded-lg hover:bg-amber-100 transition-colors animate-pulse"
              title="Ada permintaan bergabung yang pending"
            >
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              <span>{joinRequests.length} Permintaan Join</span>
            </button>
          )}

          {/* Filter Popover Button */}
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                isFilterOpen || filterPriority !== "all" || filterAssignee !== "all"
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal size={12} />
              <span>Filter</span>
              {(filterPriority !== "all" || filterAssignee !== "all") && (
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full ml-0.5 animate-pulse" />
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 shadow-xl rounded-2xl z-30 p-4 text-left space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Priority</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["all", "high", "medium", "low"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setFilterPriority(p as any)}
                        className={`px-2 py-1.5 text-[10px] font-bold rounded-lg border text-left flex items-center justify-between transition-colors ${
                          filterPriority === p 
                            ? "bg-blue-50 border-blue-200 text-blue-600" 
                            : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="capitalize">{p}</span>
                        {p !== "all" && (
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p === "high" ? "bg-red-500" : p === "medium" ? "bg-amber-500" : "bg-emerald-500"
                          }`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Assignee</span>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    <button
                      onClick={() => setFilterAssignee("all")}
                      className={`w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg text-left ${
                        filterAssignee === "all" ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Semua Anggota
                    </button>
                    <button
                      onClick={() => setFilterAssignee("unassigned")}
                      className={`w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg text-left ${
                        filterAssignee === "unassigned" ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Belum Ditugaskan (Unassigned)
                    </button>
                    {members.map((m) => (
                      <button
                        key={m.user?.id}
                        onClick={() => setFilterAssignee(m.user?.id)}
                        className={`w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg text-left flex items-center gap-2 ${
                          filterAssignee === m.user?.id ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Avatar name={m.user?.name || "User"} size="xs" />
                        <span className="truncate">{m.user?.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-[9px] font-bold">
                  <span className="text-slate-400">Filter Aktif</span>
                  <button
                    onClick={() => {
                      setFilterPriority("all");
                      setFilterAssignee("all");
                      setIsFilterOpen(false);
                      showToast.success("Filter dibersihkan.");
                    }}
                    className="text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Group Popover Button */}
          <div className="relative" ref={groupRef}>
            <button 
              onClick={() => setIsGroupOpen(!isGroupOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                isGroupOpen || groupBy !== "status"
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Sliders size={12} />
              <span>Group: <span className="capitalize">{groupBy}</span></span>
              <ChevronDown size={10} className={`text-slate-400 transition-transform ${isGroupOpen ? "rotate-180" : ""}`} />
            </button>

            {isGroupOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 shadow-xl rounded-2xl z-30 py-1 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                {[
                  { value: "status", label: "Status (Kanban)" },
                  { value: "priority", label: "Priority Level" },
                  { value: "assignee", label: "Assignee" }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setGroupBy(opt.value as any);
                      setIsGroupOpen(false);
                      showToast.success(`Dikelompokkan berdasarkan ${opt.label}`);
                    }}
                    className={`w-full px-4 py-2.5 text-xs font-semibold text-left transition-colors ${
                      groupBy === opt.value 
                        ? "bg-blue-50 text-blue-600 font-bold" 
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Board */}
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            title="Refresh Board"
            disabled={isRefreshing}
          >
            <RefreshCw size={12} className={`text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Complete Sprint (Only PM can see) */}
          {isPm && currentProject?.status !== "completed" && (
            <button 
              onClick={() => setIsCompleteSprintModalOpen(true)}
              className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              Complete sprint
            </button>
          )}
        </div>
      </header>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start overflow-x-auto min-h-[500px]">
        {columns.map((col) => {
          const colTasks = getTasksForColumn(col.key);
          const isOver = draggedOverColumn === col.key;

          return (
              <KanbanColumn
                key={col.key}
                colKey={col.key}
                label={col.label}
                colorClass={col.color || ""}
                isDone={col.isDone}
                tasks={colTasks}
                project={currentProject}
                currentUser={currentUser}
                members={members}
                isOver={isOver}
                activeInputColumn={activeInputColumn}
                newTaskTitle={newTaskTitle}
                newTaskPriority={newTaskPriority}
                newTaskAssignee={newTaskAssignee}
                isCreatingTask={isCreatingTask}
                groupBy={groupBy}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onToggleStatus={handleToggleTaskStatus}
                onApprove={handleApproveTask}
                onMoveStatus={handleMoveStatus}
                onAssign={handleAssignTask}
                onDelete={handleDeleteTask}
                onCreateTask={handleCreateTask}
                onStartCreateTask={(colK) => {
                  setNewTaskTitle("");
                  setNewTaskPriority("medium");
                  setNewTaskAssignee("unassigned");
                  setActiveInputColumn(colK);
                }}
                onCancelCreateTask={() => {
                  setActiveInputColumn(null);
                  setNewTaskTitle("");
                }}
                setNewTaskTitle={setNewTaskTitle}
                setNewTaskPriority={setNewTaskPriority}
                setNewTaskAssignee={setNewTaskAssignee}
                onOpenDetail={(task) => {
                  setSelectedTask(task);
                  setIsDetailModalOpen(true);
                }}
              />
          );
        })}
      </div>

      {/* Complete Sprint Modal */}
      <Modal
        isOpen={isCompleteSprintModalOpen}
        onClose={() => !isCompletingSprint && setIsCompleteSprintModalOpen(false)}
        title="Selesaikan Sprint"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              disabled={isCompletingSprint}
              onClick={() => setIsCompleteSprintModalOpen(false)}
              className="text-xs font-semibold px-4 h-9 border-slate-200"
            >
              Batal
            </Button>
            <Button
              onClick={confirmCompleteSprint}
              disabled={isCompletingSprint}
              className="bg-blue-900 text-white text-xs font-bold px-4 h-9 hover:bg-blue-800"
            >
              {isCompletingSprint ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                "Ya, Selesaikan"
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-left">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menyelesaikan sprint untuk board <strong>{currentProject?.name}</strong>?
          </p>
          <p className="text-[10px] text-slate-400">
            Tindakan ini akan menandai papan sprint ini sebagai selesai (completed) di server, dan Anda akan dialihkan kembali ke daftar proyek utama.
          </p>
        </div>
      </Modal>

      {/* Manage Members and Join Requests Modal */}
      <Modal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        title="Anggota Proyek & Permintaan Bergabung"
        size="md"
        footer={
          <Button
            onClick={() => setIsMembersModalOpen(false)}
            className="bg-slate-900 text-white text-xs font-semibold px-4 h-9 hover:bg-slate-800 rounded-lg"
          >
            Tutup
          </Button>
        }
      >
        <div className="space-y-6 text-left">
          {/* Approved Members List */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Daftar Anggota ({members.length})</h4>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={m.user?.name || "User"} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{m.user?.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{m.user?.email}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-[9px] font-extrabold rounded-md uppercase tracking-wider ${
                    m.role === "pm" 
                      ? "bg-blue-50 text-blue-600 border border-blue-100" 
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}>
                    {m.role === "pm" ? "Project Manager" : "Member"}
                  </span>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-xs text-slate-400 italic">Belum ada anggota.</p>
              )}
            </div>
          </div>

          {/* PM only: Join Requests Section */}
          {isPm && (
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span>Permintaan Bergabung ({joinRequests.length})</span>
                {joinRequests.length > 0 && (
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                )}
              </h4>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {joinRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-2.5 bg-amber-50/20 border border-amber-100/50 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={req.user?.name || "User"} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{req.user?.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{req.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        disabled={processingRequestId !== null}
                        onClick={() => handleApproveRequest(req.user_id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1.5 h-7 rounded-lg"
                      >
                        {processingRequestId === req.user_id ? "..." : "Setuju"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={processingRequestId !== null}
                        onClick={() => handleRejectRequest(req.user_id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-[10px] px-2.5 py-1.5 h-7 rounded-lg bg-white"
                      >
                        Tolak
                      </Button>
                    </div>
                  </div>
                ))}
                {joinRequests.length === 0 && (
                  <p className="text-xs text-slate-400 italic">Tidak ada permintaan bergabung yang pending.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        task={selectedTask}
        project={currentProject}
        currentUser={currentUser}
        members={members}
        onUpdateTask={handleUpdateTaskDetails}
      />
    </div>
  );
}
