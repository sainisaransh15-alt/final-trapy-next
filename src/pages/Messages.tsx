'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, Loader2, ChevronRight, Car, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import Chat from '@/components/Chat';
import { retryAsync, handleError } from '@/lib/errorHandling';
import { MessageListSkeleton } from '@/components/skeletons';
import { NoMessages } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

interface Conversation {
  id: string;
  booking_id: string;
  other_user_id: string;
  other_user_name: string;
  ride_origin: string;
  ride_destination: string;
  departure_time: string;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
  is_driver: boolean;
}

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    setError(null);
    try {
      await retryAsync(async () => {
        // Fetch bookings where user is passenger
        const { data: passengerBookings, error: passengerError } = await supabase
          .from('bookings')
          .select(`
            id,
            rides (
              id,
              origin,
              destination,
              departure_time,
              driver_id,
              profiles!rides_driver_id_fkey (
                full_name
              )
            )
          `)
          .eq('passenger_id', user.id)
          .in('status', ['pending', 'confirmed']);

        if (passengerError) throw passengerError;

        // Fetch bookings where user is driver
        const { data: driverRides, error: driverError } = await supabase
          .from('rides')
          .select(`
            id,
            origin,
            destination,
            departure_time,
            bookings (
              id,
              status,
              passenger_id,
              profiles!bookings_passenger_id_fkey (
                full_name
              )
            )
          `)
          .eq('driver_id', user.id);

        if (driverError) throw driverError;

        const allConversations: Conversation[] = [];

        // Process passenger bookings
        for (const booking of passengerBookings || []) {
          if (!booking.rides) continue;

          // Get last message and unread count
          const { data: messages } = await supabase
            .from('messages')
            .select('content, created_at, sender_id, is_read')
            .eq('booking_id', booking.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const lastMessage = messages?.[0];
          
          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('booking_id', booking.id)
            .neq('sender_id', user.id)
            .eq('is_read', false);

          allConversations.push({
            id: `passenger-${booking.id}`,
            booking_id: booking.id,
            other_user_id: booking.rides.driver_id,
            other_user_name: booking.rides.profiles?.full_name || 'Driver',
            ride_origin: booking.rides.origin,
            ride_destination: booking.rides.destination,
            departure_time: booking.rides.departure_time,
            last_message: lastMessage?.content || null,
            last_message_time: lastMessage?.created_at || null,
            unread_count: unreadCount || 0,
            is_driver: false,
          });
        }

        // Process driver rides with bookings
        for (const ride of driverRides || []) {
          const activeBookings = ride.bookings?.filter(b => b.status !== 'cancelled') || [];
          
          for (const booking of activeBookings) {
            // Get last message and unread count
            const { data: messages } = await supabase
              .from('messages')
              .select('content, created_at, sender_id, is_read')
              .eq('booking_id', booking.id)
              .order('created_at', { ascending: false })
              .limit(1);

            const lastMessage = messages?.[0];
            
            // Count unread messages
            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('booking_id', booking.id)
              .neq('sender_id', user.id)
              .eq('is_read', false);

            allConversations.push({
              id: `driver-${booking.id}`,
              booking_id: booking.id,
              other_user_id: booking.passenger_id,
              other_user_name: booking.profiles?.full_name || 'Passenger',
              ride_origin: ride.origin,
              ride_destination: ride.destination,
              departure_time: ride.departure_time,
              last_message: lastMessage?.content || null,
              last_message_time: lastMessage?.created_at || null,
              unread_count: unreadCount || 0,
              is_driver: true,
            });
          }
        }

        // Sort by last message time (most recent first)
        allConversations.sort((a, b) => {
          if (!a.last_message_time && !b.last_message_time) return 0;
          if (!a.last_message_time) return 1;
          if (!b.last_message_time) return -1;
          return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        });

        setConversations(allConversations);
      }, {
        maxRetries: 2,
        retryDelay: 1000,
      });
    } catch (error) {
      setError('Failed to load conversations');
      handleError(error, 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 pt-24 pb-24 md:pb-12">
        <div className="container px-4 max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <MessageListSkeleton count={5} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 pt-24 pb-24 md:pb-12">
        <div className="container px-4 max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <ErrorState 
              type="network"
              message={error}
              onRetry={() => {
                setLoading(true);
                fetchConversations();
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-24 md:pb-12">
      <div className="container px-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        {conversations.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8">
            <NoMessages />
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveChat(conv)}
                className="w-full p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    conv.is_driver ? 'bg-emerald-light text-emerald' : 'bg-primary/10 text-primary'
                  }`}>
                    {conv.is_driver ? <Users className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{conv.other_user_name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          conv.is_driver 
                            ? 'bg-emerald-light text-emerald' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {conv.is_driver ? 'Passenger' : 'Driver'}
                        </span>
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <span className="truncate">{conv.ride_origin}</span>
                      <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{conv.ride_destination}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(conv.departure_time), 'MMM d, h:mm a')}
                    </p>
                    {conv.last_message && (
                      <p className={`text-sm mt-1 truncate ${conv.unread_count > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                        {conv.last_message}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {activeChat && (
        <Chat
          bookingId={activeChat.booking_id}
          otherUserId={activeChat.other_user_id}
          otherUserName={activeChat.other_user_name}
          onClose={() => {
            setActiveChat(null);
            fetchConversations(); // Refresh to update unread counts
          }}
        />
      )}
    </div>
  );
}
