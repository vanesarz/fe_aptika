export type NotificationType =
  | "BOARD_INVITATION"
  | "JOIN_REQUEST"
  | "JOIN_APPROVED"
  | "JOIN_REJECTED"
  | "TASK_ASSIGNED"
  | "TASK_UPDATED"
  | "TASK_COMMENT"
  | "TASK_STATUS_CHANGED"
  | "TASK_DUE_SOON"
  | "BOARD_ARCHIVED"
  | "SYSTEM";

export interface NotificationUserSummary {
  id: number;
  name: string;
}

export interface NotificationBoardSummary {
  id: number;
  name: string;
}

export interface NotificationTaskSummary {
  id: number;
  title: string;
  status?: string;
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string | null;
  created_at?: string | null;
  board?: NotificationBoardSummary | null;
  task?: NotificationTaskSummary | null;
  created_by?: NotificationUserSummary | null;
}

export interface NotificationListResponse {
  success: boolean;
  data: NotificationItem[];
}

export interface UnreadCountResponse {
  count: number;
}
