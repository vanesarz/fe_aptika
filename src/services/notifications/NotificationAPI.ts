import { api } from '@/services/api';
import type { NotificationItem, NotificationListResponse, UnreadCountResponse } from '@/services/notifications/NotificationTypes';

export const getTaskNotifications = async (params?: { limit?: number; offset?: number }) => {
  const response = await api.get<NotificationListResponse>('/task-management/notifications', { params });
  return response.data;
};

export const getTaskNotificationUnreadCount = async () => {
  const response = await api.get<UnreadCountResponse>('/task-management/notifications/unread-count');
  return response.data;
};

export const markTaskNotificationAsRead = async (id: number) => {
  const response = await api.patch(`/task-management/notifications/${id}/read`);
  return response.data;
};

export const markAllTaskNotificationsAsRead = async () => {
  const response = await api.patch('/task-management/notifications/read-all');
  return response.data;
};

export const deleteTaskNotification = async (id: number) => {
  const response = await api.delete(`/task-management/notifications/${id}`);
  return response.data;
};

export const getTaskNotificationRedirectPath = (notification: NotificationItem) => {
  if (notification.task?.id && notification.board?.id) {
    return `/manajementugasdigital/board/${notification.board.id}?task=${notification.task.id}`;
  }

  if (notification.board?.id) {
    return `/manajementugasdigital/board/${notification.board.id}`;
  }

  return '/manajementugasdigital';
};
