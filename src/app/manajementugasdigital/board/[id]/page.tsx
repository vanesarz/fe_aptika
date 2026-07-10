"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Users
} from "lucide-react";
import { getProjects, getTasks, createTask, updateTaskStatus, deleteTask } from "@/services/api";
import { Avatar } from "@/components/ui/Avatar";
import { showToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Task {
  id: number;
  title: string;
  code: string;
  priority: "high" | "medium" | "low";
  assignee: string;
  status: "todo" | "inprogress" | "inreview" | "done";
}

const mapBackendToFrontendTask = (t: any): Task => {
  let fStatus: Task["status"] = "todo";
  if (t.status === "in_progress") fStatus = "inprogress";
  else if (t.status === "in_review") fStatus = "inreview";
  else if (t.status === "done") fStatus = "done";

  let init = "UA";
  if (t.assignee?.name) {
    init = t.assignee.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  } else if (t.creator?.name) {
    init = t.creator.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  }

  return {
    id: t.id,
    title: t.title,
    code: `SCRUM-${t.id}`,
    priority: t.priority || "medium",
    assignee: init,
    status: fStatus
  };
};

const mapFrontendToBackendStatus = (status: Task["status"]): "todo" | "in_progress" | "in_review" | "done" => {
  if (status === "inprogress") return "in_progress";
  if (status === "inreview") return "in_review";
  return status;
};

export default function KanbanBoardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);

  const [projectName, setProjectName] = useState("Proyek");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for creating a task in-line
  const [activeInputColumn, setActiveInputColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

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
    }
  };

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      setLoading(true);
      try {
        const res = await getProjects();
        if (res && res.data) {
          const currentProject = res.data.find((p: any) => p.id === projectId);
          if (currentProject) {
            setProjectName(currentProject.name);
          }
        }
        await fetchTasks();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectAndTasks();
  }, [projectId]);

  const handleCreateTask = async (column: "todo" | "inprogress" | "inreview" | "done") => {
    if (!newTaskTitle.trim()) {
      setActiveInputColumn(null);
      return;
    }

    try {
      await createTask({
        board_id: projectId,
        title: newTaskTitle.trim(),
        priority: "medium",
        status: mapFrontendToBackendStatus(column)
      });
      setNewTaskTitle("");
      setActiveInputColumn(null);
      showToast.success(`Tugas berhasil dibuat!`);
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
    try {
      await updateTaskStatus(task.id, mapFrontendToBackendStatus(nextFStatus));
      showToast.success(`Tugas "${task.title}" dipindahkan.`);
      await fetchTasks();
    } catch (err) {
      console.error(err);
      showToast.error("Gagal memindahkan tugas.");
    }
  };

  const handleMoveStatus = async (id: number, nextStatus: Task["status"]) => {
    try {
      await updateTaskStatus(id, mapFrontendToBackendStatus(nextStatus));
      showToast.success("Tugas berhasil dipindahkan.");
      await fetchTasks();
    } catch (err) {
      console.error(err);
      showToast.error("Gagal memindahkan tugas.");
    }
  };

  // Filter tasks based on search
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const todoTasks = filteredTasks.filter((t) => t.status === "todo");
  const inprogressTasks = filteredTasks.filter((t) => t.status === "inprogress");
  const inreviewTasks = filteredTasks.filter((t) => t.status === "inreview");
  const doneTasks = filteredTasks.filter((t) => t.status === "done");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <RefreshCw className="animate-spin text-blue-600 w-8 h-8" />
        <span className="text-xs font-semibold text-slate-400">Memuat Papan Kanban...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Figma Kanban Action/Search Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100/80 rounded-2xl px-6 py-4 shadow-sm select-none">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button 
            onClick={() => router.push("/manajementugasdigital")}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-slate-100 transition-colors"
            title="Kembali ke Daftar Proyek"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-extrabold text-slate-800 tracking-wide leading-none">{projectName}</h2>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wide mt-1">Papan Kanban / Sprint Aktif</span>
          </div>
        </div>

        {/* Board Search and Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search board"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-400"
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

          {/* Members Avatars */}
          <div className="flex items-center -space-x-1.5 mr-2">
            <Avatar name="Budi Santoso" size="xs" />
            <Avatar name="Siti Aminah" size="xs" />
            <Avatar name="Hendra Gunawan" size="xs" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 ring-2 ring-white text-[9px] font-extrabold text-blue-600 cursor-pointer">
              +3
            </div>
          </div>

          {/* Action buttons */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <SlidersHorizontal size={12} />
            Filter
          </button>

          <button 
            onClick={() => showToast.success("Sprint berhasil diselesaikan!")}
            className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            Complete sprint
          </button>

          <button 
            onClick={() => {
              setSearchQuery("");
              showToast.success("Papan disinkronisasi");
            }}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            title="Refresh Board"
          >
            <RefreshCw size={12} className="text-slate-500" />
          </button>

          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button className="p-2 bg-slate-50 border-r border-slate-200" title="Board View">
              <LayoutGrid size={12} className="text-blue-600" />
            </button>
            <button className="p-2 hover:bg-slate-50" title="List View">
              <List size={12} className="text-slate-400" />
            </button>
          </div>

          <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600">
            <MoreVertical size={12} />
          </button>
        </div>
      </header>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start select-none">
        
        {/* Column: TO DO */}
        <div className="bg-slate-100/55 rounded-2xl p-3 border border-slate-100/60 flex flex-col gap-2.5 min-h-[450px]">
          <div className="flex items-center justify-between px-1.5 py-0.5">
            <span className="text-xs font-bold text-slate-600 tracking-wider">TO DO</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{todoTasks.length}</span>
          </div>

          {/* Cards container */}
          <div className="flex-1 flex flex-col gap-2">
            {todoTasks.map((t) => (
              <div key={t.id} className="bg-white rounded-xl p-3 border border-slate-200/50 shadow-sm hover:shadow transition-shadow group flex items-start gap-2.5">
                <button 
                  onClick={() => handleToggleTaskStatus(t)} 
                  className="mt-0.5 text-slate-400 hover:text-slate-600"
                >
                  <Square size={14} />
                </button>
                <div className="flex-1 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-800 text-left line-clamp-2 leading-snug">{t.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded">{t.code}</span>
                    <div className="flex items-center gap-2">
                      <ChevronUp size={14} className={t.priority === "high" ? "text-red-500" : "text-slate-400"} />
                      <Avatar name={t.assignee} size="xs" />
                      <div className="relative group/menu">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-slate-100 rounded text-slate-400">
                          <MoreVertical size={12} />
                        </button>
                        <div className="absolute hidden group-hover/menu:block right-0 mt-1 w-24 bg-white border border-slate-100 shadow-md rounded-lg z-20 py-1 text-[10px]">
                          <button onClick={() => handleMoveStatus(t.id, "inprogress")} className="w-full text-left px-2 py-1 hover:bg-slate-50">In Progress</button>
                          <button onClick={() => handleMoveStatus(t.id, "inreview")} className="w-full text-left px-2 py-1 hover:bg-slate-50">In Review</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Inline create */}
            {activeInputColumn === "todo" ? (
              <div className="bg-white rounded-xl p-3 border border-blue-200 shadow-sm flex flex-col gap-2">
                <textarea
                  rows={2}
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full text-xs outline-none resize-none placeholder:text-slate-400 text-slate-800"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCreateTask("todo");
                    }
                  }}
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button 
                    onClick={() => {
                      setActiveInputColumn(null);
                      setNewTaskTitle("");
                    }} 
                    className="p-1 rounded text-slate-400 hover:bg-slate-50"
                  >
                    <X size={14} />
                  </button>
                  <button 
                    onClick={() => handleCreateTask("todo")} 
                    className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setNewTaskTitle("");
                  setActiveInputColumn("todo");
                }} 
                className="w-full flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/40 rounded-xl transition-all"
              >
                <Plus size={12} />
                Create
              </button>
            )}
          </div>
        </div>

        {/* Column: IN PROGRESS */}
        <div className="bg-slate-100/55 rounded-2xl p-3 border border-slate-100/60 flex flex-col gap-2.5 min-h-[450px]">
          <div className="flex items-center justify-between px-1.5 py-0.5">
            <span className="text-xs font-bold text-slate-600 tracking-wider">IN PROGRESS</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{inprogressTasks.length}</span>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            {inprogressTasks.map((t) => (
              <div key={t.id} className="bg-white rounded-xl p-3 border border-slate-200/50 shadow-sm hover:shadow transition-shadow group flex items-start gap-2.5">
                <button 
                  onClick={() => handleToggleTaskStatus(t)} 
                  className="mt-0.5 text-slate-400 hover:text-slate-600"
                >
                  <Square size={14} />
                </button>
                <div className="flex-1 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-800 text-left line-clamp-2 leading-snug">{t.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded">{t.code}</span>
                    <div className="flex items-center gap-2">
                      <ChevronUp size={14} className={t.priority === "high" ? "text-red-500" : "text-slate-400"} />
                      <Avatar name={t.assignee} size="xs" />
                      <div className="relative group/menu">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-slate-100 rounded text-slate-400">
                          <MoreVertical size={12} />
                        </button>
                        <div className="absolute hidden group-hover/menu:block right-0 mt-1 w-24 bg-white border border-slate-100 shadow-md rounded-lg z-20 py-1 text-[10px]">
                          <button onClick={() => handleMoveStatus(t.id, "todo")} className="w-full text-left px-2 py-1 hover:bg-slate-50">To Do</button>
                          <button onClick={() => handleMoveStatus(t.id, "inreview")} className="w-full text-left px-2 py-1 hover:bg-slate-50">In Review</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {activeInputColumn === "inprogress" ? (
              <div className="bg-white rounded-xl p-3 border border-blue-200 shadow-sm flex flex-col gap-2">
                <textarea
                  rows={2}
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full text-xs outline-none resize-none placeholder:text-slate-400 text-slate-800"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCreateTask("inprogress");
                    }
                  }}
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button onClick={() => { setActiveInputColumn(null); setNewTaskTitle(""); }} className="p-1 rounded text-slate-400 hover:bg-slate-50">
                    <X size={14} />
                  </button>
                  <button onClick={() => handleCreateTask("inprogress")} className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => { setNewTaskTitle(""); setActiveInputColumn("inprogress"); }} 
                className="w-full flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/40 rounded-xl transition-all"
              >
                <Plus size={12} />
                Create
              </button>
            )}
          </div>
        </div>

        {/* Column: IN REVIEW */}
        <div className="bg-slate-100/55 rounded-2xl p-3 border border-slate-100/60 flex flex-col gap-2.5 min-h-[450px]">
          <div className="flex items-center justify-between px-1.5 py-0.5">
            <span className="text-xs font-bold text-slate-600 tracking-wider">IN REVIEW</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{inreviewTasks.length}</span>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            {inreviewTasks.map((t) => (
              <div key={t.id} className="bg-white rounded-xl p-3 border border-slate-200/50 shadow-sm hover:shadow transition-shadow group flex items-start gap-2.5">
                <button 
                  onClick={() => handleToggleTaskStatus(t)} 
                  className="mt-0.5 text-slate-400 hover:text-slate-600"
                >
                  <Square size={14} />
                </button>
                <div className="flex-1 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-800 text-left line-clamp-2 leading-snug">{t.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded">{t.code}</span>
                    <div className="flex items-center gap-2">
                      <ChevronUp size={14} className={t.priority === "high" ? "text-red-500" : "text-slate-400"} />
                      <Avatar name={t.assignee} size="xs" />
                      <div className="relative group/menu">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-slate-100 rounded text-slate-400">
                          <MoreVertical size={12} />
                        </button>
                        <div className="absolute hidden group-hover/menu:block right-0 mt-1 w-24 bg-white border border-slate-100 shadow-md rounded-lg z-20 py-1 text-[10px]">
                          <button onClick={() => handleMoveStatus(t.id, "inprogress")} className="w-full text-left px-2 py-1 hover:bg-slate-50">In Progress</button>
                          <button onClick={() => handleMoveStatus(t.id, "done")} className="w-full text-left px-2 py-1 hover:bg-slate-50">Done</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {activeInputColumn === "inreview" ? (
              <div className="bg-white rounded-xl p-3 border border-blue-200 shadow-sm flex flex-col gap-2">
                <textarea
                  rows={2}
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full text-xs outline-none resize-none placeholder:text-slate-400 text-slate-800"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCreateTask("inreview");
                    }
                  }}
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button onClick={() => { setActiveInputColumn(null); setNewTaskTitle(""); }} className="p-1 rounded text-slate-400 hover:bg-slate-50">
                    <X size={14} />
                  </button>
                  <button onClick={() => handleCreateTask("inreview")} className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => { setNewTaskTitle(""); setActiveInputColumn("inreview"); }} 
                className="w-full flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/40 rounded-xl transition-all"
              >
                <Plus size={12} />
                Create
              </button>
            )}
          </div>
        </div>

        {/* Column: DONE */}
        <div className="bg-slate-100/55 rounded-2xl p-3 border border-slate-100/60 flex flex-col gap-2.5 min-h-[450px]">
          <div className="flex items-center justify-between px-1.5 py-0.5">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-600 tracking-wider">DONE</span>
              <CheckCircle2 size={12} className="text-emerald-500" />
            </div>
            <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{doneTasks.length}</span>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            {doneTasks.map((t) => (
              <div key={t.id} className="bg-white rounded-xl p-3 border border-slate-200/50 shadow-sm hover:shadow transition-shadow group flex items-start gap-2.5">
                <button 
                  onClick={() => handleToggleTaskStatus(t)} 
                  className="mt-0.5 text-blue-600 hover:text-blue-800"
                >
                  <CheckSquare size={14} />
                </button>
                <div className="flex-1 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-400 line-through text-left line-clamp-2 leading-snug">{t.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-200/30 px-2 py-0.5 rounded">{t.code}</span>
                    <div className="flex items-center gap-2">
                      <ChevronDown size={14} className="text-slate-300" />
                      <Avatar name={t.assignee} size="xs" className="opacity-60" />
                      <div className="relative group/menu">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-slate-100 rounded text-slate-400">
                          <MoreVertical size={12} />
                        </button>
                        <div className="absolute hidden group-hover/menu:block right-0 mt-1 w-24 bg-white border border-slate-100 shadow-md rounded-lg z-20 py-1 text-[10px]">
                          <button onClick={() => handleMoveStatus(t.id, "todo")} className="w-full text-left px-2 py-1 hover:bg-slate-50">To Do</button>
                          <button onClick={() => handleMoveStatus(t.id, "inreview")} className="w-full text-left px-2 py-1 hover:bg-slate-50">In Review</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {activeInputColumn === "done" ? (
              <div className="bg-white rounded-xl p-3 border border-blue-200 shadow-sm flex flex-col gap-2">
                <textarea
                  rows={2}
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full text-xs outline-none resize-none placeholder:text-slate-400 text-slate-800"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCreateTask("done");
                    }
                  }}
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button onClick={() => { setActiveInputColumn(null); setNewTaskTitle(""); }} className="p-1 rounded text-slate-400 hover:bg-slate-50">
                    <X size={14} />
                  </button>
                  <button onClick={() => handleCreateTask("done")} className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => { setNewTaskTitle(""); setActiveInputColumn("done"); }} 
                className="w-full flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/40 rounded-xl transition-all"
              >
                <Plus size={12} />
                Create
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
