import React from "react";
import { Plus, CheckCircle2, Inbox } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { Task, Project } from "@/store/useTaskStore";

interface KanbanColumnProps {
  colKey: string;
  label: string;
  colorClass: string;
  isDone?: boolean;
  tasks: Task[];
  project: Project | null;
  currentUser: any;
  members: any[];
  isOver: boolean;
  activeInputColumn: string | null;
  newTaskTitle: string;
  newTaskPriority: "low" | "medium" | "high";
  newTaskAssignee: string;
  isCreatingTask?: boolean;
  groupBy: "status" | "priority" | "assignee";
  onDragOver: (e: React.DragEvent, colKey: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, colKey: string) => void;
  onDragStart: (e: React.DragEvent, id: number) => void;
  onDragEnd: () => void;
  onToggleStatus: (task: Task) => void;
  onMoveStatus: (taskId: number, nextStatus: Task["status"]) => void;
  onAssign: (taskId: number, assigneeId: number | null) => void;
  onDelete: (taskId: number) => void;
  onCreateTask: (colKey: string) => void;
  onStartCreateTask: (colKey: string) => void;
  onCancelCreateTask: () => void;
  setNewTaskTitle: (val: string) => void;
  setNewTaskPriority: (val: "low" | "medium" | "high") => void;
  setNewTaskAssignee: (val: string) => void;
  onOpenDetail?: (task: Task) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  colKey,
  label,
  colorClass,
  isDone = false,
  tasks,
  project,
  currentUser,
  members,
  isOver,
  activeInputColumn,
  newTaskTitle,
  newTaskPriority,
  newTaskAssignee,
  isCreatingTask = false,
  groupBy,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onToggleStatus,
  onMoveStatus,
  onAssign,
  onDelete,
  onCreateTask,
  onStartCreateTask,
  onCancelCreateTask,
  setNewTaskTitle,
  setNewTaskPriority,
  setNewTaskAssignee,
  onOpenDetail,
}) => {
  const isPm = project ? (project.created_by === currentUser?.id || currentUser?.role === "admin") : false;

  return (
    <div 
      onDragOver={(e) => onDragOver(e, colKey)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, colKey)}
      className={`bg-slate-50 border rounded-2xl p-3.5 flex flex-col gap-3 min-w-[270px] min-h-[480px] transition-all duration-200 ${
        isOver ? "bg-blue-50/70 border-blue-300 border-dashed scale-[1.01] shadow-sm" : "border-slate-100"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{label}</span>
          {isDone && <CheckCircle2 size={12} className="text-emerald-500" />}
        </div>
        <span className="bg-slate-200/60 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>

      {/* Card Container */}
      <div className="flex-1 flex flex-col gap-2.5">
        {tasks.length > 0 ? (
          tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              project={project}
              currentUser={currentUser}
              members={members}
              onToggleStatus={onToggleStatus}
              onMoveStatus={onMoveStatus}
              onAssign={onAssign}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onOpenDetail={onOpenDetail}
            />
          ))
        ) : (
          /* Empty State inside Kanban Column */
          <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-200/50 rounded-xl bg-slate-50/30">
            <Inbox size={20} className="text-slate-300 stroke-[1.5] mb-2" />
            <span className="text-[10px] font-bold text-slate-400">Kosong</span>
            <span className="text-[9px] text-slate-400 text-center mt-0.5">Tidak ada tugas</span>
          </div>
        )}

        {/* Inline task creator (only visible if PM) */}
        {activeInputColumn === colKey ? (
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
                onClick={onCancelCreateTask} 
                className="px-2 py-1 rounded text-slate-400 hover:bg-slate-50 text-[10px] font-semibold transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => onCreateTask(colKey)} 
                disabled={isCreatingTask}
                className={`bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm ${isCreatingTask ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isCreatingTask ? "Menambah..." : "Tambah"}
              </button>
            </div>
          </div>
        ) : (
          /* Plus button to show creator (only if user is PM) */
          isPm && (
            <button 
              onClick={() => onStartCreateTask(colKey)} 
              className="w-full flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/30 rounded-xl transition-all border border-dashed border-slate-200 hover:border-slate-300"
            >
              <Plus size={13} />
              <span>Buat Tugas</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};
