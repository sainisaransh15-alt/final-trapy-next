'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, X, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { retryAsync, handleError } from '@/lib/errorHandling';

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean | null;
}

interface ChatProps {
  bookingId: string;
  otherUserId: string;
  otherUserName: string;
  onClose: () => void;
}

const MESSAGES_PER_PAGE = 50;
const TYPING_DEBOUNCE_MS = 1000;
const TYPING_TIMEOUT_MS = 3000;

export default function Chat({ bookingId, otherUserId, otherUserName, onClose }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingUpdateRef = useRef<number>(0);

  useEffect(() => {
    // First verify user has access to this chat
    const verifyAccess = async () => {
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase.rpc('can_access_booking_chat', {
          p_booking_id: bookingId,
          p_user_id: user.id,
        });
        
        if (error) throw error;
        
        if (!data) {
          setAuthorized(false);
          setLoading(false);
          handleError(new Error('Unauthorized'), 'You are not authorized to access this chat');
          return;
        }
        
        setAuthorized(true);
        fetchMessages();
        markMessagesAsRead();
      } catch (error) {
        handleError(error, 'Failed to verify chat access');
        setAuthorized(false);
        setLoading(false);
      }
    };
    
    verifyAccess();
    
    // Subscribe to realtime messages
    const messagesChannel = supabase
      .channel(`chat-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          if (payload.new.sender_id !== user?.id) {
            markMessagesAsRead();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === payload.new.id ? (payload.new as Message) : msg))
          );
        }
      )
      .subscribe();

    // Subscribe to typing indicators using Realtime Broadcast (no database needed)
    const typingChannel = supabase
      .channel(`typing-${bookingId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.user_id === otherUserId) {
          setIsOtherUserTyping(true);
          // Auto-hide after timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsOtherUserTyping(false);
          }, TYPING_TIMEOUT_MS);
        }
      })
      .on('broadcast', { event: 'stop_typing' }, (payload) => {
        if (payload.payload?.user_id === otherUserId) {
          setIsOtherUserTyping(false);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [bookingId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Broadcast typing status
  const broadcastTyping = useCallback(() => {
    if (!user) return;
    
    const now = Date.now();
    // Debounce - only send if enough time has passed since last update
    if (now - lastTypingUpdateRef.current < TYPING_DEBOUNCE_MS) return;
    
    lastTypingUpdateRef.current = now;
    
    supabase
      .channel(`typing-${bookingId}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user.id },
      });
  }, [bookingId, user]);

  // Broadcast stop typing
  const broadcastStopTyping = useCallback(() => {
    if (!user) return;
    
    supabase
      .channel(`typing-${bookingId}`)
      .send({
        type: 'broadcast',
        event: 'stop_typing',
        payload: { user_id: user.id },
      });
  }, [bookingId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (before?: string) => {
    try {
      await retryAsync(async () => {
        let query = supabase
          .from('messages')
          .select('*')
          .eq('booking_id', bookingId)
          .limit(MESSAGES_PER_PAGE);

        if (before) {
          // For loading older messages, order descending and get messages before the timestamp
          query = query.lt('created_at', before).order('created_at', { ascending: false });
        } else {
          // For initial load, get most recent messages in ascending order
          query = query.order('created_at', { ascending: true });
        }

        const { data, error } = await query;

        if (error) throw error;
        
        if (before) {
          // Reverse the data since we fetched in descending order, then prepend to existing messages
          const reversedData = (data || []).reverse();
          setMessages((prev) => [...reversedData, ...prev]);
        } else {
          setMessages(data || []);
        }
        
        setHasMore((data?.length || 0) === MESSAGES_PER_PAGE);
      }, {
        maxRetries: 2,
        retryDelay: 1000,
      });
    } catch (error) {
      handleError(error, 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user) return;
    try {
      // Update messages to mark as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('booking_id', bookingId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      // Non-critical - marking messages as read is a background operation
      console.error('Error marking messages as read (non-critical):', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    // Stop typing indicator when sending
    broadcastStopTyping();
    
    setSending(true);
    try {
      await retryAsync(async () => {
        const { error } = await supabase.from('messages').insert({
          booking_id: bookingId,
          sender_id: user.id,
          content: newMessage.trim(),
        });

        if (error) throw error;
      }, {
        maxRetries: 1,
        retryDelay: 1000,
      });
      
      setNewMessage('');
    } catch (error) {
      handleError(error, 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Broadcast typing when user types
    if (value.trim()) {
      broadcastTyping();
    } else {
      broadcastStopTyping();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
      <div className="bg-card w-full max-w-lg h-[80vh] md:h-[600px] md:rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold">Chat with {otherUserName}</h3>
            {isOtherUserTyping && (
              <p className="text-xs text-primary animate-pulse">typing...</p>
            )}
            {!isOtherUserTyping && (
              <p className="text-xs text-muted-foreground">Booking conversation</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {authorized === false ? (
            <div className="flex items-center justify-center h-full text-destructive">
              <p>You are not authorized to access this chat</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {hasMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => fetchMessages(messages[0]?.created_at)}
                >
                  Load older messages
                </Button>
              )}
              {messages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <p
                          className={`text-xs ${
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}
                        >
                          {format(new Date(message.created_at), 'h:mm a')}
                        </p>
                        {isOwn && (
                          <span className={`flex items-center ${message.is_read ? 'text-blue-400' : 'text-primary-foreground/50'}`}>
                            {message.is_read ? (
                              <CheckCheck className="w-3.5 h-3.5" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing indicator bubble */}
              {isOtherUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={authorized === false}
            />
            <Button onClick={handleSend} disabled={sending || !newMessage.trim() || authorized === false}>
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
