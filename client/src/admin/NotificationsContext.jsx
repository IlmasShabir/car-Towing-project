import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../api/notificationApi';

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const timerRef = useRef(null);

  const refreshUnread = useCallback(async () => {
    try {
      const { count } = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Keep last known value on transient errors
    }
  }, []);

  useEffect(() => {
    refreshUnread();
    timerRef.current = window.setInterval(refreshUnread, 30000);
    return () => window.clearInterval(timerRef.current);
  }, [refreshUnread]);

  const markRead = useCallback(
    async (id) => {
      const before = unreadCount;
      try {
        await markNotificationRead(id);
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (error) {
        setUnreadCount(before);
        throw error;
      }
    },
    [unreadCount],
  );

  const markAllRead = useCallback(async () => {
    const before = unreadCount;
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
    } catch (error) {
      setUnreadCount(before);
      throw error;
    }
  }, [unreadCount]);

  const remove = useCallback(async (id) => {
    await deleteNotification(id);
    refreshUnread();
  }, [refreshUnread]);

  return (
    <NotificationsContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        refreshUnread,
        markRead,
        markAllRead,
        remove,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};