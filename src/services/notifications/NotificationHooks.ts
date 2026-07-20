import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteTaskNotification,
  getTaskNotificationUnreadCount,
  getTaskNotifications,
  markAllTaskNotificationsAsRead,
  markTaskNotificationAsRead,
} from '@/services/notifications/NotificationAPI';
import type { NotificationItem } from '@/services/notifications/NotificationTypes';

const NOTIFICATION_QUERY_KEY = ['task-notifications'];
const UNREAD_COUNT_QUERY_KEY = ['task-notification-unread-count'];

export const useTaskNotifications = () => {
  const queryClient = useQueryClient();
  const [visibleCount, setVisibleCount] = useState(10);

  const notificationsQuery = useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEY],
    queryFn: () => getTaskNotifications({ limit: visibleCount, offset: 0 }),
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
    staleTime: 10000,
  });

  const unreadCountQuery = useQuery({
    queryKey: [...UNREAD_COUNT_QUERY_KEY],
    queryFn: getTaskNotificationUnreadCount,
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
    staleTime: 10000,
  });

  const notifications = useMemo(() => notificationsQuery.data?.data ?? [], [notificationsQuery.data]);
  const unreadCount = unreadCountQuery.data?.count ?? 0;

  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY }),
    ]);
  }, [queryClient]);

  const markAsRead = useCallback(async (id: number) => {
    await markTaskNotificationAsRead(id);
    await refresh();
  }, [refresh]);

  const markAllAsRead = useCallback(async () => {
    await markAllTaskNotificationsAsRead();
    await refresh();
  }, [refresh]);

  const removeNotification = useCallback(async (id: number) => {
    await deleteTaskNotification(id);
    await refresh();
  }, [refresh]);

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading || unreadCountQuery.isLoading,
    isError: notificationsQuery.isError || unreadCountQuery.isError,
    refresh,
    markAsRead,
    markAllAsRead,
    removeNotification,
    visibleCount,
    setVisibleCount,
  };
};
