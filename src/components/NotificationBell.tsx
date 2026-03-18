'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Loader2, MessageCircle, Car, AlertTriangle, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import BookingReviewModal from './BookingReviewModal';

type NotificationData = Record<string, unknown> | null;

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: NotificationData;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const subscribeToNotifications = useCallback(() => {
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          const n = payload.new as {
            id: string;
            type: string;
            title: string;
            message: string;
            data: unknown;
            is_read: boolean;
            created_at: string;
          };

          const newNotification: Notification = {
            ...n,
            data: (typeof n.data === 'object' && n.data !== null ? n.data : null) as NotificationData,
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      const mapped = (data || []).map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        data: (typeof n.data === 'object' && n.data !== null ? n.data : null) as NotificationData,
        is_read: n.is_read,
        created_at: n.created_at,
      } satisfies Notification));

      setNotifications(mapped);
      setUnreadCount(mapped.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    const unsubscribe = subscribeToNotifications();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, subscribeToNotifications, fetchNotifications]);


  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Handle different notification types
  const data = notification.data as NotificationData;
    
    switch (notification.type) {
      case 'booking_request':
      case 'booking_created':
        // Open the booking review modal
        if (data?.booking_id) {
          setSelectedBookingId(data.booking_id as string);
          setShowBookingModal(true);
          setOpen(false);
        }
        break;
      
      case 'booking_confirmed':
      case 'booking_cancelled':
        // Navigate to the ride details
        if (data?.ride_id) {
          router.push(`/ride/${data.ride_id}`);
          setOpen(false);
        } else if (data?.booking_id) {
          router.push('/dashboard');
          setOpen(false);
        }
        break;
      
      case 'new_message':
        // Navigate to messages
        if (data?.booking_id) {
          router.push(`/messages?booking=${data.booking_id}`);
          setOpen(false);
        } else {
          router.push('/messages');
          setOpen(false);
        }
        break;
      
      case 'ride_reminder':
      case 'ride_started':
      case 'ride_completed':
        if (data?.ride_id) {
          router.push(`/ride/${data.ride_id}`);
          setOpen(false);
        }
        break;
      
      case 'sos_alert':
        // Navigate to dashboard or admin for SOS
        router.push('/dashboard');
        setOpen(false);
        break;
      
      default:
        // Just mark as read, no navigation
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_request':
      case 'booking_created':
        return <User className="w-4 h-4" />;
      case 'booking_confirmed':
      case 'booking_cancelled':
        return <Car className="w-4 h-4" />;
      case 'new_message':
        return <MessageCircle className="w-4 h-4" />;
      case 'ride_reminder':
        return <Calendar className="w-4 h-4" />;
      case 'ride_started':
      case 'ride_completed':
        return <Car className="w-4 h-4" />;
      case 'sos_alert':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationStyle = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-muted text-muted-foreground';
    
    switch (type) {
      case 'booking_request':
      case 'booking_created':
        return 'bg-primary/10 text-primary';
      case 'booking_confirmed':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'booking_cancelled':
        return 'bg-destructive/10 text-destructive';
      case 'sos_alert':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  if (!user) return null;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                variant="destructive"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-popover" align="end">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Check className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>

          <ScrollArea className="h-80">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mb-2" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      !notification.is_read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        getNotificationStyle(notification.type, notification.is_read)
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Booking Review Modal */}
      <BookingReviewModal
        bookingId={selectedBookingId}
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedBookingId(null);
        }}
        onActionComplete={() => {
          fetchNotifications();
        }}
      />
    </>
  );
}
