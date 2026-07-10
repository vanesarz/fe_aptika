"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft,
  ChevronUp, 
  ChevronDown,
  Plus, 
  RefreshCw, 
  SlidersHorizontal,
  LayoutGrid,
  List,
  MoreVertical,
  CheckSquare,
  Square,
  CheckCircle2,
  X,
  Search,
  Loader2,
  Trash2,
  Sliders
} from "lucide-react";
import { getProjects, getTasks, createTask, updateTaskStatus, deleteTask, getBoardMembers, updateTask, updateBoard } from "@/services/api";
import { Avatar } from "@/components/ui/Avatar";
import { showToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface Task {
  id: number;
  title: string;
  code: string;
  priority: "high" | "medium" | "low";
  assigneeName: string | null;
  assigneeId: number | null;
  status: "todo" | "inprogress" | "inreview" | "done";
}

const mapBackendToFrontendTask = (t: any): Task => {
  let fStatus: Task["status"] = "todo";
  if (t.status === "in_progress") fStatus = "inprogress";
  else if (t.status === "in_review") fStatus = "inreview";
  else if (t.status === "done") fStatus = "done";

  return {
    id: t.id,
    title: t.title,
    code: `SCRUM-${t.id}`,
    priority: t.priority || "medium",
    assigneeName: t.assignee?.name || null,
    assigneeId: t.assigned_to || null,
    status: fStatus
  };
};

const mapFrontendToBackendStatus = (status: Task["status"]): "todo" | "in_progress" | "in_review" | "done" => {
  if (status === "inprogress") return "in_progress";
  if (status === "inreview") return "in_review";
  return status;
};

const priorityConfig = {
  high: { color: "text-red-600 bg-red-50 border-red-100", label: "High", icon: ChevronUp },
  medium: { color: "text-amber-600 bg-amber-50 border-amber-100", label: "Medium", icon: ChevronUp },
  low: { color: "text-emerald-600 bg-emerald-50 border-emerald-100", label: "Low", icon: ChevronDown },
};

export default function KanbanBoardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);

  const [projectName, setProjectName] = useState("Proyek");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Card drop down menu state
  const [activeCardMenu, setActiveCardMenu] = useState<number | null>(null);
  const cardMenuRef = useRef<HTMLDivElement>(null);
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

  const fetchTasks = async () => {
    try {
      const res = await getTasks(projectId);
      if (res && res.data) {
        setTasks(res.data.map(mapBackendToFrontendTask));
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Gagal mengambil data tugas:", err);
      showToast.error("Gagal memuat tugas.");
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [projRes, membersRes] = await Promise.all([
        getProjects(),
        getBoardMembers(projectId)
      ]);
      if (projRes && projRes.data) {
        const currentProject = projRes.data.find((p: any) => p.id === projectId);
        if (currentProject) {
          setProjectName(currentProject.name);
        }
      }
      if (membersRes && membersRes.data) {
        const acceptedMembers = membersRes.data.filter((m: any) => m.membership_status === "joined");
        setMembers(acceptedMembers);
      }
      await fetchTasks();
    } catch (err) {
      console.error("Gagal memuat data board:", err);
      showToast.error("Gagal memuat detail board.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [projectId]);

  // Click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardMenuRef.current && !cardMenuRef.current.contains(e.target as Node)) {
        setActiveCardMenu(null);
      }
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
    try {
      await Promise.all([
        fetchTasks(),
        getBoardMembers(projectId).then(res => {
          if (res && res.data) {
            const accepted = res.data.filter((m: any) => m.membership_status === "joined");
            setMembers(accepted);
          }
        })
      ]);
      showToast.success("Papan disinkronisasi.");
    } catch (err) {
      console.error(err);
      showToast.error("Gagal menyinkronkan papan.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateTask = async (colKey: string) => {
    if (!newTaskTitle.trim()) {
      setActiveInputColumn(null);
      return;
    }

    let taskStatus: "todo" | "in_progress" | "in_review" | "done" = "todo";
    let taskPriority: "low" | "medium" | "high" = "medium";
    let taskAssigneeId: number | null = null;

    if (groupBy === "status") {
      taskStatus = mapFrontendToBackendStatus(colKey as Task["status"]);
      taskPriority = newTaskPriority;
      taskAssigneeId = newTaskAssignee === "unassigned" ? null : Number(newTaskAssignee);
    } else if (groupBy === "priority") {
      taskStatus = "todo";
      taskPriority = colKey as "low" | "medium" | "high";
      taskAssigneeId = newTaskAssignee === "unassigned" ? null : Number(newTaskAssignee);
    } else { // assignee
      taskStatus = "todo";
      taskPriority = newTaskPriority;
      taskAssigneeId = colKey === "unassigned" ? null : Number(colKey);
    }

    try {
      await createTask({
        board_id: projectId,
        title: newTaskTitle.trim(),
        priority: taskPriority,
        status: taskStatus,
        assigned_to: taskAssigneeId
      });
      setNewTaskTitle("");
      setActiveInputColumn(null);
      showToast.success("Tugas berhasil ditambahkan!");
      await fetchTasks();
    } catch (err) {
      console.error(err);
      showToast.error("Gagal membuat tugas.");
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatusMap: Record<string, Task["status"]> = {
      todo: "done",
      inprogress: "done",
      inreview: "done",
      done: "todo",
    };
    const nextFStatus = nextStatusMap[task.status];
    const prevTasks = [...tasks];

    // Optimistic Update
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: nextFStatus } : t));

    try {
      await updateTaskStatus(task.id, mapFrontendToBackendStatus(nextFStatus));
      showToast.success(`Tugas berhasil dipindahkan ke ${nextFStatus === "done" ? "Done" : "To Do"}`);
    } catch (err) {
      console.error(err);
      setTasks(prevTasks);
      showToast.error("Gagal memindahkan tugas.");
    }
  };

  const handleMoveStatus = async (taskId: number, nextStatus: Task["status"]) => {
    const prevTasks = [...tasks];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));
    try {
      await updateTaskStatus(taskId, mapFrontendToBackendStatus(nextStatus));
      showToast.success("Status tugas berhasil diperbarui.");
    } catch (err) {
      console.error(err);
      setTasks(prevTasks);
      showToast.error("Gagal mengubah status tugas.");
    }
  };

  const handleAssignTask = async (taskId: number, assigneeId: number | null) => {
    const prevTasks = [...tasks];
    let targetName = null;
    if (assigneeId) {
      const m = members.find(member => member.user?.id === assigneeId);
      targetName = m?.user?.name || null;
    }

    setTasks(tasks.map(t => t.id === taskId ? { ...t, assigneeId, assigneeName: targetName } : t));
    try {
      await updateTask(taskId, { assigned_to: assigneeId });
      showToast.success("Penerima tugas berhasil diperbarui.");
    } catch (err) {
      console.error(err);
      setTasks(prevTasks);
      showToast.error("Gagal mengubah penerima tugas.");
    }
  };

  const handleDeleteTask = async (id: number) => {
    const prevTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== id));
    try {
      await deleteTask(id);
      showToast.success("Tugas berhasil dihapus.");
    } catch (err) {
      console.error(err);
      setTasks(prevTasks);
      showToast.error("Gagal menghapus tugas.");
    }
  };

  const confirmCompleteSprint = async () => {
    setIsCompletingSprint(true);
    try {
      await updateBoard(projectId, { status: "completed" });
      showToast.success("Sprint berhasil diselesaikan!");
      setIsCompleteSprintModalOpen(false);
      router.push("/manajementugasdigital");
    } catch (err) {
      console.error(err);
      showToast.error("Gagal menyelesaikan sprint.");
    } finally {
      setIsCompletingSprint(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: number) => {
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

    const prevTasks = [...tasks];

    if (groupBy === "status") {
      const targetStatus = colKey as Task["status"];
      if (taskToMove.status === targetStatus) return;

      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));
      try {
        await updateTaskStatus(taskId, mapFrontendToBackendStatus(targetStatus));
        showToast.success("Status tugas berhasil diperbarui.");
      } catch (err) {
        console.error(err);
        setTasks(prevTasks);
        showToast.error("Gagal memindahkan tugas.");
      }
    } else if (groupBy === "priority") {
      const targetPriority = colKey as Task["priority"];
      if (taskToMove.priority === targetPriority) return;

      setTasks(tasks.map(t => t.id === taskId ? { ...t, priority: targetPriority } : t));
      try {
        await updateTask(taskId, { priority: targetPriority });
        showToast.success("Prioritas tugas berhasil diperbarui.");
      } catch (err) {
        console.error(err);
        setTasks(prevTasks);
        showToast.error("Gagal mengubah prioritas.");
      }
    } else if (groupBy === "assignee") {
      const targetAssigneeId = colKey === "unassigned" ? null : Number(colKey);
      if (taskToMove.assigneeId === targetAssigneeId) return;

      let targetName = null;
      if (targetAssigneeId) {
        const m = members.find(member => member.user?.id === targetAssigneeId);
        targetName = m?.user?.name || null;
      }

      setTasks(tasks.map(t => t.id === taskId ? { ...t, assigneeId: targetAssigneeId, assigneeName: targetName } : t));
      try {
        await updateTask(taskId, { assigned_to: targetAssigneeId });
        showToast.success("Penerima tugas berhasil diperbarui.");
      } catch (err) {
        console.error(err);
        setTasks(prevTasks);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
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
            <h2 className="text-sm font-extrabold text-slate-800 tracking-wide leading-none">{projectName}</h2>
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
          <div className="flex items-center -space-x-1.5 mr-1.5">
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
          </div>

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

          {/* Complete Sprint */}
          <button 
            onClick={() => setIsCompleteSprintModalOpen(true)}
            className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            Complete sprint
          </button>
        </div>
      </header>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start overflow-x-auto min-h-[500px]">
        {columns.map((col) => {
          const colTasks = getTasksForColumn(col.key);
          const isOver = draggedOverColumn === col.key;

          return (
            <div 
              key={col.key} 
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`bg-slate-50 border rounded-2xl p-3.5 flex flex-col gap-3 min-h-[480px] transition-all duration-200 ${
                isOver ? "bg-blue-50/70 border-blue-300 border-dashed scale-[1.01] shadow-sm" : "border-slate-100"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{col.label}</span>
                  {col.isDone && <CheckCircle2 size={12} className="text-emerald-500" />}
                </div>
                <span className="bg-slate-200/60 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>

              {/* Card Container */}
              <div className="flex-1 flex flex-col gap-2.5">
                {colTasks.map((t) => {
                  const Config = priorityConfig[t.priority] || priorityConfig.medium;
                  const Icon = Config.icon;

                  return (
                    <div 
                      key={t.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, t.id)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-xl p-3.5 border border-slate-200/50 shadow-sm hover:shadow transition-shadow flex items-start gap-3 relative cursor-grab active:cursor-grabbing ${
                        draggingTaskId === t.id ? "opacity-30 border-blue-200 shadow-inner" : ""
                      }`}
                    >
                      {/* Checkbox status */}
                      <button 
                        onClick={() => handleToggleTaskStatus(t)} 
                        className={`mt-0.5 transition-colors ${t.status === "done" ? "text-blue-600 hover:text-blue-800" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        {t.status === "done" ? <CheckSquare size={15} /> : <Square size={15} />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 flex flex-col gap-2">
                        <h4 className={`text-xs font-bold text-slate-800 text-left line-clamp-2 leading-snug ${t.status === "done" ? "text-slate-400 line-through font-semibold" : ""}`}>
                          {t.title}
                        </h4>

                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px] text-slate-400 font-extrabold bg-slate-50 border border-slate-200/40 px-1.5 py-0.5 rounded tracking-wider">
                            {t.code}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {/* Priority Badge */}
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold border ${Config.color}`}>
                              <Icon size={9} className="stroke-[3.5]" />
                              {Config.label}
                            </span>

                            {/* Assignee Avatar */}
                            <Avatar name={t.assigneeName || "Unassigned"} size="xs" className={t.status === "done" ? "opacity-60" : ""} />

                            {/* Options Button */}
                            <div className="relative" ref={activeCardMenu === t.id ? cardMenuRef : null}>
                              <button 
                                onClick={() => setActiveCardMenu(activeCardMenu === t.id ? null : t.id)}
                                className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <MoreVertical size={13} />
                              </button>
                              
                              {activeCardMenu === t.id && (
                                <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-150 shadow-xl rounded-xl z-20 py-1 text-[10px] text-slate-600">
                                  <span className="px-2.5 py-1 text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block">Ubah Status</span>
                                  {[
                                    { key: "todo", label: "To Do" },
                                    { key: "inprogress", label: "In Progress" },
                                    { key: "inreview", label: "In Review" },
                                    { key: "done", label: "Done" }
                                  ].map((opt) => (
                                    <button
                                      key={opt.key}
                                      disabled={t.status === opt.key}
                                      onClick={() => {
                                        setActiveCardMenu(null);
                                        handleMoveStatus(t.id, opt.key as any);
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-medium"
                                    >
                                      Ke {opt.label}
                                    </button>
                                  ))}
                                  <div className="border-t border-slate-100 my-1" />
                                  <span className="px-2.5 py-1 text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block">Tugaskan Ke</span>
                                  {members.map((m) => (
                                    <button
                                      key={m.user?.id}
                                      disabled={t.assigneeId === m.user?.id}
                                      onClick={() => {
                                        setActiveCardMenu(null);
                                        handleAssignTask(t.id, m.user?.id);
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-medium truncate"
                                    >
                                      {m.user?.name}
                                    </button>
                                  ))}
                                  <button
                                    disabled={t.assigneeId === null}
                                    onClick={() => {
                                      setActiveCardMenu(null);
                                      handleAssignTask(t.id, null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-medium"
                                  >
                                    Unassign (Lepas)
                                  </button>
                                  <div className="border-t border-slate-100 my-1" />
                                  <button
                                    onClick={() => {
                                      setActiveCardMenu(null);
                                      handleDeleteTask(t.id);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 font-bold flex items-center gap-1.5"
                                  >
                                    <Trash2 size={11} />
                                    Hapus Tugas
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Inline task creator */}
                {activeInputColumn === col.key ? (
                  <div className="bg-white rounded-xl p-3.5 border border-blue-200 shadow-sm flex flex-col gap-3">
                    <textarea
                      rows={2}
                      placeholder="Apa yang perlu dikerjakan?"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full text-xs outline-none resize-none placeholder:text-slate-400 text-slate-800 border-b border-slate-100 pb-1.5 focus:border-blue-300 transition-colors"
                      autoFocus
                    />
                    
                    <div className="flex flex-col gap-2 text-left">
                      {/* Priority Selector */}
                      {groupBy !== "priority" && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-bold">Priority:</span>
                          <select
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value as any)}
                            className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 outline-none font-semibold cursor-pointer"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      )}

                      {/* Assignee Selector */}
                      {groupBy !== "assignee" && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-bold">Assign To:</span>
                          <select
                            value={newTaskAssignee}
                            onChange={(e) => setNewTaskAssignee(e.target.value)}
                            className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 outline-none font-semibold max-w-[125px] cursor-pointer"
                          >
                            <option value="unassigned">Unassigned</option>
                            {members.map((m) => (
                              <option key={m.user?.id} value={m.user?.id.toString()}>
                                {m.user?.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button 
                        onClick={() => {
                          setActiveInputColumn(null);
                          setNewTaskTitle("");
                        }} 
                        className="px-2 py-1 rounded text-slate-400 hover:bg-slate-50 text-[10px] font-semibold transition-colors"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={() => handleCreateTask(col.key)} 
                        className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setNewTaskTitle("");
                      setNewTaskPriority("medium");
                      setNewTaskAssignee("unassigned");
                      setActiveInputColumn(col.key);
                    }} 
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/30 rounded-xl transition-all border border-dashed border-slate-200 hover:border-slate-300"
                  >
                    <Plus size={13} />
                    <span>Buat Tugas</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Sprint Modal */}
      <Modal
        isOpen={isCompleteSprintModalOpen}
        onClose={() => setIsCompleteSprintModalOpen(false)}
        title="Selesaikan Sprint"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
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
          <p className="text-xs text-slate-650 leading-relaxed">
            Apakah Anda yakin ingin menyelesaikan sprint untuk board <strong>{projectName}</strong>?
          </p>
          <p className="text-[10px] text-slate-400">
            Tindakan ini akan menandai papan sprint ini sebagai selesai (completed) di server, dan Anda akan dialihkan kembali ke daftar proyek utama.
          </p>
        </div>
      </Modal>
    </div>
  );
}
