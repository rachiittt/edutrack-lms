import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BookOpen, ClipboardList, Check, CheckCheck } from 'lucide-react';
import { notificationService, Notification } from '../services/notificationService';
import { formatDate } from '../utils/formatters';

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    void loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleClick = (notification: Notification) => {
    if (!notification.read) handleMarkRead(notification._id);
    if (notification.courseId) {
      navigate(`/courses/${notification.courseId}`);
      setIsOpen(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_material':
        return <BookOpen className="h-4 w-4 text-blue-400" />;
      case 'new_quiz':
        return <ClipboardList className="h-4 w-4 text-purple-400" />;
      default:
        return <Bell className="h-4 w-4 text-primary-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl border border-[#27272a] bg-[#111111] p-2.5 text-primary-400 transition-colors hover:bg-[#1d1d20] hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-[#27272a] bg-[#111111] shadow-2xl animate-slide-up">
          <div className="flex items-center justify-between border-b border-[#27272a] px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-primary-400 transition-colors hover:text-white"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-primary-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  onClick={() => handleClick(notification)}
                  className={`flex w-full items-start gap-3 border-b border-[#27272a] px-4 py-3 text-left transition-colors hover:bg-[#1d1d20] ${
                    !notification.read ? 'bg-blue-500/5' : ''
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#27272a] bg-[#09090b]">
                    {getIcon(notification.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-primary-300'}`}>
                      {notification.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-primary-500">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-[10px] text-primary-600">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
