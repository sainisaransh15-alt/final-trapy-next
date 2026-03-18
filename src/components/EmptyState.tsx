import { 
  Search, 
  Car, 
  MessageSquare, 
  Calendar, 
  Bell, 
  Users,
  MapPin,
  CreditCard,
  type LucideIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  type?: 'rides' | 'messages' | 'bookings' | 'notifications' | 'search' | 'passengers' | 'locations' | 'payments';
  className?: string;
}

const typeIcons: Record<string, LucideIcon> = {
  rides: Car,
  messages: MessageSquare,
  bookings: Calendar,
  notifications: Bell,
  search: Search,
  passengers: Users,
  locations: MapPin,
  payments: CreditCard,
};

export function EmptyState({ 
  icon: CustomIcon, 
  title, 
  description, 
  action,
  type,
  className = '' 
}: EmptyStateProps) {
  const Icon = CustomIcon || (type ? typeIcons[type] : Search);

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Pre-configured empty states
export function NoRidesFound({ onSearch }: { onSearch?: () => void }) {
  return (
    <EmptyState
      type="search"
      title="No rides found"
      description="Try adjusting your search filters or check back later for new rides."
      action={onSearch ? { label: 'Adjust filters', onClick: onSearch } : undefined}
    />
  );
}

export function NoMessages() {
  return (
    <EmptyState
      type="messages"
      title="No messages yet"
      description="Start a conversation by booking a ride or accepting a booking request."
    />
  );
}

export function NoBookings({ onFindRide }: { onFindRide?: () => void }) {
  return (
    <EmptyState
      type="bookings"
      title="No bookings yet"
      description="Book your first ride to get started."
      action={onFindRide ? { label: 'Find a ride', onClick: onFindRide } : undefined}
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      type="notifications"
      title="No notifications"
      description="You're all caught up! We'll notify you when something happens."
    />
  );
}

export function NoPublishedRides({ onPublish }: { onPublish?: () => void }) {
  return (
    <EmptyState
      type="rides"
      title="No published rides"
      description="Share your journey and earn money by publishing a ride."
      action={onPublish ? { label: 'Publish a ride', onClick: onPublish } : undefined}
    />
  );
}
