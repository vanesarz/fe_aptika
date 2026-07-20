import { create } from "zustand";
import { 
  getProjects, 
  getTasks, 
  createTask, 
  updateTaskStatus, 
  deleteTask, 
  getBoardMembers, 
  updateTask, 
  updateBoard,
  joinProject as joinProjectApi, 
  createProject,
  approveTask as approveTaskApi
} from "@/services/api";
import { showToast } from "@/components/ui/Toast";

export interface Task {
  id: number;
  title: string;
  code: string;
  priority: "high" | "medium" | "low";
  assigneeName: string | null;
  assigneeId: number | null;
  status: "todo" | "inprogress" | "inreview" | "done";
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  activities?: any[];
}

export interface Project {
  id: number;
  name: string;
  description: string;
  manager: string;
  deadline: string;
  members: { name: string; avatarUrl?: string }[];
  totalMembersCount: number;
  isJoined?: boolean;
  isPending?: boolean;
  type?: "web" | "mobile" | "api" | "security";
  created_by?: number;
  status?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
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
    status: fStatus,
    description: t.description || "",
    createdAt: t.created_at || t.createdAt,
    updatedAt: t.updated_at || t.updatedAt,
    activities: t.activities || []
  };
};

const mapFrontendToBackendStatus = (status: Task["status"]): "todo" | "in_progress" | "in_review" | "done" => {
  if (status === "inprogress") return "in_progress";
  if (status === "inreview") return "in_review";
  return status;
};

interface TaskStore {
  projects: Project[];
  tasks: Task[];
  members: any[];
  notifications: AppNotification[];
  currentUser: any | null;
  loadingProjects: boolean;
  loadingTasks: boolean;
  error: string | null;

  setCurrentUser: (user: any) => void;
  loadCurrentUser: () => void;
  fetchProjects: () => Promise<void>;
  addProject: (payload: { name: string; description: string; deadline: string; type: "web" | "mobile" | "api" | "security" }) => Promise<boolean>;
  joinProject: (id: number) => Promise<boolean>;
  fetchTasks: (projectId: number) => Promise<void>;
  addTask: (projectId: number, title: string, priority: "low" | "medium" | "high", assigneeId: number | null, columnKey: string, groupBy: string) => Promise<boolean>;
  modifyTaskStatus: (task: Task, nextFStatus: Task["status"]) => Promise<boolean>;
  modifyTaskStatusRaw: (taskId: number, nextFStatus: Task["status"]) => Promise<boolean>;
  assignTask: (taskId: number, assigneeId: number | null) => Promise<boolean>;
  removeTask: (taskId: number) => Promise<boolean>;
  completeSprint: (projectId: number) => Promise<boolean>;
  approveTask: (taskId: number) => Promise<boolean>;
  
  addNotification: (title: string, message: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  projects: [],
  tasks: [],
  members: [],
  notifications: [],
  currentUser: null,
  loadingProjects: false,
  loadingTasks: false,
  error: null,

  setCurrentUser: (user) => set({ currentUser: user }),

  loadCurrentUser: () => {
    if (typeof window !== "undefined") {
      const uStr = localStorage.getItem("user");
      if (uStr) {
        try {
          const user = JSON.parse(uStr);
          set({ currentUser: user });
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
    }
  },

  fetchProjects: async () => {
    set({ loadingProjects: true, error: null });
    try {
      const user = get().currentUser || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null);
      if (user && !get().currentUser) {
        set({ currentUser: user });
      }

      const res = await getProjects();
      if (res && res.data) {
        const mapped = res.data.map((b: any) => {
          // Check if current user is in members list with joined or accepted status
          const userJoined = b.members?.some((m: any) => m.user_id === user?.id && (m.membership_status === "joined" || m.membership_status === "accepted"));
          const userPending = b.members?.some((m: any) => m.user_id === user?.id && m.membership_status === "pending");
          return {
            ...b,
            manager: b.pm?.name || "Unknown",
            deadline: b.end_date,
            members: b.members?.filter((m: any) => m.membership_status === "joined" || m.membership_status === "accepted").map((m: any) => ({ name: m.user?.name || "Member" })) || [],
            totalMembersCount: b.members?.filter((m: any) => m.membership_status === "joined" || m.membership_status === "accepted").length || 0,
            isJoined: userJoined || b.created_by === user?.id,
            isPending: userPending
          };
        });
        set({ projects: mapped });
      } else {
        set({ projects: [] });
      }
    } catch (err: any) {
      console.error("Failed fetching projects:", err);
      set({ error: "Gagal memuat daftar proyek. Silakan coba beberapa saat lagi." });
    } finally {
      set({ loadingProjects: false });
    }
  },

  addProject: async (payload) => {
    try {
      const backendPayload = {
        name: payload.name,
        description: payload.description,
        end_date: payload.deadline,
        status: "active",
        visibility: "public" as const
      };
      await createProject(backendPayload as any);
      get().addNotification("Proyek Baru", `Proyek "${payload.name}" berhasil dibuat.`);
      await get().fetchProjects();
      return true;
    } catch (err) {
      console.error("Failed creating project:", err);
      return false;
    }
  },

  joinProject: async (id) => {
    try {
      const project = get().projects.find(p => p.id === id);
      await joinProjectApi(id);
      get().addNotification("Gabung Proyek", `Anda berhasil bergabung ke proyek "${project?.name || id}".`);
      await get().fetchProjects();
      return true;
    } catch (err) {
      console.error("Failed to join project:", err);
      return false;
    }
  },

  fetchTasks: async (projectId) => {
    set({ loadingTasks: true });
    try {
      const [tasksRes, membersRes] = await Promise.all([
        getTasks(projectId),
        getBoardMembers(projectId)
      ]);
      
      let mappedTasks: Task[] = [];
      if (tasksRes && tasksRes.data) {
        mappedTasks = tasksRes.data.map(mapBackendToFrontendTask);
      }
      
      let acceptedMembers: any[] = [];
      if (membersRes && membersRes.data) {
        acceptedMembers = membersRes.data.filter((m: any) => m.membership_status === "joined");
      }

      set({ tasks: mappedTasks, members: acceptedMembers });
    } catch (err) {
      console.error("Failed fetching tasks or members:", err);
      showToast.error("Gagal memuat tugas.");
    } finally {
      set({ loadingTasks: false });
    }
  },

  addTask: async (projectId, title, priority, assigneeId, columnKey, groupBy) => {
    let taskStatus: "todo" | "in_progress" | "in_review" | "done" = "todo";
    let taskPriority: "low" | "medium" | "high" = priority;
    let taskAssigneeId: number | null = assigneeId;

    if (groupBy === "status") {
      taskStatus = mapFrontendToBackendStatus(columnKey as Task["status"]);
    } else if (groupBy === "priority") {
      taskStatus = "todo";
      taskPriority = columnKey as "low" | "medium" | "high";
    } else if (groupBy === "assignee") {
      taskStatus = "todo";
      taskAssigneeId = columnKey === "unassigned" ? null : Number(columnKey);
    }

    try {
      await createTask({
        board_id: projectId,
        title: title.trim(),
        priority: taskPriority,
        status: taskStatus,
        assigned_to: taskAssigneeId
      });
      get().addNotification("Tugas Baru", `Tugas "${title.trim()}" berhasil dibuat.`);
      await get().fetchTasks(projectId);
      return true;
    } catch (err) {
      console.error("Failed to create task:", err);
      return false;
    }
  },

  modifyTaskStatus: async (task, nextFStatus) => {
    const prevTasks = get().tasks;
    // Optimistic Update
    set({
      tasks: prevTasks.map(t => t.id === task.id ? { ...t, status: nextFStatus } : t)
    });

    try {
      await updateTaskStatus(task.id, mapFrontendToBackendStatus(nextFStatus));
      get().addNotification("Update Tugas", `Tugas "${task.title}" dipindahkan ke status ${nextFStatus.toUpperCase()}.`);
      return true;
    } catch (err) {
      console.error("Failed to update status:", err);
      set({ tasks: prevTasks }); // Revert
      return false;
    }
  },

  modifyTaskStatusRaw: async (taskId, nextFStatus) => {
    const prevTasks = get().tasks;
    const task = prevTasks.find(t => t.id === taskId);
    if (!task) return false;

    set({
      tasks: prevTasks.map(t => t.id === taskId ? { ...t, status: nextFStatus } : t)
    });

    try {
      await updateTaskStatus(taskId, mapFrontendToBackendStatus(nextFStatus));
      get().addNotification("Update Tugas", `Tugas "${task.title}" dipindahkan ke status ${nextFStatus.toUpperCase()}.`);
      return true;
    } catch (err) {
      console.error("Failed to update status:", err);
      set({ tasks: prevTasks }); // Revert
      return false;
    }
  },

  assignTask: async (taskId, assigneeId) => {
    const prevTasks = get().tasks;
    const task = prevTasks.find(t => t.id === taskId);
    if (!task) return false;

    let targetName: string | null = null;
    if (assigneeId) {
      const m = get().members.find(member => member.user?.id === assigneeId);
      targetName = m?.user?.name || null;
    }

    set({
      tasks: prevTasks.map(t => t.id === taskId ? { ...t, assigneeId, assigneeName: targetName } : t)
    });

    try {
      await updateTask(taskId, { assigned_to: assigneeId });
      get().addNotification("Tugas Ditugaskan", `Tugas "${task.title}" ditugaskan ke ${targetName || "Unassigned"}.`);
      return true;
    } catch (err) {
      console.error("Failed to assign task:", err);
      set({ tasks: prevTasks }); // Revert
      return false;
    }
  },

  removeTask: async (taskId) => {
    const prevTasks = get().tasks;
    const task = prevTasks.find(t => t.id === taskId);
    if (!task) return false;

    set({
      tasks: prevTasks.filter(t => t.id !== taskId)
    });

    try {
      await deleteTask(taskId);
      get().addNotification("Tugas Dihapus", `Tugas "${task.title}" telah dihapus.`);
      return true;
    } catch (err) {
      console.error("Failed to delete task:", err);
      set({ tasks: prevTasks }); // Revert
      return false;
    }
  },

  completeSprint: async (projectId) => {
    try {
      await updateBoard(projectId, { status: "completed" });
      const project = get().projects.find(p => p.id === projectId);
      get().addNotification("Sprint Selesai", `Sprint untuk proyek "${project?.name || projectId}" berhasil diselesaikan.`);
      await get().fetchProjects();
      return true;
    } catch (err) {
      console.error("Failed to complete sprint:", err);
      return false;
    }
  },

  approveTask: async (taskId) => {
    try {
      const task = get().tasks.find(t => t.id === taskId);
      if (!task) return false;

      await approveTaskApi(taskId);
      get().addNotification("Tugas Disetujui", `Tugas "${task.title}" telah disetujui.`);
      return true;
    } catch (err) {
      console.error("Failed to approve task:", err);
      return false;
    }
  },

  addNotification: (title, message) => {
    const newNotification: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      read: false
    };
    set(state => ({
      notifications: [newNotification, ...state.notifications]
    }));
  },

  markNotificationAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  }
}));
