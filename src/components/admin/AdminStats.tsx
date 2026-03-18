import { Users, Car, FileText, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Stats {
  totalUsers: number;
  totalRides: number;
  pendingVerifications: number;
  activeRides: number;
  totalBookings: number;
  activeSosAlerts: number;
  completedRides: number;
  totalRevenue: number;
}

interface AdminStatsProps {
  stats: Stats | null;
}

export function AdminStats({ stats }: AdminStatsProps) {
  if (!stats) return null;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
    { label: 'Total Rides', value: stats.totalRides, icon: Car, color: 'text-emerald' },
    { label: 'Active Rides', value: stats.activeRides, icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Completed', value: stats.completedRides, icon: Car, color: 'text-green-500' },
    { label: 'Pending Verifications', value: stats.pendingVerifications, icon: FileText, color: 'text-warning' },
    { label: 'Active SOS', value: stats.activeSosAlerts, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: DollarSign, color: 'text-purple-500' },
    { label: 'Est. Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald', isRevenue: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold">{stat.isRevenue ? stat.value : stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
