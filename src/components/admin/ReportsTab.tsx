'use client';
import { useState, useEffect } from 'react';
import { 
  Flag, AlertTriangle, CheckCircle, XCircle, Clock, 
  Loader2, User, Car, Eye, MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_ride_id: string | null;
  category: string;
  description: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: 'bg-warning/10', text: 'text-warning', icon: Clock },
  reviewing: { bg: 'bg-primary/10', text: 'text-primary', icon: Eye },
  resolved: { bg: 'bg-emerald/10', text: 'text-emerald', icon: CheckCircle },
  dismissed: { bg: 'bg-muted', text: 'text-muted-foreground', icon: XCircle },
};

const CATEGORY_LABELS: Record<string, string> = {
  harassment: 'Harassment',
  fake_profile: 'Fake Profile',
  inappropriate_behavior: 'Inappropriate Behavior',
  safety_concern: 'Safety Concern',
  spam: 'Spam',
  other: 'Other',
};

export function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const updateData: any = { 
        status: newStatus,
        admin_notes: adminNotes || null,
      };

      if (newStatus === 'resolved' || newStatus === 'dismissed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: 'Report Updated',
        description: `Report marked as ${newStatus}`,
      });

      fetchReports();
      setSelectedReport(null);
      setAdminNotes('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update report',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'reviewing').length}
                </p>
                <p className="text-xs text-muted-foreground">Reviewing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'resolved').length}
                </p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <XCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'dismissed').length}
                </p>
                <p className="text-xs text-muted-foreground">Dismissed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            Reports ({reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reports found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const statusStyle = STATUS_STYLES[report.status] || STATUS_STYLES.pending;
                const StatusIcon = statusStyle.icon;

                return (
                  <div
                    key={report.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {report.reported_user_id ? (
                            <User className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Car className="w-4 h-4 text-muted-foreground" />
                          )}
                          <Badge variant="outline">{CATEGORY_LABELS[report.category]}</Badge>
                          <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-sm line-clamp-2">{report.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(report.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setAdminNotes(report.admin_notes || '');
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 pt-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{CATEGORY_LABELS[selectedReport.category]}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(selectedReport.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-sm">{selectedReport.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this report..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                {selectedReport.status === 'pending' && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedReport.id, 'reviewing')}
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Review'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 text-muted-foreground"
                  disabled={updating}
                  onClick={() => handleUpdateStatus(selectedReport.id, 'dismissed')}
                >
                  Dismiss
                </Button>
                <Button
                  className="flex-1 bg-emerald hover:bg-emerald/90"
                  disabled={updating}
                  onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resolve'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
