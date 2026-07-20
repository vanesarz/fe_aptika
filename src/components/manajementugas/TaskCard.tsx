import React, { useState, useRef, useEffect } from "react";
import { 
  ChevronUp, 
  ChevronDown, 
  MoreVertical, 
  CheckSquare, 
  Square, 
  Trash2,
  Lock,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Task, Project } from "@/store/useTaskStore";
import { showToast } from "@/components/ui/Toast";

interface TaskCardProps {
  task: Task;
  project: Project | null;
  currentUser: { id: number; role: string } | null;
  members: Array<{
    id?: number;
    role?: string;
    user?: { id?: number; name?: string };
  }>;
  onToggleStatus?: (task: Task) => void;
  onApprove?: (taskId: number) => void;
  onMoveStatus: (taskId: number, nextStatus: Task["status"]) => void;
  onAssign: (taskId: number, assigneeId: number | null) => void;
  onDelete: (taskId: number) => void;
  onDragStart: (e: React.DragEvent, id: number) => void;
  onDragEnd: () => void;
  onOpenDetail?: (task: Task) => void;
}

const priorityConfig = {
  high: { color: "text-red-650 bg-red-50 border-red-150", label: "High", icon: ChevronUp },
  medium: { color: "text-amber-650 bg-amber-50 border-amber-150", label: "Medium", icon: ChevronUp },
  low: { color: "text-emerald-650 bg-emerald-50 border-emerald-150", label: "Low", icon: ChevronDown },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  project,
  currentUser,
  members,
  onToggleStatus,
  onApprove,
  onMoveStatus,
  onAssign,
  onDelete,
  onDragStart,
  onDragEnd,
  onOpenDetail,
}) => {
  const [activeMenu, setActiveMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isPm = project ? (project.created_by === currentUser?.id || currentUser?.role === "admin") : false;
  const isAssignee = task.assigneeId === currentUser?.id;

  const isDone = task.status === "done";

  const canMemberMoveToDone = isPm; // hanya PM boleh ke done
  const canModifyStatus = isPm || isAssignee;

  const handleDragStartLocal = (e: React.DragEvent) => {
    if (isDone) {
      e.preventDefault();
      return;
    }
    if (!canModifyStatus) {
      e.preventDefault();
      showToast.error("Anda hanya boleh memindahkan tugas yang ditugaskan kepada Anda.");
      return;
    }
    onDragStart(e, task.id);
  };

  const handleToggleLocal = () => {
    if (isDone) return;
    if (!canModifyStatus) {
      showToast.error("Anda hanya boleh mengubah status tugas yang ditugaskan kepada Anda.");
      return;
    }

    // PM can approve task when it's in_review
    if (isPm && task.status === "inreview") {
      if (onApprove) {
        onApprove(task.id);
      }
      return;
    }

    onToggleStatus?.(task);
  };

  const handleMoveStatusLocal = (status: Task["status"]) => {
    if (!canModifyStatus) {
      showToast.error("Anda tidak berwenang mengubah status tugas ini.");
      return;
    }

    if (!canMemberMoveToDone && status === "done") {
      showToast.error("Member biasa hanya bisa sampai status In Review.");
      return;
    }

    onMoveStatus(task.id, status);
  };

  const handleAssignLocal = (assigneeId: number | null) => {
    if (!isPm) {
      showToast.error("Hanya Project Manager yang dapat menugaskan anggota ke tugas.");
      return;
    }
    onAssign(task.id, assigneeId);
  };

  const handleDeleteLocal = () => {
    if (!isPm) {
      showToast.error("Hanya Project Manager yang dapat menghapus tugas.");
      return;
    }
    onDelete(task.id);
  };

  const config = priorityConfig[task.priority] || priorityConfig.medium;
  const PriorityIcon = config.icon;

  const canToggleCheckbox = isPm && task.status === "inreview" && !isDone;

  return (
    <div 
      draggable={!isDone && canModifyStatus}
      onDragStart={handleDragStartLocal}
      onDragEnd={onDragEnd}
      onClick={() => onOpenDetail?.(task)}
      className={`bg-white rounded-xl p-3.5 border border-slate-200/50 shadow-sm hover:shadow-md transition-all flex items-start gap-3 relative select-none cursor-pointer ${
        isDone
          ? "opacity-100 border-emerald-200/60 hover:shadow-sm"
          : canModifyStatus ? "hover:border-slate-300" : "opacity-90 border-slate-100"
      }`}
    >
      {/* Checkbox status */}
      {canToggleCheckbox ? (
        <button 
          onClick={handleToggleLocal} 
          className={`mt-0.5 transition-colors flex-shrink-0 ${
            task.status === "done" ? "text-blue-600 hover:text-blue-800" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {task.status === "done" ? <CheckSquare size={15} /> : <Square size={15} />}
        </button>
      ) : (
        <div className="mt-0.5 flex-shrink-0" />
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <h4 
          className={`text-xs font-bold text-slate-800 text-left line-clamp-2 leading-snug break-words ${
            task.status === "done" ? "text-slate-400 line-through font-semibold" : ""
          }`}
          title={task.title}
        >
          {task.title}
        </h4>

        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] text-slate-400 font-extrabold bg-slate-50 border border-slate-200/40 px-1.5 py-0.5 rounded tracking-wider">
            {task.code}
          </span>
          
          <div className="flex items-center gap-2">
            {/* Priority Badge */}
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold border ${config.color}`}>
              <PriorityIcon size={9} className="stroke-[3.5]" />
              {config.label}
            </span>

            {isDone && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold border text-emerald-600 bg-emerald-50 border-emerald-200">
                <Lock size={9} className="stroke-[3.5]" />
                Completed
              </span>
            )}

            {/* Assignee Avatar */}
            <Avatar 
              name={task.assigneeName || "Unassigned"} 
              size="xs" 
              className={task.status === "done" ? "opacity-60" : ""} 
            />

            {/* Options Menu */}
            <div className="relative flex-shrink-0" ref={menuRef}>
              {!isDone && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(!activeMenu);
                  }}
                  className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <MoreVertical size={13} />
                </button>
              )}
              
              {activeMenu && !isDone && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 shadow-xl rounded-xl z-20 py-1 text-[10px] text-slate-600">
                  {canModifyStatus && (
                    <>
                      <span className="px-2.5 py-1 text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block">Ubah Status</span>
                      {[
                        { key: "todo", label: "To Do" },
                        { key: "inprogress", label: "In Progress" },
                        { key: "inreview", label: "In Review" },
                        { key: "done", label: "Done" }
                      ].filter((opt) => opt.key !== "done" || task.status === "inreview").map((opt) => (
                        <button
                          key={opt.key}
                          disabled={
                            task.status === opt.key ||
                            (!canMemberMoveToDone && opt.key === "done")
                          }
                          onClick={() => {
                            setActiveMenu(false);
                            handleMoveStatusLocal(opt.key as Task["status"]);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-medium"
                        >
                          Ke {opt.label}
                        </button>
                      ))}
                    </>
                  )}

                  {isPm && (
                    <>
                      {task.status !== "inreview" && (
                        <>
                          <div className="border-t border-slate-100 my-1" />
                          <span className="px-2.5 py-1 text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block">Tugaskan Ke</span>
                          {members.map((m) => (
                            <button
                              key={m.user?.id ?? m.id ?? m.role ?? m.user?.name ?? "member"}
                              disabled={task.assigneeId === (m.user?.id ?? null)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(false);
                                handleAssignLocal(m.user?.id ?? null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-medium truncate"
                            >
                              {m.user?.name}
                            </button>
                          ))}
                          <button
                            disabled={task.assigneeId === null}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(false);
                              handleAssignLocal(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-medium"
                          >
                            Unassign (Lepas)
                          </button>
                        </>
                      )}
                      
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(false);
                          handleDeleteLocal();
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 font-bold flex items-center gap-1.5"
                      >
                        <Trash2 size={11} />
                        Hapus Tugas
                      </button>
                    </>
                  )}
                  
                  {!canModifyStatus && (
                    <div className="px-2.5 py-2 z-20 text-center text-slate-400 italic">
                      Tidak ada aksi tersedia
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
