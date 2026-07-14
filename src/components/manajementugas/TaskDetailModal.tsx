"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  FileText, 
  Paperclip, 
  UploadCloud, 
  Settings, 
  Trash2, 
  Loader2, 
  Smile, 
  AtSign, 
  ChevronDown,
  Clock,
  History,
  MessageSquare
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Task, Project } from "@/store/useTaskStore";
import { showToast } from "@/components/ui/Toast";
import { getTaskComments, createTaskComment, deleteTaskComment, getTaskActivities } from "@/services/api";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  project: Project | null;
  currentUser: any;
  members: any[];
  onUpdateTask: (taskId: number, payload: any) => Promise<boolean>;
}

const statusConfig = {
  todo: { label: "To Do", bg: "bg-[#e2e8f0]", text: "text-slate-700", iconColor: "text-slate-500" },
  inprogress: { label: "In Progress", bg: "bg-amber-100", text: "text-amber-700", iconColor: "text-amber-500" },
  inreview: { label: "In Review", bg: "bg-purple-100", text: "text-purple-700", iconColor: "text-purple-500" },
  done: { label: "Done", bg: "bg-emerald-100", text: "text-emerald-700", iconColor: "text-emerald-500" },
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  project,
  currentUser,
  members,
  onUpdateTask,
}) => {
  const [activeTab, setActiveTab] = useState<"comments" | "history" | "worklog">("comments");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [newComment, setNewComment] = useState("");
  
  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [savingDescription, setSavingDescription] = useState(false);

  // Activities state
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Attachments state
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; size: string; progress?: number; done?: boolean }>>([]);
  const [draggingFile, setDraggingFile] = useState(false);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus comment input on pressing 'M' key if not focused on any text input/textarea
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen || !task) return;
      if (e.key.toLowerCase() === "m" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setActiveTab("comments");
        setTimeout(() => {
          commentInputRef.current?.focus();
        }, 100);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, task]);

  // Load comments, activities, and description on task change
  useEffect(() => {
    if (isOpen && task) {
      setEditedDescription(task.description || "");
      setIsEditingDescription(false);
      fetchComments();
      fetchActivities();
    } else {
      setComments([]);
      setActivities([]);
    }
  }, [isOpen, task]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const fetchComments = async () => {
    if (!task) return;
    setLoadingComments(true);
    try {
      const res = await getTaskComments(task.id);
      if (res && res.success) {
        setComments(res.data || []);
      }
    } catch (e) {
      console.error("Failed fetching comments", e);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchActivities = async () => {
    if (!task) return;
    setLoadingActivities(true);
    try {
      const res = await getTaskActivities(task.id);
      if (res && res.success) {
        setActivities(res.data || []);
      }
    } catch (e) {
      console.error("Failed fetching activities", e);
    } finally {
      setLoadingActivities(false);
    }
  };

  if (!isOpen || !task) return null;

  const isPm = project ? (project.created_by === currentUser?.id || currentUser?.role === "admin") : false;
  const isAssignee = task.assigneeId === currentUser?.id;
  const canModify = isPm || isAssignee;

  const handleStatusChange = async (nextStatus: Task["status"]) => {
    if (!canModify) {
      showToast.error("Anda tidak memiliki akses untuk mengubah status tugas ini.");
      return;
    }
    const success = await onUpdateTask(task.id, { status: nextStatus });
    if (success) {
      showToast.success(`Status berhasil diubah ke ${statusConfig[nextStatus]?.label}`);
      fetchActivities();
    }
  };

  const handleSaveDescription = async () => {
    setSavingDescription(true);
    try {
      const success = await onUpdateTask(task.id, { description: editedDescription });
      if (success) {
        task.description = editedDescription; // update ref
        setIsEditingDescription(false);
        showToast.success("Deskripsi berhasil diperbarui.");
      }
    } catch (err) {
      showToast.error("Gagal menyimpan deskripsi.");
    } finally {
      setSavingDescription(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setSavingComment(true);
    try {
      const res = await createTaskComment({ task_id: task.id, comment: newComment.trim() });
      if (res && res.success) {
        setComments([res.data, ...comments]);
        setNewComment("");
        showToast.success("Komentar ditambahkan.");
        fetchActivities();
      }
    } catch (err) {
      showToast.error("Gagal menambahkan komentar.");
    } finally {
      setSavingComment(false);
    }
  };

  const handleDeleteCommentLocal = async (id: number) => {
    try {
      const res = await deleteTaskComment(id);
      if (res && res.success) {
        setComments(comments.filter(c => c.id !== id));
        showToast.success("Komentar dihapus.");
      }
    } catch (err) {
      showToast.error("Gagal menghapus komentar.");
    }
  };

  const insertQuickFeedback = (text: string) => {
    setNewComment(prev => prev ? `${prev} ${text}` : text);
    commentInputRef.current?.focus();
  };

  // Simulated File Upload Handling
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingFile(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const id = Math.random().toString(36).substring(2, 9);
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;
        
      const newAttach = { id, name: file.name, size: sizeStr, progress: 0, done: false };
      setAttachments(prev => [...prev, newAttach]);

      // Simulate upload progress
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setAttachments(prev => prev.map(a => {
          if (a.id === id) {
            const updatedProgress = currentProgress;
            if (updatedProgress >= 100) {
              clearInterval(interval);
              return { ...a, progress: 100, done: true };
            }
            return { ...a, progress: updatedProgress };
          }
          return a;
        }));
      }, 150);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Helper date formatter
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) + " at " + date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-[700px] bg-[#f8fafc] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Navy Header */}
        <div className="bg-[#0b2540] px-6 py-5 flex items-start justify-between relative text-white">
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-1.5 text-slate-300 text-[10px] font-extrabold uppercase tracking-wider">
              <FileText size={12} className="text-blue-400" />
              <span>{project?.name || "PROYEK"}</span>
              <span>•</span>
              <span>{task.code}</span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight pr-6 break-words">
              {task.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Dropdown */}
            <div className="relative group">
              <select
                disabled={!canModify}
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className={`appearance-none outline-none pl-3.5 pr-8 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer shadow-sm transition-all focus:ring-2 focus:ring-blue-400/50 ${
                  task.status === "todo" ? "bg-amber-500 text-white" :
                  task.status === "inprogress" ? "bg-blue-600 text-white" :
                  task.status === "inreview" ? "bg-purple-600 text-white" :
                  "bg-emerald-600 text-white"
                }`}
              >
                <option value="todo" className="bg-white text-slate-700 font-semibold">To Do</option>
                <option value="inprogress" className="bg-white text-slate-700 font-semibold">In Progress</option>
                <option value="inreview" className="bg-white text-slate-700 font-semibold">In Review</option>
                <option value="done" className="bg-white text-slate-700 font-semibold">Done</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/95 pointer-events-none stroke-[3]" />
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Description Section */}
          <div className="space-y-2.5 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#0b2540] uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-slate-400" />
                <span>Description</span>
              </h3>
              {canModify && !isEditingDescription && (
                <button 
                  onClick={() => setIsEditingDescription(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingDescription ? (
              <div className="space-y-2">
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Describe this task..."
                  rows={4}
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-y text-slate-800 leading-relaxed"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => {
                      setIsEditingDescription(false);
                      setEditedDescription(task.description || "");
                    }}
                    className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 text-xs font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveDescription}
                    disabled={savingDescription}
                    className="bg-[#0b2540] text-white px-3.5 py-1.5 rounded-lg hover:bg-[#0a2037] text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    {savingDescription ? <Loader2 size={12} className="animate-spin" /> : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#eff4fc] border border-blue-50 rounded-xl px-4 py-3.5 text-xs text-slate-700 leading-relaxed min-h-[50px]">
                {task.description ? (
                  <p className="whitespace-pre-line break-words">{task.description}</p>
                ) : (
                  <span className="text-slate-400 italic">Belum ada deskripsi untuk tugas ini.</span>
                )}
              </div>
            )}
          </div>

          {/* Attachments Section */}
          <div className="space-y-2.5 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#0b2540] uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip size={14} className="text-slate-400" />
                <span>Attachments</span>
              </h3>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                + Add attachment
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                multiple
              />
            </div>

            {/* Drop Zone */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setDraggingFile(true); }}
              onDragLeave={() => setDraggingFile(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                draggingFile 
                  ? "border-blue-500 bg-blue-50/50" 
                  : "border-slate-200/80 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-350"
              }`}
            >
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <UploadCloud size={20} />
              </div>
              <p className="text-xs font-bold text-slate-700">Click or drag and drop to upload</p>
              <p className="text-[10px] text-slate-400">Supporting PDF, JPG, PNG, and CSV up to 10MB</p>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                {attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold flex-shrink-0">
                        {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{file.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      {!file.done ? (
                        <div className="flex items-center gap-1">
                          <Loader2 size={12} className="animate-spin text-blue-500" />
                          <span className="text-[9px] text-slate-400 font-bold">{file.progress}%</span>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeAttachment(file.id); }}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    {/* Progress Bar background overlay */}
                    {!file.done && (
                      <div 
                        className="absolute bottom-0 left-0 h-0.5 bg-blue-500/30 transition-all duration-150" 
                        style={{ width: `${file.progress}%` }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-200 mt-4">
            <div className="flex gap-6">
              {[
                { id: "comments", label: "Comments", icon: MessageSquare },
                { id: "history", label: "History", icon: History },
                { id: "worklog", label: "Work log", icon: Clock },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600 font-extrabold"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <TabIcon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comments Tab Panel */}
          {activeTab === "comments" && (
            <div className="space-y-5">
              
              {/* Comment Input Box */}
              <div className="flex items-start gap-3">
                <Avatar name={currentUser?.name || "Guest"} size="sm" className="mt-1 shadow-sm" />
                <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden transition-all text-left">
                  <textarea
                    ref={commentInputRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                    className="w-full text-xs p-3.5 outline-none border-b border-slate-100 resize-none text-slate-800 leading-normal"
                  />
                  
                  {/* Quick Pill options and toolbar */}
                  <div className="px-3.5 py-2.5 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                    {/* Quick feedback buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { label: "👍 Looks good!", insert: "Looks good!" },
                        { label: "❓ Need help?", insert: "Need help?" },
                        { label: "🚫 Blocked...", insert: "Blocked..." },
                        { label: "🔍 Clarify?", insert: "Clarify?" },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => insertQuickFeedback(item.insert)}
                          className="px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 active:bg-slate-100 hover:border-slate-350 shadow-sm transition-all"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Submit actions */}
                    <div className="flex items-center gap-3.5 ml-auto">
                      <button type="button" className="text-slate-400 hover:text-slate-600" title="Mention someone">
                        <AtSign size={14} />
                      </button>
                      <button type="button" className="text-slate-400 hover:text-slate-600" title="Add emoji">
                        <Smile size={14} />
                      </button>
                      <button
                        onClick={handlePostComment}
                        disabled={savingComment || !newComment.trim()}
                        className="bg-[#0b2540] text-white px-4 py-1.5 rounded-lg hover:bg-[#0a2037] text-xs font-bold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {savingComment && <Loader2 size={10} className="animate-spin" />}
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 text-left pl-11">
                Pro tip: press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-semibold text-[9px]">M</kbd> to comment
              </p>

              {/* Comments List */}
              <div className="space-y-4 pt-2">
                {loadingComments ? (
                  <div className="flex items-center justify-center py-6 text-slate-400 text-xs gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading comments...</span>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => {
                    const commentUser = comment.user || {};
                    const isOwnComment = commentUser.id === currentUser?.id;
                    return (
                      <div key={comment.id} className="flex items-start gap-3 group text-left">
                        <Avatar name={commentUser.name || "User"} size="sm" className="mt-0.5 shadow-sm" />
                        <div className="flex-1 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm relative">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className="text-xs font-bold text-slate-800">{commentUser.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">{formatDate(comment.created_at)}</span>
                              {(isOwnComment || isPm) && (
                                <button
                                  onClick={() => handleDeleteCommentLocal(comment.id)}
                                  className="text-slate-300 hover:text-red-600 transition-colors p-0.5 rounded opacity-0 group-hover:opacity-100"
                                  title="Hapus komentar"
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed break-words whitespace-pre-wrap">{comment.comment}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs italic">
                    Belum ada komentar. Jadilah yang pertama memberikan masukan!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Panel */}
          {activeTab === "history" && (
            <div className="space-y-3.5 text-left">
              {loadingActivities ? (
                <div className="flex items-center justify-center py-8 gap-2 text-xs text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memuat riwayat...</span>
                </div>
              ) : activities.length > 0 ? (
                activities.map((act: any) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs leading-relaxed text-slate-600">
                    <Avatar name={act.user?.name || "System"} size="xs" className="mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">{act.user?.name || "System"}</span>
                      {" "}{act.activity}
                      <span className="text-[9px] text-slate-400 block mt-0.5">{formatDate(act.created_at)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-6">Tidak ada riwayat aktivitas.</p>
              )}
            </div>
          )}

          {/* Work Log Panel */}
          {activeTab === "worklog" && (
            <div className="text-center py-8 space-y-2">
              <Clock className="mx-auto text-slate-300 stroke-[1.5]" size={36} />
              <p className="text-xs text-slate-500 font-bold">No work logged yet</p>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Track time spent working on this task by logging work sessions.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-left">
            <span>Created {formatDate(task.createdAt)}</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>Updated {formatDate(task.updatedAt)}</span>
          </div>

          <button 
            onClick={() => showToast.success("Configuring task settings...")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 hover:border-slate-350 rounded-lg text-[10px] font-bold text-slate-600 shadow-sm transition-all"
          >
            <Settings size={12} className="text-slate-500" />
            <span>Configure</span>
          </button>
        </div>

      </div>
    </div>
  );
};
