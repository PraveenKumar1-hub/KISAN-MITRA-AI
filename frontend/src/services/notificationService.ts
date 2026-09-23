import api from './api';

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  unread_count: number;
}

export async function fetchNotifications(): Promise<NotificationListResponse> {
  const response = await api.get<NotificationListResponse>('/api/notifications');
  return response.data;
}

export async function markNotificationAsRead(id: number): Promise<NotificationItem> {
  const response = await api.patch<NotificationItem>(`/api/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<{ success: boolean; message: string }> {
  const response = await api.post<{ success: boolean; message: string }>('/api/notifications/read-all');
  return response.data;
}
